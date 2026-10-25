const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),challenge=fs.readFileSync('challenge.js','utf8');
const extract=(s,a,b)=>{const x=s.indexOf(a),y=s.indexOf(b,x+a.length);assert(x>=0&&y>x);return s.slice(x,y)};
const currentKey='ce2_v82526_clean_profiles';
const state={};
const storage={
 getItem:k=>Object.hasOwn(state,k)?state[k]:null,
 setItem:(k,v)=>{state[k]=String(v)},
 removeItem:k=>{delete state[k]}
};
let profiles={stable:{name:'Alice',firstName:'Alice',coins:44}},activeId='stable',updates=0;
storage.setItem(currentKey,JSON.stringify({profiles,activeId}));
const alerts=[];
const recovery={window:{}};vm.runInNewContext(fs.readFileSync('recovery.js','utf8'),recovery);
const context={window:recovery.window,profiles,activeId,PROFILE_KEY:currentKey,localStorage:storage,alert:(message)=>alerts.push(message),confirm:()=>true,update:()=>updates++,fresh:()=>({coins:0,completed:{},history:[],examHistory:[]})};
vm.createContext(context);
vm.runInContext(extract(game,'async function importProfiles(','function sessionLength('),context);
const backup={format:'royaume-ce2-backup',version:1,profiles:{stable:{name:'Bob',firstName:'Bob',coins:28,completed:{0:8},examHistory:[{score:16}]}},challenges:{stable:JSON.stringify({history:{'C1-01':{best:18}}})}};
const file={size:5000,text:async()=>JSON.stringify(backup)};
(async()=>{
 await vm.runInContext('importProfiles(file)',Object.assign(context,{file}));
 let result=JSON.parse(storage.getItem(currentKey));
 assert.equal(result.profiles.stable.coins,44,'Never overwrite existing child');
 assert.equal(Object.keys(result.profiles).length,2);
 const [restoredId]=Object.keys(result.profiles).filter(k=>k!=='stable');
 assert.equal(result.profiles[restoredId].coins,28);
 assert.equal(result.profiles[restoredId].completed[0],8);
 assert.equal(JSON.parse(storage.getItem('ce2_challenge_v8254_'+restoredId)).history['C1-01'].best,18);
 await vm.runInContext('importProfiles(file)',Object.assign(context,{file}));
 result=JSON.parse(storage.getItem(currentKey));
 assert.equal(Object.keys(result.profiles).length,3,'Repeated import creates new profiles instead of overwriting');
 const original=storage.getItem(currentKey);
 await vm.runInContext('importProfiles(file)',Object.assign(context,{file:{size:100,text:async()=>JSON.stringify({version:9,format:'royaume-ce2-backup',profiles:backup.profiles})}}));
 assert.equal(storage.getItem(currentKey),original,'Reject incompatible version without changes');
 // Le Challenge doit résoudre l'identifiant réellement actif et jamais l'ancienne clé.
 vm.runInContext(extract(challenge,'function profile(){','function key(){'),context);
 assert.equal(vm.runInContext('profile()',context),'stable');
 storage.setItem(currentKey,JSON.stringify({profiles:{...result.profiles},activeId:restoredId}));
 assert.equal(vm.runInContext('profile()',context),restoredId);
 storage.setItem(currentKey,JSON.stringify({profiles:{},activeId:'unknown'}));
 assert.equal(vm.runInContext('profile()',context),'guest');
 assert(updates>=2);
 console.log('Sauvegardes : import additif, résultats Challenge isolés, incompatibilités rejetées.');
})().catch(e=>{console.error(e);process.exitCode=1});
