// Tests comportementaux du tirage, exécutés sans navigateur et sans modifier les données.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function load(path,globalName){const context={window:{}};vm.runInNewContext(fs.readFileSync(path,'utf8'),context);return context.window[globalName]}
const D=load('data.js','CE2_DATA'),W=D.worlds,game=fs.readFileSync('game.js','utf8');
function excerpt(start,end){const i=game.indexOf(start),j=game.indexOf(end,i+start.length);assert(i>=0&&j>i,'Fonctions du moteur retrouvées');return game.slice(i,j)}
const select=excerpt('function questionTopic(', 'function ensureState(');
const S={questionDecks:{},lastQuestionTopics:{},runQuestions:null};
const ctx={W,S,RUN_SIZE:10};
vm.createContext(ctx);vm.runInContext(select,ctx);
for(let world=0;world<5;world++){
 const seen=new Set();
 for(let run=0;run<10;run++){
  vm.runInContext('newQuestionRun('+world+')',ctx);
  const draw=Array.from(S.runQuestions);
  assert.equal(draw.length,10);
  assert.equal(new Set(draw).size,10);
  draw.forEach(i=>{assert(Number.isInteger(i)&&i>=0&&i<100);assert(!seen.has(i), 'Question répétée avant fin du cycle, monde '+world);seen.add(i)});
  if(world===1){
   const topics=draw.map(i=>W[1].questions[i].topic);
   for(const topic of ['verbes','tirets','deux-points','guillemets','dialogue'])assert.equal(topics.filter(t=>t===topic).length,2);
   for(let i=1;i<topics.length;i++)assert.notEqual(topics[i],topics[i-1]);
  }
 }
 assert.equal(seen.size,100);
}
const EXAM_PATTERN=['easy','easy','medium','medium','hard'];
const E={examHistory:[]};
const ex={D,W,S:E,EXAM_PATTERN};
vm.createContext(ex);
vm.runInContext(excerpt('function buildExam(){','function startExam(){'),ex);
for(let run=0;run<4;run++){
 const chosen=Array.from(vm.runInContext('buildExam()',ex));
 assert.equal(chosen.length,25);
 assert.equal(new Set(chosen.map(q=>q.id)).size,25);
 for(let world=0;world<5;world++)assert.equal(chosen.filter(q=>q.world===world).length,5);
 for(const topic of ['verbes','tirets','deux-points','guillemets','dialogue'])assert.equal(chosen.filter(q=>q.world===1&&q.topic===topic).length,1);
 chosen.forEach(q=>{assert.equal(q.options.length,4);assert(q.answer>=0&&q.answer<4)});
 E.examHistory.push({items:chosen});
}
console.log('Gameplay: 500 questions consommées sans répétition prématurée, 4 évaluations de 25 questions équilibrées.');
