// Vérification des preuves textuelles, des missions corrigées et des 30 récits.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};
for(const filename of ['challenge-data.js','challenge-pedagogy.js','challenge-pilot.js'])
 vm.runInNewContext(fs.readFileSync(filename,'utf8'),ctx,{filename});
const stories=ctx.window.CE2_CHALLENGES;
const pilot=ctx.window.CE2_CHALLENGE_PILOT;
assert.equal(stories.length,30);
assert.equal(pilot.version,2);
const norm=x=>String(x).toLowerCase().replace(/[«».,!?:;]/g,' ').replace(/\s+/g,' ').trim();
for(let i=1;i<=10;i++){
 const ss=[1,2,3].map(l=>stories.find(s=>s.id==='C'+l+'-'+String(i).padStart(2,'0')));
 assert(ss.every(Boolean),'Les trois niveaux doivent exister pour les dix histoires');
 assert(ss[1].text.startsWith(ss[0].text),'Expert doit prolonger Explorateur : '+i);
 assert(ss[2].text.startsWith(ss[1].text),'Maître doit prolonger Expert : '+i);
 for(const s of ss){
  for(const m of s.missions){
   if(m.mode==='choice'||m.mode==='pilot')continue;
   assert(Array.isArray(m.answer),'Réponse absente : '+s.id);
   for(const [j,index] of m.answer.entries()){
    assert(Number.isInteger(index)&&index>=0&&index<s.tokens.length,'Indice hors récit : '+s.id+' '+m.prompt);
    assert.equal(s.tokens[index],m.words[j],'Texte et mot surligné incompatibles : '+s.id+' '+m.prompt);
   }
   for(const variant of m.alternatives||[])for(const index of variant)
    assert(Number.isInteger(index)&&index>=0&&index<s.tokens.length,'Variante obsolète : '+s.id+' '+m.prompt);
  }
 }
}
const pirates=[1,2].map(l=>stories.find(s=>s.id==='C'+(l+1)+'-01'));
for(const s of pirates){
 assert(s.text.includes('Tom ouvre un livre rempli de cartes marines.'),'La preuve des livres est absente');
 assert(s.text.includes('Lina répond : « Ils voulaient retrouver leur chemin ! »'));
 assert.equal(s.tokens.slice(84,93).join(' '),'Tom ouvre un livre rempli de cartes marines .');
}
for(const lvl of [2,3]){
 const s=stories.find(z=>z.id==='C'+lvl+'-05');
 assert(s.text.includes('Un journal raconte l’histoire des habitants du château.'));
 assert(s.text.includes('« Peut-on lire ce journal ? »'));
}
for(const lvl of [1,2,3]){
 const s=stories.find(z=>z.id==='C'+lvl+'-08');
 assert(s.text.includes('Hier, Noé a arrosé la terre dans cette partie du jardin.'));
 assert(!s.text.includes('Hier, Noé a semé des graines'));
}
let count=0;
for(const id of ['C2-01','C3-01']){
 const s=stories.find(st=>st.id===id);
 const ms=pilot.stories[id];
 assert.equal(ms.length,10);
 for(const m of ms){
  assert(m.proofQuotes?.length>0,'Preuve écrite manquante pour '+m.id);
  const excerpt=norm(s.tokens.slice(m.range[0],m.range[1]+1).join(' '));
  for(const quote of m.proofQuotes){
   assert(s.text.includes(quote),'Preuve absente du récit : '+m.id+' '+quote);
   assert(excerpt.includes(norm(quote)),'Preuve cachée hors du passage affiché : '+m.id+' '+quote);
  }
  assert.equal(new Set(m.options).size,4,'Quatre propositions distinctes '+m.id);
  assert(m.options[m.correct].trim().length>=3,'Réponse correcte vide ou illisible '+m.id);
  assert(m.help&&m.explanation,'Aide et explication requises '+m.id);
  count++;
 }
}
const mission9=pilot.stories['C2-01'][8];
assert.equal(mission9.question,'Pourquoi les pirates gardaient-ils des livres ?');
assert(mission9.options.every(answer=>answer.startsWith('Pour ')),'Toutes les réponses doivent répondre à POURQUOI');
assert(mission9.options[mission9.correct].includes('cartes marines'));
const engine=fs.readFileSync('challenge.js','utf8');
assert(engine.includes('pilotContentVersion:2'),'Version de migration des preuves requise');
assert(engine.includes("const migrateIndex=i=>"),'Les sélections antérieures doivent être transférées');
console.log('Cohérence validée : 30 histoires / 20 missions pilotes avec preuve affichée, 4 réponses distinctes, 20 explications, index et anciennes missions sûrs.');
