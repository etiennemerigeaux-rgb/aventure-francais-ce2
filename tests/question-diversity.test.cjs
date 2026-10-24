// Contrôle de diversité des questionnaires et de conservation des profils CE2.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('data.js','utf8'),ctx);
const W=JSON.parse(JSON.stringify(ctx.window.CE2_DATA.worlds));
const game=fs.readFileSync('game.js','utf8');
const select=game.slice(game.indexOf('function questionTopic('),game.indexOf('function ensureState('));
assert(select.startsWith('function questionTopic(')&&select.includes('function newQuestionRun('));
const expected={definition:2,identification:2,application:2,correction:2,comparaison:1,raisonnement:1};
for(const world of [2,3]){
 const qs=W[world].questions;
 assert.equal(qs.length,100);
 assert.equal(new Set(qs.map(x=>x.id)).size,100);
 assert.equal(new Set(qs.map(x=>x.q)).size,100);
 for(let family=0;family<10;family++){
   const group=qs.filter(x=>x.learningFamily===family);
   assert.equal(group.length,10,'Famille de question manquante : '+world+'/'+family);
   assert.deepEqual(group.map(x=>x.learningRound).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7,8,9]);
 }
 qs.forEach(q=>{
  assert(['definition','identification','application','correction','comparaison','raisonnement'].includes(q.learningType));
  assert(q.options.length===4&&new Set(q.options).size===4);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
  assert(q.explanation.length>=40,'Explication trop courte : '+q.id);
  assert(!/\bmaya\b/i.test(q.q.replaceAll('Maya','')),'Prénom Maya sans majuscule');
  assert(!/Dans « Dans /.test(q.q),'Début de question inutilement répété');
 });
 // 60 cycles aléatoires complets ; chaque groupe d'exercices doit apparaître,
 // aucun doublon sur cent questions et pas deux démarches identiques à la suite.
 for(let cycle=0;cycle<60;cycle++){
  const S={questionDecks:{},lastQuestionTopics:{},runQuestions:[]};
  const h={S,W,RUN_SIZE:10};vm.createContext(h);vm.runInContext(select,h);
  let all=new Set(),prev=null;
  for(let run=0;run<10;run++){
   vm.runInContext('newQuestionRun('+world+')',h);
   const indexes=Array.from(S.runQuestions),selected=indexes.map(i=>qs[i]);
   assert.equal(indexes.length,10);
   assert.equal(new Set(indexes).size,10);
   selected.forEach(q=>{assert(!all.has(q.id),'Question répétée avant 100 : '+q.id);all.add(q.id)});
   const counted=Object.fromEntries(Object.keys(expected).map(kind=>[kind,selected.filter(q=>q.learningType===kind).length]));
   assert.deepEqual(counted,expected,'Mauvaise variété dans le monde '+world+', aventure '+run);
   for(const q of selected){assert.notEqual(q.learningType,prev,'Deux types identiques de suite');prev=q.learningType;}
   assert(selected.every(q=>q.difficulty===(run<3?'easy':run<7?'medium':'hard')));
   const topics=selected.map(q=>q.learningFamily);
   assert.equal(new Set(topics).size,10,'Deux exercices de la même sous-famille dans une aventure');
  }
  assert.equal(all.size,100);
 }
 // Recharge des profils : les paquets de questions restants sont persistables.
 const S={questionDecks:{},lastQuestionTopics:{},runQuestions:[]};
 const fn=new Function('S','W','RUN_SIZE',select+'return newQuestionRun;')(S,W,10);
 fn(world);
 const serialized=JSON.parse(JSON.stringify(S));
 const fn2=new Function('S','W','RUN_SIZE',select+'return newQuestionRun;')(serialized,W,10);
 fn2(world);
 const first=new Set(S.runQuestions),second=new Set(serialized.runQuestions);
 assert([...first].every(i=>!second.has(i)),'La recharge a répété une question déjà validée');
 // Les index et ID d'origine sont conservés pour les sauvegardes existantes.
 for(let i=0;i<100;i++)assert.equal(qs[i].id,'v11-w'+(world+1)+'-'+String(i+1).padStart(3,'0'));
}
// La Cité des dialogues introduit deux définitions à chaque aventure,
 // sans sacrifier ses deux questions par compétence.
{
 const S={questionDecks:{},lastQuestionTopics:{},runQuestions:[]};
 const ctx={S,W,RUN_SIZE:10};vm.createContext(ctx);vm.runInContext(select,ctx);
 const seen=new Set();
 for(let run=0;run<10;run++){
  vm.runInContext('newQuestionRun(1)',ctx);
  const qs=Array.from(S.runQuestions).map(i=>W[1].questions[i]);
  assert.equal(qs.filter(q=>q.learningType==='definition').length,2,'Le dialogue doit proposer 2 définitions par partie');
  for(const topic of ['verbes','tirets','deux-points','guillemets','dialogue'])assert.equal(qs.filter(q=>q.topic===topic).length,2);
  for(const q of qs){assert(!seen.has(q.id));seen.add(q.id)}
 }
 assert.equal(seen.size,100);
}
console.log('Variété pédagogique : 1 200 aventures simulées, 100 questions uniques par cycle, 6 démarches et dialogue enrichi.');
