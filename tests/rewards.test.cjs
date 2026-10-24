// Vérification des 30 récompenses, de la migration des profils anciens et du Challenge.
// Exécuter depuis la racine du dépôt : node tests/rewards.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const game=fs.readFileSync('game.js','utf8');
const challengeJs=fs.readFileSync('challenge.js','utf8');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('challenge-data.js','utf8'),ctx);
const challenges=ctx.window.CE2_CHALLENGES;
const source=(s,start,end)=>{const i=s.indexOf(start),j=s.indexOf(end,i+start.length);assert(i>=0&&j>i,'Section introuvable : '+start);return s.slice(i,j)};
const state=()=>({world:0,hero:0,step:10,correct:10,runId:'new-run',history:[],completed:{},awarded:{},rewardStats:null,coins:0,attempts:{},worldRuns:{},examHistory:[],screen:'finish',runQuestions:[0,1,2,3,4,5,6,7,8,9]});
function harness(S){
 const root={innerHTML:''},buttons={};
 const $=id=>(buttons[id]??={onclick:null});
 let saves=0;
 const ensure=new Function('S',source(game,'function ensureState(){','function storeProfiles(){')+'return ensureState()').bind(null,S);
 const finish=new Function('S','root','$','sessionLength','ensureState','save','burst','pic','go',source(game,'function finish(){','function restoreAnswer(){')+'return finish()')
  .bind(null,S,root,$,()=>10,ensure,()=>{saves++},()=>{},()=>'',()=>{});
 return {root,ensure,finish,buttons,get saves(){return saves}};
}
// Une récompense ne doit jamais être réattribuée en relisant le bilan.
{
 const S=state(),h=harness(S);
 S.worldRuns[0]={runId:S.runId,step:4,correct:4,runQuestions:[0,1,2,3,4,5,6,7,8,9]};
 h.finish();
 assert.equal(S.rewardStats.runs,1);assert.equal(S.rewardStats.perfect,1);
 assert.equal(S.worldRuns[0],undefined,'L\'ancien checkpoint doit disparaître');
 h.finish();assert.equal(S.rewardStats.runs,1);assert.equal(S.rewardStats.perfect,1);
 assert.equal(S.history.length,1);
 assert.equal(S.awarded['0:new-run'].perfect,true);
}
// On ne doit plus bloquer à 60 parties (ni perdre les sans-faute).
{
 const S=state(),h=harness(S);
 for(let i=0;i<200;i++){
  S.runId='a'+i;S.correct=i%5===0?9:10;
  S.worldRuns[0]={runId:S.runId,step:6};
  h.finish();
 }
 assert.equal(S.rewardStats.runs,200);
 assert.equal(S.rewardStats.perfect,160);
 assert.equal(S.history.length,60,'Historique limité à 60 lignes pour la taille des sauvegardes');
 assert.equal(Object.keys(S.awarded).length,200);
 const before=JSON.stringify(S.rewardStats);h.finish();assert.equal(JSON.stringify(S.rewardStats),before);
}
// Migration non destructive : les anciens résultats sont marqués par true.
// Il est possible de reconstituer les aventures, mais PAS les scores effacés.
{
 const S=state();
 S.awarded=Object.fromEntries(Array.from({length:85},(_,i)=>['0:old'+i,true]));
 S.history=Array.from({length:60},(_,i)=>({score:i%2===0?10:7,total:10}));
 S.rewardStats={runs:60,perfect:30};
 const h=harness(S);h.ensure();
 assert.equal(S.rewardStats.runs,85);
 assert.equal(S.rewardStats.perfect,30);
 S.runId='next';S.correct=10;h.finish();
 assert.equal(S.rewardStats.runs,86);
 assert.equal(S.rewardStats.perfect,31);
 S.awarded['0:next'].perfect=true;h.ensure();
 assert.equal(S.rewardStats.perfect,31,'Pas de double comptage des récompenses enregistrées');
}
{
 const S=state();const h=harness(S);
 S.runId='old';S.step=10;S.correct=6;S.worldRuns[0]={runQuestions:[0,1,2,3,4,5,6,7,8,9],step:4,correct:4,runId:'old',attempts:{}};
 h.finish();
 S.screen='map';
 let freshRuns=0;
 const root={querySelectorAll:()=>[]};
 const portal=new Function('S','activeId','document','$','root','stopSpeech','saveWorldRun','save','W','RUN_SIZE','reduced','newQuestionRun','update','pic','escape','names','setTimeout',
 'let travelBusy=false;'+source(game,'function portal(i){','function quiz(){')+'return portal');
 const go=portal(S,'alice',{querySelector:()=>null},()=>null,root,()=>{},()=>{},()=>{},[{name:'Forêt',questions:Array.from({length:100},()=>({}))}],10,true,()=>{freshRuns++;S.runQuestions=[0,1,2,3,4,5,6,7,8,9]},()=>{},()=>'',x=>x,[],()=>{});
 go(0);assert.equal(freshRuns,1);assert.equal(S.step,0);assert.notEqual(S.runId,'old');
}
// Le coffre possède trente règles indépendantes avec deux états : juste avant et au seuil.
const cases=[
 ['Premier pas','runs',1],['Explorateur','worlds',3],['Gardien du royaume','worlds',5],
 ['Sans-faute','perfect',1],['Collectionneur','coins',100],['Légende des mots','runs',10],
 ['Petit aventurier','runs',5],['Voyageur des mondes','runs',15],['Grand explorateur','runs',25],
 ['Héros des chemins','runs',40],['Champion des mondes','runs',60],['Couronne des mots','runs',100],
 ['Étoile appliquée','perfect',3],['Précision magique','perfect',5],['Œil de lynx','perfect',10],
 ['Virtuose des mots','perfect',15],['Champion du sans-faute','perfect',25],['Diamant du sans-faute','perfect',50],
 ['Bourse de pièces','coins',250],['Petit coffre','coins',500],['Coffre argenté','coins',1000],
 ['Trésor doré','coins',2000],['Fortune magique','coins',3500],['Trésor royal','coins',5000],
 ['Première évaluation','exam',1],['Évaluation réussie','score',15],
 ['Défi Explorateur','challenge0',15],['Défi Expert','challenge1',15],
 ['Défi Maître','challenge2',15],['Grand maître du français','challenge2',20]
];
const keyByLevel=Object.fromEntries([0,1,2].map(l=>[l,challenges.find(c=>c.level===l).id]));
function rewardView(S,challengeData={}){
 const root={innerHTML:''},store={'ce2_challenge_v8254_alice':JSON.stringify(challengeData)};
 const localStorage={getItem:k=>store[k]||null};
 const window={CE2_CHALLENGES:challenges};
 const ensure=harness(S).ensure;
 const evaluate=new Function('S','root','$','ensureState','localStorage','activeId','window','go',
  source(game,'window.ce2RefreshRewards=','const EXAM_COUNT=')+'return {refresh:window.ce2RefreshRewards,rewards}');
 evaluate(S,root,()=>({}),ensure,localStorage,'alice',window,()=>{}).rewards();
 const cards=[...root.innerHTML.matchAll(/<div class="reward-card (unlocked|locked) reward-[^"]+">[\s\S]*?<b>([^<]+)<\/b>/g)];
 return {cards,root,localStorage,window,ensure};
}
function at(name,type,n){
 const S=state();S.history=[];S.rewardStats={runs:0,perfect:0};
 const challengeData={history:{}};
 switch(type){
 case 'runs': S.rewardStats.runs=n;break;
 case 'worlds':for(let i=0;i<n;i++)S.completed[i]=7;break;
 case 'perfect':S.rewardStats.perfect=n;break;
 case 'coins':S.coins=n;break;
 case 'exam':if(n>=1)S.examHistory=[{score:4}];break;
 case 'score':if(n>0)S.examHistory=[{score:n}];break;
 default:{
  const level=Number(type.slice(-1));
  challengeData.history[keyByLevel[level]]={best:n};
 }
 }
 const {cards}=rewardView(S,challengeData);
 assert.equal(cards.length,30,'La galerie affiche les trente récompenses');
 const card=cards.find(c=>c[2]===name);assert(card,'Récompense manquante '+name);
 return card[1];
}
assert.equal(cases.length,30);
for(const [name,type,threshold] of cases){
 assert.equal(at(name,type,threshold-1),'locked',name+' débloquée trop tôt');
 assert.equal(at(name,type,threshold),'unlocked',name+' non débloquée au seuil');
}
// Retour de Challenge sur un coffre affiché : actualisation immédiate.
{
 const S=state();S.screen='rewards';S.history=[];S.rewardStats={runs:0,perfect:0};
 const root={innerHTML:''},store={'ce2_challenge_v8254_alice':JSON.stringify({history:{}})};
 const localStorage={getItem:k=>store[k]||null};
 const window={CE2_CHALLENGES:challenges},ensure=harness(S).ensure;
 new Function('S','root','$','ensureState','localStorage','activeId','window','go',
  source(game,'window.ce2RefreshRewards=','const EXAM_COUNT='))(S,root,()=>({}),ensure,localStorage,'alice',window,()=>{});
 const label=()=>[...root.innerHTML.matchAll(/<div class="reward-card (unlocked|locked) reward-[^"]+">[\s\S]*?<b>([^<]+)<\/b>/g)]
  .find(x=>x[2]==='Défi Explorateur')?.[1];
 window.ce2RefreshRewards();assert.equal(label(),'locked');
 store.ce2_challenge_v8254_alice=JSON.stringify({history:{[keyByLevel[0]]:{best:16}}});
 const close=new Function('root','document','speechSynthesis','location','window',
  source(challengeJs,'function close(){','function open(){')+'return close()');
 close({hidden:false},{getElementById:()=>({hidden:true})},{cancel:()=>{}},{hash:'#challenge'},window);
 assert.equal(label(),'unlocked','Le coffre reste périmé au retour de Challenge');
}
console.log('Récompenses : 30/30 seuils validés, 200 parties, 160 sans-faute, reprise, migration et rafraîchissement Challenge.');
