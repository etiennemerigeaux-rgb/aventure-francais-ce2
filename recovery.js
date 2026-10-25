/* V82.5.63 — Reprise de session et calcul des pièces, sans dépendance au navigateur. */
(()=>{'use strict';
const BANK_VERSION='v82.5.63';
const RUN_SIZE=10;
const validRun=(run,world,length)=>{
  if(!run||typeof run!=='object'||run.bankVersion!==BANK_VERSION)return false;
  if(!Number.isInteger(world)||world<0||world>4||!Number.isInteger(length)||length<RUN_SIZE)return false;
  if(!Array.isArray(run.runQuestions)||run.runQuestions.length!==RUN_SIZE)return false;
  if(new Set(run.runQuestions).size!==RUN_SIZE||run.runQuestions.some(n=>!Number.isInteger(n)||n<0||n>=length))return false;
  if(!Number.isInteger(run.step)||run.step<0||run.step>=RUN_SIZE)return false;
  if(!Number.isInteger(run.correct)||run.correct<0||run.correct>run.step+1)return false;
  if(run.answered!==null&&run.answered!==undefined&&(!Number.isInteger(run.answered)||run.answered<0||run.answered>3))return false;
  if(typeof run.runId!=='string'||!run.runId||typeof run.attempts!=='object'||!run.attempts||Array.isArray(run.attempts))return false;
  if(run.practice!=null&&(!Number.isInteger(run.practice.index)||run.practice.index<0||run.practice.index>=length))return false;
  return true;
};
const snapshot=(state)=>({
  runQuestions:[...(state.runQuestions||[])],step:state.step,correct:state.correct,
  answered:state.answered??null,attempts:{...(state.attempts||{})},
  runId:state.runId,practice:state.practice?{...state.practice}:null,
  bankVersion:BANK_VERSION,savedAt:Date.now(),
  runCoins:Number.isFinite(state.runCoins)?Math.max(0,state.runCoins):0
});
const restore=(state,run)=>{
 state.runQuestions=[...run.runQuestions];state.step=run.step;state.correct=run.correct;
 state.answered=run.answered??null;state.attempts={...run.attempts};
 state.runId=run.runId;state.practice=run.practice?{...run.practice}:null;
 state.runBankVersion=BANK_VERSION;state.runCoins=Number(run.runCoins)||0;
};
const resumeCandidate=(state,worlds)=>{
 const entries=Object.entries(state.worldRuns||{}).map(([w,run])=>({world:Number(w),run}))
  .filter(item=>validRun(item.run,item.world,worlds[item.world]?.questions?.length||0));
 entries.sort((a,b)=>(b.run.savedAt||0)-(a.run.savedAt||0));
 return entries[0]||null;
};
const earnedCoins=(state)=>{
 if(Number.isFinite(state.runCoins))return Math.max(0,state.runCoins);
 return Object.entries(state.attempts||{}).filter(([key,item])=>
  key.startsWith(state.world+':')&&item&&item.correct===true)
   .reduce((sum,[,item])=>sum+(item.firstTry===true?3:1),0);
};
const hasLegacyProgress=(x)=>!!x&&typeof x==='object'&&!Array.isArray(x)&&
 (!!String(x.name||'').trim()||Number(x.coins)>0||Object.keys(x.completed||{}).length>0||
  (Array.isArray(x.history)&&x.history.length>0));
window.CE2_RECOVERY={BANK_VERSION,validRun,snapshot,restore,resumeCandidate,earnedCoins,hasLegacyProgress};
})();