/* Audit intégration, exécutable avec : node tests/audit-application.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),get=name=>fs.readFileSync(path.join(root,name),'utf8');
const context={window:{}};
for(const script of ['data.js','pedagogy.js','punctuation-rich.js','lunettes-rich.js','dialogue-pedagogy.js','recovery.js','challenge-data.js'])
 vm.runInNewContext(get(script),context,{filename:script});
const D=context.window.CE2_DATA, W=D.worlds, R=context.window.CE2_RECOVERY;
const code=get('game.js');
const extract=(a,b)=>{const start=code.indexOf(a),end=code.indexOf(b,start);assert(start>=0&&end>start,'Fonction introuvable : '+a);return code.slice(start,end);};
assert.equal(R.BANK_VERSION,'v82.5.63');
let checks=0;
const run={world:0,runId:'r1',runQuestions:[0,11,22,33,44,55,66,77,88,99],
 step:4,correct:3,answered:2,attempts:{'0:0':{firstTry:true,correct:true}},
 practice:null,runCoins:10,runBankVersion:R.BANK_VERSION};
const shot=R.snapshot(run);
assert(R.validRun(shot,0,100));checks++;
assert(!R.validRun({...shot,bankVersion:'ancien'},0,100));checks++;
assert(!R.validRun({...shot,runQuestions:[0,0,22,33,44,55,66,77,88,99]},0,100));checks++;
assert(!R.validRun({...shot,step:10},0,100));checks++;
const loaded={};R.restore(loaded,shot);
assert.equal(loaded.step,4);assert.equal(loaded.correct,3);assert.equal(loaded.runCoins,10);checks+=3;
const candidate=R.resumeCandidate({worldRuns:{0:shot,2:{...shot,bankVersion:'ancien'}}},W);
assert.equal(candidate.world,0);checks++;
assert.equal(R.earnedCoins(loaded),10);checks++;
assert(R.hasLegacyProgress({name:'Invité ancien',history:[]}));checks++;
assert(!R.hasLegacyProgress({name:'',history:[],coins:0}));checks++;
// Vérifier l'intégration de la reprise dans le vrai code, au-delà du module de test.
assert(code.includes('window.CE2_RECOVERY.restore(S,candidate.run)'));checks++;
assert(code.includes('window.CE2_RECOVERY.snapshot(S)'));checks++;
assert(code.includes("saveWorldRun();save();$('#coins')"));checks++;
assert(code.includes('S.runBankVersion=window.CE2_RECOVERY.BANK_VERSION'));checks++;
// Réponses : succès sans aide, erreur suivie d'une réussite assistée.
const answerSrc=extract('function answer(n){','function finish(){');
function runAnswer(state,chosen,question){
 const counters={snapshots:0,saves:0,praises:0,spoken:0};
 const factory=new Function('S','currentQuestion','burst','chime','praiseSometimes','showFeedback','saveWorldRun','save','$','speakError',
    answerSrc+';return answer;');
 const answer=factory(state,()=>question,()=>{},()=>{},()=>counters.praises++,()=>{},
  ()=>counters.snapshots++,()=>counters.saves++,()=>({textContent:''}),()=>counters.spoken++);
 answer(chosen);return counters;
}
const q={q:'La bonne réponse ?',answer:2,explanation:'Parce que c’est exact.'};
const ok={world:0,step:0,correct:0,coins:0,runCoins:0,answered:null,attempts:{},practice:null};
let counters=runAnswer(ok,2,q);
assert.equal(ok.correct,1);assert.equal(ok.coins,3);assert.equal(ok.runCoins,3);
assert.equal(counters.snapshots,1);assert.equal(counters.praises,1);checks+=5;
const assist={world:0,step:0,correct:0,coins:0,runCoins:0,assisted:0,answered:null,attempts:{},practice:null};
counters=runAnswer(assist,1,q);
assert.equal(assist.correct,0);assert.equal(assist.coins,0);assert.equal(counters.spoken,1);checks+=3;
assist.answered=null;assist.practice={index:0,original:0};
counters=runAnswer(assist,2,q);
assert.equal(assist.correct,0);assert.equal(assist.coins,1);assert.equal(assist.runCoins,1);
assert.equal(assist.attempts['0:0'].firstTry,false);checks+=4;
// Fin d'aventure : coffre, absence de doublon, vrai montant des pièces.
const finishSrc=extract('function finish(){','function restoreAnswer(){');
let html='',saved=0;
const s={...run,world:0,step:10,runId:'test-coffre',correct:9,runCoins:28,
 completed:{},history:[],awarded:{},rewardStats:{runs:0,perfect:0},worldRuns:{0:shot},coins:28};
const finish=new Function('S','window','sessionLength','ensureState','root','save','pic','burst','$','go',
 finishSrc+';return finish;')(s,context.window,()=>10,()=>{},
 {set innerHTML(value){html=value;}},()=>saved++,()=>'',()=>{},()=>({onclick:null}),()=>{});
finish();finish();
assert(html.includes('28 pièces gagnées'));assert(html.includes('9/10 sans aide'));checks+=2;
assert.equal(s.history.length,1);assert.equal(s.rewardStats.runs,1);checks+=2;
assert.equal(Object.keys(s.worldRuns).length,0);checks++;
// Sélection des évaluations : 25 questions, cinq par monde, niveaux 2/2/1.
const pattern=['easy','easy','medium','medium','hard'];
const examSrc=extract('function buildExam(){','function startExam(){');
const examFactory=new Function('D','S','EXAM_PATTERN',examSrc+';return buildExam;');
const examState={examHistory:[]};
const buildExam=examFactory(D,examState,pattern);
for(let i=0;i<200;i++){
 const items=buildExam();
 assert.equal(items.length,25);
 assert.equal(new Set(items.map(q=>q.id)).size,25);
 for(let w=0;w<5;w++){
  const questions=items.filter(q=>q.world===w);
  assert.equal(questions.length,5);
  assert.equal(questions.filter(q=>q.difficulty==='easy').length,2);
  assert.equal(questions.filter(q=>q.difficulty==='medium').length,2);
  assert.equal(questions.filter(q=>q.difficulty==='hard').length,1);
 }
 checks++;
}
// Évaluation complète : score sur 20 et seuil réel de déblocage du Challenge.
const completeSrc=extract('function completeExam(){','function examResult(){');
const items=buildExam();
function completedWith(correctAnswers){
 const player={exam:{items,answers:items.map((q,i)=>i<correctAnswers?q.answer:(q.answer+1)%4),started:'2026-10-25'},examHistory:[],challengeUnlocked:false};
 let saves=0,screen='',celebrated=0;
 const done=new Function('S','examQuestions','save','go','playExamCelebration','soundOn','requestAnimationFrame','document','window','root',
   completeSrc+';return completeExam;')(player,e=>e.items,()=>saves++,x=>{screen=x;},()=>celebrated++,false,
   callback=>callback(),{scrollingElement:{scrollTo(){}}},{scrollTo(){}},{scrollTop:0});
 done();
 assert.equal(player.examHistory.length,1);
 assert.equal(player.exam,null);
 assert.equal(screen,'exam-result');
 assert.equal(saves,1);
 assert.equal(celebrated,1);
 return player;
}
const belowThreshold=completedWith(18);
assert.equal(belowThreshold.examHistory[0].score,14.4);
assert(!belowThreshold.challengeUnlocked);
const aboveThreshold=completedWith(19);
assert.equal(aboveThreshold.examHistory[0].score,15.2);
assert.equal(aboveThreshold.challengeUnlocked);
checks+=2;
assert.equal(D.examBank.length,500);checks++;
for(const item of D.examBank){
 assert(item.id&&item.q&&item.explanation,'Évaluation incomplète');
 assert.equal(item.options.length,4);
 assert.equal(new Set(item.options).size,4);
 assert(item.options[item.answer], 'Réponse absente');
}checks++;
const challenges=context.window.CE2_CHALLENGES;
assert.equal(challenges.length,30);
const knownKinds=['ponctuation','dialogue','temps','verbe','negation'];
const challengeCode=get('challenge.js');
const from=challengeCode.indexOf('function canEnter(l){');
const to=challengeCode.indexOf('function randomText(l){',from);
assert(from>=0&&to>from,'Contrôle de déblocage manquant.');
const canEnterSource=challengeCode.slice(from,to)+';return canEnter;';
const db={history:{}};
const canEnter=new Function('D','db',canEnterSource)(challenges,db);
assert(canEnter(0));assert(!canEnter(1));assert(!canEnter(2));
db.history[challenges.find(x=>x.level===0).id]={best:16};
assert(canEnter(1));assert(!canEnter(2));
db.history[challenges.find(x=>x.level===1).id]={best:14};
assert(!canEnter(2));
db.history[challenges.find(x=>x.level===1).id]={best:16};
assert(canEnter(2));checks++;

for(const level of [0,1,2])assert.equal(challenges.filter(c=>c.level===level).length,10);
let missionCount=0;
for(const story of challenges){
 assert(story.missions.length>=10);
 const counts={};
 for(const mission of story.missions){
  missionCount++;counts[mission.kind]=(counts[mission.kind]||0)+1;
  assert(knownKinds.includes(mission.kind));
  assert(mission.prompt&&mission.explanation);
  assert(mission.answer.length>0);
  assert.deepEqual(Array.from(mission.answer,i=>story.tokens[i]),Array.from(mission.words));
 }
 for(const kind of knownKinds)assert(counts[kind]>=2,'Impossible de garantir 2 défis par compétence');
}checks++;
const htmlPage=get('index.html'),sw=get('sw.js'),manifest=JSON.parse(get('manifest.webmanifest'));
const scripts=['data.js','pedagogy.js','punctuation-rich.js','lunettes-rich.js','dialogue-pedagogy.js','recovery.js','game.js','challenge-data.js','challenge.js','scroll-guides.js'];
let last=-1;
for(const file of scripts){
 const at=htmlPage.indexOf('src="'+file+'?v=82563"');
 assert(at>last,'Script manquant ou ordre incorrect : '+file);last=at;
 assert(sw.includes('"./'+file+'"'),'Manquant du cache PWA : '+file);
}
assert(sw.includes('v82563-resilient-offline'));
assert.equal(manifest.display,'standalone');
for(const asset of ['icon-192.png','icon-512.png','style.css','challenge.css'])
 assert(fs.existsSync(path.join(root,asset)),'Ressource locale manquante : '+asset);
checks++;
assert(sw.includes('await cache.addAll(CORE)')&&sw.includes('Promise.allSettled(optional.map('),
 'Le préchargement doit distinguer le noyau et les images facultatives.');
for(const bank of [W[0],W[4]]){
 const tagged=bank.questions.filter(q=>q.editorialVersion);
 assert.equal(tagged.length,80);
 assert(tagged.every(q=>q.pedagogicalCompetence),'Compétence pédagogique absente');
 assert(tagged.every(q=>['identification','application','correction','comparaison','compréhension'].includes(q.learningType)), 'Métadonnée de démarche invalide');
}
checks++;
console.log('OK — '+checks+' assertions/groupes : reprise, erreurs, coffre, 200 évaluations, 30 défis / '+missionCount+' missions, PWA.');
