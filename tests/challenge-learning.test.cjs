/* Audit Mode Challenge V82.5.66 : exécuter node tests/challenge-learning.test.cjs */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};
for(const file of ['challenge-data.js','challenge-pedagogy.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const C=ctx.window.CE2_CHALLENGES,P=ctx.window.CE2_CHALLENGE_PEDAGOGY;
assert.equal(C.length,30);
assert.equal(P.generated,150);
assert.equal(P.repairedGroups,56);
assert.equal(P.repairedMissions,134);
const K=['ponctuation','dialogue','temps','verbe','negation'];
let checked=0;
for(const story of C){
 assert(story.missions.length>=26);
 for(const kind of K){
  const group=story.missions.filter(m=>m.kind===kind);
  assert(group.some(m=>m.mode==='choice'),story.id+' missing choice '+kind);
  assert(group.some(m=>m.mode==='highlight'),story.id+' missing highlight '+kind);
 }
 for(const m of story.missions){
  if(m.mode==='choice'){
   assert.equal(m.options.length,4);
   assert.equal(new Set(m.options).size,4);
   assert.equal(m.options.filter((_,i)=>i===m.correct).length,1);
   assert(m.prompt&&m.explanation&&m.words.length);
   assert.equal(P.grade(m,[],null,m.correct,[]).points,2);
   assert.equal(P.grade(m,[],null,(m.correct+1)%4,[]).points,0);
  }else{
   assert(m.answer.every(i=>i>=0&&i<story.tokens.length));
   const p=P.grade(m,m.answer,0,-1,[0]);
   assert.equal(p.points,2);
   assert.equal(P.grade(m,m.answer,4,-1,[0]).points,1);
   assert.equal(P.grade(m,[],0,-1,[0]).points,0);
   if(m.ambiguityResolved)assert(m.alternatives.length>=2);
  }
  checked++;
 }
}
const js=fs.readFileSync('challenge.js','utf8');
const slice=(begin,end)=>js.slice(js.indexOf(begin),js.indexOf(end,js.indexOf(begin)));
const startSrc=slice('function start(id){','// Les signes qui délimitent');
assert(startSrc.startsWith('function start(id)'));
let simulated=0;
for(const story of C){
 const db={history:{}};
 const state={};
 const D=C,root={scrollTop:0},counts={save:0,render:0};
 const create=new Function('D','state','rememberChallenge','render','root','alert',startSrc+'; return start;');
 const start=create(D,state,()=>counts.save++,()=>counts.render++,root,msg=>{throw Error(msg)});
 for(let n=0;n<50;n++){
   start(story.id);simulated++;
   assert.equal(state.questions.length,10);
   assert.equal(new Set(state.questions).size,10);
   assert.equal(state.questions.filter(m=>m.mode==='choice').length,5);
   assert.equal(state.questions.filter(m=>m.mode==='highlight').length,5);
   assert.equal(state.questions[0].mode,'highlight');
   for(const kind of K)assert.equal(state.questions.filter(m=>m.kind===kind).length,2);
 }
}
const index=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(index.indexOf('challenge-data.js?v=82566')<index.indexOf('challenge-pedagogy.js?v=82566'));
assert(index.indexOf('challenge-pedagogy.js?v=82566')<index.indexOf('challenge.js?v=82566'));
assert(sw.includes('"./challenge-pedagogy.js"'));
assert(js.includes('state.score+=graded.points'));
assert(js.includes('state.reviewing=true'));
assert(js.includes('saved.version===1&&saved.score%2!==0'));
console.log('OK — '+simulated+' parties Challenge simulées, '+checked+' missions validées, 134 anciennes réponses équivalentes acceptées ; barème 2/1/0.');
