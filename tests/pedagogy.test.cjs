// Validation du contenu pédagogique CE2 et de la banque d'évaluation indépendante.
// Lancement : node tests/pedagogy.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const D=(()=>{const window={};vm.runInNewContext(fs.readFileSync('data.js','utf8'),{window});return JSON.parse(JSON.stringify(window.CE2_DATA))})();
const C=(()=>{const window={};vm.runInNewContext(fs.readFileSync('challenge-data.js','utf8'),{window});vm.runInNewContext(fs.readFileSync('challenge-pedagogy.js','utf8'),{window});return JSON.parse(JSON.stringify(window.CE2_CHALLENGES))})();
const {buildExamBank}=require('../scripts/build-exam-bank.cjs');
const game=fs.readFileSync('game.js','utf8'),ch=fs.readFileSync('challenge.js','utf8');
const bank=buildExamBank();
assert.equal(D.worlds.length,5);
assert(D.worlds.every(w=>w.questions.length===100));
assert.equal(D.examBank.length,500);
assert.equal(new Set(D.examBank.map(q=>q.id)).size,500);
assert.equal(new Set(D.examBank.map(q=>q.q.toLowerCase())).size,500);
const training=new Set(D.worlds.flatMap(w=>w.questions.map(q=>q.q.trim().toLowerCase())));
assert(bank.every(q=>!training.has(q.q.trim().toLowerCase())),'Les examens doivent être distincts des entraînements');
assert.deepEqual(D.examBank,bank,'La banque sauvegardée doit rester reproductible');
for(const [w,world] of D.worlds.entries()){
 assert.equal(world.questions.length,100);
 const combined=[...world.questions,...bank.filter(q=>q.world===w)];
 assert.equal(combined.length,200);
 assert.equal(new Set(world.questions.map(q=>q.id)).size,100);
 for(const q of combined){
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4,'Propositions distinctes pour '+q.id);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,'Bonne réponse valide '+q.id);
  assert(q.explanation.length>=28,'Explication significative '+q.id);
 }
 const exam=bank.filter(q=>q.world===w);
 const dif=Object.fromEntries(['easy','medium','hard'].map(k=>[k,exam.filter(q=>q.difficulty===k).length]));
 assert.deepEqual(dif,{easy:40,medium:40,hard:20});
}
const topics=['verbes','tirets','deux-points','guillemets','dialogue'];
for(const topic of topics){
 const qs=D.worlds[1].questions.filter(q=>q.topic===topic);
 assert.equal(qs.length,20);
 assert.deepEqual(Object.fromEntries(['easy','medium','hard'].map(d=>[d,qs.filter(q=>q.difficulty===d).length])),{easy:10,medium:6,hard:4});
 const e=bank.filter(q=>q.world===1&&q.topic===topic);
 assert.equal(e.length,20);
 assert.deepEqual(Object.fromEntries(['easy','medium','hard'].map(d=>[d,e.filter(q=>q.difficulty===d).length])),{easy:8,medium:8,hard:4});
}
assert(D.worlds[1].questions.filter(q=>q.topic==='verbes').every(q=>!/»\s*,\s*\w+\s+\w+/.test(q.q)),'Syntaxe incorrecte des incises de dialogue');
assert(D.worlds[1].questions.every(q=>!(q.q.startsWith('Dans « ')&&(q.q.match(/«/g)||[]).length>1)),'Guillemets imbriqués dans le monde Dialogue');
const ranges=[[55,65],[90,105],[120,145]];
assert.equal(C.length,30);
assert.deepEqual([0,1,2].map(level=>C.filter(x=>x.level===level).length),[10,10,10]);
let allMissions=0;
for(const story of C){
 const words=story.text.trim().split(/\s+/).length;
 assert(words>=ranges[story.level][0]&&words<=ranges[story.level][1],'Longueur de '+story.id+': '+words);
 for(const t of ['ponctuation','dialogue','temps','verbe','negation'])assert(story.missions.filter(m=>m.kind===t).length>=2,story.id+' manque des missions '+t);
 for(const m of story.missions){
  allMissions++;
  if(m.mode==='choice'){
   assert.equal(m.options.length,4);
   assert.equal(new Set(m.options).size,4);
   assert(Number.isInteger(m.correct)&&m.correct>=0&&m.correct<4);
  }else{
   assert(m.answer.length>0);
   assert(m.answer.every(i=>Number.isInteger(i)&&i>=0&&i<story.tokens.length));
   assert.deepEqual(m.words,m.answer.map(i=>story.tokens[i]));
  }
  if(m.kind==='ponctuation')assert(!/^Le signe /.test(m.explanation),'Explication trop pauvre : '+story.id);
 }
}
assert.equal(allMissions,1301);
// Contrôle de la composition des dix questions sur les 30 histoires.
const startSource=ch.slice(ch.indexOf('function start(id){'),ch.indexOf('// Les signes',ch.indexOf('function start(id){')));
assert(startSource.startsWith('function start(id){'));
for(const story of C){
 const state={},root={scrollTop:0},render=()=>{},rememberChallenge=()=>{};
 const start=new Function('D','state','root','render','rememberChallenge','alert',startSource+'return start;')(C,state,root,render,rememberChallenge,()=>{});
 start(story.id);
 assert.equal(state.questions.length,10);
 for(const topic of ['ponctuation','dialogue','temps','verbe','negation'])assert.equal(state.questions.filter(q=>q.kind===topic).length,2,story.id+' mal réparti sur '+topic);
 assert.equal(new Set(state.questions).size,10);
}
// Test des dix aventures successives, sans doublon, avec difficulté croissante.
const select=game.slice(game.indexOf('function questionTopic('),game.indexOf('function ensureState('));
const runtime={window:{}};
for(const file of ['data.js','pedagogy.js','punctuation-rich.js','lunettes-rich.js','dialogue-pedagogy.js']){
 vm.runInNewContext(fs.readFileSync(file,'utf8'),runtime);
}
const activeWorlds=runtime.window.CE2_DATA.worlds;
for(let world=0;world<5;world++){
 const S={questionDecks:{},lastQuestionTopics:{},pedagogicalTurns:{}};
 const context={S,W:activeWorlds,RUN_SIZE:10,window:runtime.window};
 vm.createContext(context);vm.runInContext(select,context);
 let seen=new Set(),averages=[];
 for(let run=0;run<10;run++){
  vm.runInContext('newQuestionRun('+world+')',context);
  const drawn=Array.from(S.runQuestions);
  assert.equal(drawn.length,10); assert.equal(new Set(drawn).size,10);
  drawn.forEach(i=>{assert(!seen.has(i));seen.add(i)});
  const ranks={easy:0,medium:1,hard:2};
  averages.push(drawn.reduce((a,i)=>a+ranks[activeWorlds[world].questions[i].difficulty],0)/10);
  if(world===1){
   const tags=drawn.map(i=>activeWorlds[1].questions[i].topic);
   topics.forEach(t=>assert.equal(tags.filter(x=>x===t).length,2));
   for(let i=1;i<tags.length;i++)assert.notEqual(tags[i],tags[i-1]);
  }
 }
 assert.equal(seen.size,100,'Questions non couvertes dans '+world);
 for(let i=1;i<averages.length;i++)assert(averages[i]+.001>=averages[i-1], 'Difficulté non progressive : '+world+' '+averages.join(','));
}
console.log('Pédagogie CE2 : 500 questions inédites, 500 entraînements, 1 301 missions, 30 histoires et difficulté graduée vérifiées.');
