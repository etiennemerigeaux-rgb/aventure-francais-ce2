// Contrôleur pédagogique CE2 : contenu, diversité, cycles et progression.
// Exécution: node tests/question-variety.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('data.js','utf8'),ctx);
const D=JSON.parse(JSON.stringify(ctx.window.CE2_DATA));
const code=fs.readFileSync('game.js','utf8');
const selection=code.slice(code.indexOf('function questionTopic('),code.indexOf('function ensureState('));
const expected={definition:2,identification:2,application:2,correction:2,comparaison:1,raisonnement:1};
assert.equal(Object.values(expected).reduce((a,b)=>a+b),10);
for(const world of [2,3]){
 const questions=D.worlds[world].questions;
 assert.equal(questions.length,100);
 assert.equal(new Set(questions.map(q=>q.q)).size,100);
 const byId=new Map(questions.map(q=>[q.id,q]));
 assert.equal(byId.size,100);
 for(const [index,q] of questions.entries()){
  assert.equal(q.learningFamily,index%10,'Famille stable et compatible avec le profil : '+q.id);
  assert.equal(q.learningRound,Math.floor(index/10),'Palier stable : '+q.id);
  assert(['definition','identification','application','correction','comparaison','raisonnement'].includes(q.learningType),q.id);
  assert.equal(q.options.length,4,q.id);
  assert.equal(new Set(q.options).size,4,q.id);
  assert(q.options[q.answer],q.id);
  assert(q.explanation&&q.explanation.length>35,q.id+' nécessite une explication pédagogique');
  assert(q.q.length>=28&&q.q.length<350,q.id+' longueur inadaptée');
  assert(!/de les élèves\b|de des peintres\b|,\s*maya\b/i.test(q.q),q.id+' formulation maladroite');
  if(world===2&&q.learningFamily===2){
   const sentence=q.q.match(/« ([^»]+) »/)?.[1];
   assert(sentence,'Phrase repérable '+q.id);
   for(const option of q.options)assert(sentence.toLocaleLowerCase('fr').includes(option.toLocaleLowerCase('fr')),q.id+' option inexistante dans la phrase: '+option);
  }
 }
 const S={questionDecks:{},lastQuestionTopics:{}},simulation={S,W:D.worlds,RUN_SIZE:10};vm.createContext(simulation);vm.runInContext(selection,simulation);
 for(let cycle=0;cycle<4;cycle++){
  const seen=new Set(),previous=cycle===0?null:S.lastQuestionTopics[world],rank={easy:0,medium:1,hard:2};
  let recent=previous,averages=[];
  for(let run=0;run<10;run++){
   vm.runInContext('newQuestionRun('+world+')',simulation);
   const indexes=Array.from(S.runQuestions);
   assert.equal(indexes.length,10);
   assert.equal(new Set(indexes).size,10);
   const types={};
   for(const i of indexes){
    assert(Number.isInteger(i)&&i>=0&&i<100);
    assert(!seen.has(i),'Question dupliquée avant la fin du cycle '+world+'/'+cycle+'/'+run);
    seen.add(i);
    const kind=questions[i].learningType;
    types[kind]=(types[kind]||0)+1;
    assert.notEqual(kind,recent,'Démarches consécutives identiques '+world+'/'+cycle+'/'+run);
    recent=kind;
   }
   assert.deepEqual(types,expected,'Répartition pédagogique incomplète '+world+'/'+cycle+'/'+run);
   averages.push(indexes.reduce((s,i)=>s+rank[questions[i].difficulty],0)/10);
  }
  assert.equal(seen.size,100,'100 questions uniques par cycle');
  for(let i=1;i<averages.length;i++)assert(averages[i]>=averages[i-1],'Difficulté ne progresse pas '+world+' '+averages);
 }
}
// Les cinq mondes, la banque d'évaluation et les identifiants historiques subsistent.
assert.equal(D.worlds.length,5);
assert.equal(D.examBank.length,500);
assert(D.worlds.every(w=>w.questions.length===100));
const known=new Set(D.worlds.flatMap(w=>w.questions.map(q=>q.q.toLowerCase().trim())));
assert(D.examBank.every(q=>!known.has(q.q.toLowerCase().trim())),'Evaluations indépendantes');
console.log('CE2 : 80 parties simulées, 4 cycles par monde, aucun doublon et six démarches réparties 2+2+2+2+1+1.');
