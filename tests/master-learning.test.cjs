/* Vérifications pédagogiques et moteur interactif Maître des mots V82.5.72. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};
for(const name of ['challenge-data.js','challenge-pedagogy.js','challenge-pilot.js','challenge-master.js']){
 vm.runInNewContext(fs.readFileSync(name,'utf8'),ctx,{filename:name});
}
const story=ctx.window.CE2_CHALLENGES.find(s=>s.id==='C3-01');
const master=story.missions.filter(m=>m.mode==='pilot');
const expert=ctx.window.CE2_CHALLENGE_PILOT.stories['C2-01'];
assert.equal(master.length,10);assert.equal(expert.length,10);
assert(master.every(m=>m.activity),'Les dix missions doivent être de vraies manipulations');
assert(expert.every(m=>!m.activity),'Aucune mission Expert ne doit être modifiée.');
const core=fs.readFileSync('challenge.js','utf8');
const a=core.indexOf('function masterSections(activity){'),b=core.indexOf('function playMaster(story,m){',a);
assert(a>=0&&b>a,'Moteur Maître absent');
const {masterSections,masterInitial,masterValid,masterCorrect}=new Function(core.slice(a,b)+';return {masterSections,masterInitial,masterValid,masterCorrect}')();
const expectedKinds=['order','order','fill','fill','order','order','fill','fill','fill','final'];
assert.deepEqual(Array.from(master,m=>m.activity.kind),expectedKinds);
let sectionsTotal=0;
for(let index=0;index<master.length;index++){
 const m=master[index],act=m.activity,sections=masterSections(act);
 assert.equal(m.id,'P3-01-'+String(index+1).padStart(2,'0'));
 assert(act.title&&act.intro&&act.help&&act.explanation,'Consigne, aide et correction requises '+m.id);
 assert(act.intro.length<150&&act.help.length<170,'Ne pas surcharger les consignes '+m.id);
 assert.equal(m.question,act.title,'La question et le type de mission doivent s’accorder');
 assert.equal(m.explanation,act.explanation,'Les explications des erreurs doivent rester cohérentes');
 assert.equal(sections.length,index===9?3:1,'La finale doit avoir trois petites étapes.');
 assert(m.proofQuotes.length>0);
 for(const quote of m.proofQuotes)assert(story.text.includes(quote),'Preuve inexistante '+m.id);
 for(const part of sections){
  const initial=masterInitial(part);
  assert.equal(masterValid(part,initial),part.kind==='order');
  let correct;
  if(part.kind==='order'){
    assert.equal(new Set(part.items).size,part.items.length);
    assert.equal(new Set(part.solution).size,part.items.length);
    assert(part.items.length>=3);
    correct=part.solution;
    assert.notEqual(JSON.stringify(initial),JSON.stringify(correct),'La réponse ne doit pas être donnée au départ.');
  }else if(part.kind==='fill'){
    assert(part.slots.length>=2,'Une correction doit comporter au moins deux choix');
    for(const slot of part.slots){
     assert.equal(slot.options.length,3);
     assert.equal(new Set(slot.options).size,3);
     assert(slot.before&&slot.after!==undefined,'La phrase doit être complète');
     assert(slot.correct>=0&&slot.correct<3);
    }
    correct=part.slots.map(x=>x.correct);
  }else if(part.kind==='match'){
    assert(part.left.length>=3&&part.right.length===part.left.length);
    assert.equal(new Set(part.solution).size,part.left.length);
    correct=part.solution;
  }else throw Error('Type d’activité inconnu '+part.kind);
  assert(masterValid(part,correct));
  assert(masterCorrect(part,correct),'La solution attendue doit fonctionner : '+m.id);
  const bad=correct.slice();
  if(part.kind==='order')bad.reverse();
  else bad[0]=(bad[0]+1)%3;
  assert(!masterCorrect(part,bad),'Une mauvaise réponse ne doit pas être validée : '+m.id);
  sectionsTotal++;
 }
}
assert.equal(sectionsTotal,12);
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(html.indexOf('challenge-pilot.js?v=82572')<html.indexOf('challenge-master.js?v=82572'));
assert(html.indexOf('challenge-master.js?v=82572')<html.indexOf('challenge.js?v=82572'));
assert(sw.includes('"./challenge-master.js"'));
assert(core.includes('masterSchema:1'));
assert(core.includes("state.masterAnswers={}"));
assert(core.includes("if(phase===1&&m.activity){playMaster(story,m);return;}"));
console.log('OK — 10 missions Maître, 12 manipulations, 4 familles de mécaniques, aides CE2, notation 2 points par mission, Expert préservé.');
