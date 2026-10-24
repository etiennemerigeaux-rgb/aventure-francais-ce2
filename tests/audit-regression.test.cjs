// Exécuter avec : node tests/audit-regression.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=(name)=>fs.readFileSync(name,'utf8');
const load=(file,key)=>{const window={};vm.runInNewContext(read(file),{window});return window[key]};
const data=load('data.js','CE2_DATA'),challenges=load('challenge-data.js','CE2_CHALLENGES');
const game=read('game.js'),challenge=read('challenge.js'),serviceWorker=read('sw.js');
assert.equal(data.worlds.length,5);
assert.equal(data.worlds[1].name,'La Cité des dialogues');
assert.equal(data.worlds[1].icon,'💬');
assert.equal(data.worlds[1].questions.length,100);
assert.equal(data.examBank.filter(q=>q.world===1).length,100);
data.worlds.forEach(w=>assert.equal(w.questions.length,100));
for(const q of data.worlds.flatMap(w=>w.questions).concat(data.examBank)){
 assert.equal(q.options.length,4);
 assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
 assert(q.explanation);
}
assert.equal(data.examBank.length,500);
assert.equal(new Set(data.examBank.map(q=>q.id)).size,500);
const topics=['verbes','tirets','deux-points','guillemets','dialogue'];
for(const topic of topics){
 const bank=data.examBank.filter(q=>q.world===1&&q.topic===topic);
 assert.equal(bank.length,20);
 assert.deepEqual(['easy','medium','hard'].map(d=>bank.filter(q=>q.difficulty===d).length),[8,8,4]);
}
assert(game.includes("q.topic===['verbes','tirets','deux-points','guillemets','dialogue'][levelIndex]"));
assert(challenge.includes("ce2_v82526_clean_profiles"));
assert(!challenge.includes("ce2_v712_profiles"));
assert(game.includes('function exportProfiles()'));
assert(game.includes('activeId!==profileId'));
assert(game.includes('Elle comporte vingt-cinq questions'));
assert.equal(challenges.length,30);
for(const t of challenges)for(const m of t.missions){
 assert(m.answer.every(i=>Number.isInteger(i)&&i>=0&&i<t.tokens.length));
 assert(!/ce virgule|un virgule/.test(m.prompt+' '+m.explanation));
}
assert(serviceWorker.includes('key.startsWith(CACHE_PREFIX)'));
console.log('Audit CE2 : contrôles structurels réussis.');
