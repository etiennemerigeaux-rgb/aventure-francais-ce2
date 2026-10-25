// Contrôle pédagogique de l’histoire pilote avant publication.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('challenge-data.js','utf8'),ctx,{filename:'challenge-data.js'});
vm.runInNewContext(fs.readFileSync('challenge-pedagogy.js','utf8'),ctx,{filename:'challenge-pedagogy.js'});
const original=Object.fromEntries(['C2-01','C3-01'].map(id=>[id,ctx.window.CE2_CHALLENGES.find(s=>s.id===id).missions.map(m=>m.prompt)]));
vm.runInNewContext(fs.readFileSync('challenge-pilot.js','utf8'),ctx,{filename:'challenge-pilot.js'});
const P=ctx.window.CE2_CHALLENGE_PILOT;
assert.equal(P.version,2);
assert.equal(P.level1.intro.length,3);assert.equal(P.level2.intro.length,3);
const ALL=['ponctuation','dialogue','temps','verbe','negation'];
const tags=new Set();
for(const [id,level] of [['C2-01',1],['C3-01',2]]){
 const story=ctx.window.CE2_CHALLENGES.find(s=>s.id===id),ms=story.missions.filter(m=>m.mode==='pilot');
 assert.equal(ms.length,10);
 assert.equal(story.missions.length,original[id].length+10);
 assert.deepEqual(Array.from(story.missions.slice(0,original[id].length),m=>m.prompt),Array.from(original[id]));
 assert.equal(new Set(ms.map(m=>m.question)).size,10,'Dix questions distinctes : '+id);
 assert.equal(new Set(ms.map(m=>m.id)).size,10);
 for(const kind of ALL)assert.equal(ms.filter(m=>m.kind===kind).length,2,'Deux missions '+kind+' : '+id);
 const colored=new Set();
 for(const m of ms){
  assert.equal(m.level,level);
  assert.equal(m.options.length,4);
  assert.equal(new Set(m.options).size,4);
  assert(m.correct>=0&&m.correct<4);
  assert(m.task.length>22&&m.task.length<180,'Consigne accessible : '+m.id);
  assert(m.question.length<180);
  assert(m.help.length>15&&m.explanation.length>30);
  assert(m.range[0]>=0&&m.range[1]<story.tokens.length);
  assert(m.evidence.length>=1&&m.evidence.length<=4);
  assert.equal(new Set(m.evidence.map(item=>item[0])).size,m.evidence.length);
  for(const [i,c] of m.evidence){
   assert(i>=m.range[0]&&i<=m.range[1],'Indice hors extrait '+m.id);
   assert(c>=0&&c<=4);colored.add(c);
  }
  assert(!tags.has(m.id));tags.add(m.id);
 }
 assert(colored.size>=4,'Les surligneurs doivent être mobilisés dans chaque niveau');
}
assert.equal(tags.size,20);
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(html.indexOf('challenge-data.js?v=82571')<html.indexOf('challenge-pedagogy.js?v=82571'));
assert(html.indexOf('challenge-pedagogy.js?v=82571')<html.indexOf('challenge-pilot.js?v=82571'));
assert(html.indexOf('challenge-pilot.js?v=82571')<html.indexOf('challenge.js?v=82571'));
assert(sw.includes('"./challenge-pilot.js"'));
const engine=fs.readFileSync('challenge.js','utf8');
assert(engine.includes('function playPilot(story,m){'));
assert(engine.includes('state.pilotMarks[k]=state.pilotColor'));
assert(engine.includes("pilotPhase:state.pilotPhase||0"));
assert(engine.includes("if(m.mode==='pilot'){playPilot(story,m);return;}"));
console.log('OK — Histoire pilote : 20 missions, 5 compétences, contenus vérifiés, index des anciennes questions conservés, PWA et sauvegardes prises en compte.');
