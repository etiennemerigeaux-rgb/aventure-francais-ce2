// Test de non-régression pédagogique — lancer : node tests/pedagogie.test.cjs
// Sans dépendances externes, sans connexion Internet, sans profil d'enfant.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const load=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const ctx={window:{}};
vm.runInNewContext(load('data.js'),ctx,{filename:'data.js'});
vm.runInNewContext(load('pedagogy.js'),ctx,{filename:'pedagogy.js'});
vm.runInNewContext(load('dialogue-pedagogy.js'),ctx,{filename:'dialogue-pedagogy.js'});
const worlds=ctx.window.CE2_DATA.worlds;
assert.equal(worlds.length,5,'Il doit rester cinq mondes.');
const g=load('game.js');
const start=g.indexOf('function questionTopic(');
const end=g.indexOf('function ensureState()',start);
assert(start>=0&&end>start,'Contrôleur pédagogique absent ou déplacé.');
const selectorFactory=new Function('W','S','RUN_SIZE','window',g.slice(start,end)+'\nreturn newQuestionRun;');
let sessions=0;
const quotas={definition:2,identification:2,application:2,correction:2,comparaison:1,raisonnement:1};
for(let world=0;world<worlds.length;world++){
 const bank=worlds[world].questions;
 assert.equal(bank.length,100,'Chaque monde doit contenir 100 questions.');
 for(const q of bank){
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4,'Choix identiques : '+q.id);
  assert(q.answer>=0&&q.answer<4,'Réponse hors limites : '+q.id);
  assert(q.q&&q.explanation&&q.id,'Question incomplète.');
 }
 const state={questionDecks:{},lastQuestionTopics:{},pedagogicalTurns:{},runQuestions:[]};
 const newQuestionRun=selectorFactory(worlds,state,10,ctx.window);
 const visited=new Set();
 for(let session=0;session<200;session++){
  newQuestionRun(world);
  const indices=state.runQuestions;
  assert.equal(indices.length,10,'Une session doit avoir 10 questions.');
  assert.equal(new Set(indices).size,10,'Question répétée dans une partie.');
  const chosen=indices.map(i=>bank[i]);
  assert(chosen.every(Boolean),'Index de question hors de la banque.');
  if(session<10)for(const i of indices){
    assert(!visited.has(i),'Question répétée avant la fin du cycle de 100.');
    visited.add(i);
  }
  if(world===1){
   const byTopic={};
   chosen.forEach((q,i)=>{
    byTopic[q.topic]=(byTopic[q.topic]||0)+1;
    if(i>0)assert.notEqual(chosen[i-1].topic,q.topic,'Deux notions identiques consécutives.');
    if(i>=5)assert.equal(q.learningPhase,'réinvestissement');
   });
   assert.equal(Object.keys(byTopic).length,5);
   assert(Object.values(byTopic).every(n=>n===2),'Il faut deux questions par notion.');
  }
  if(world===2||world===3){
   const byType={};
   chosen.forEach(q=>{byType[q.learningType]=(byType[q.learningType]||0)+1;});
   for(const [type,n] of Object.entries(quotas))assert.equal(byType[type],n,'Quota incorrect : '+type);
  }
  if(world===0||world===4){
   const families=indices.map(i=>world===0?Math.floor(i/10):i%10);
   assert.equal(new Set(families).size,10,'Il faut dix familles distinctes.');
  }
  sessions++;
 }
 assert.equal(visited.size,100,'Les 100 questions doivent être parcourues sur dix parties.');
 console.log('OK : '+worlds[world].name+' — 200 parties.');
}
const enriched=worlds[1].questions.filter(q=>q.learningPhase==='réinvestissement');
assert.equal(enriched.length,50);
const histogram=[0,0,0,0];
for(const q of enriched)histogram[q.answer]++;
assert(Math.max(...histogram)-Math.min(...histogram)<=1,'Les bonnes réponses doivent être équilibrées.');
console.log('SUCCÈS : '+sessions+' parties simulées ; réponse A/B/C/D : '+histogram.join('/')+'.');
