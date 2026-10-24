// Navigation / flèches : tests exécutables avec Node 22, sans navigateur.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const challenge=fs.readFileSync('challenge.js','utf8');
const arrows=fs.readFileSync('scroll-guides.js','utf8');
const css=fs.readFileSync('style.css','utf8');
const game=fs.readFileSync('game.js','utf8');
const src=(code,a,b)=>{const i=code.indexOf(a),j=code.indexOf(b,i+a.length);assert(i>=0&&j>i,'Section manquante: '+a);return code.slice(i,j)};
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('challenge-data.js','utf8'),sandbox);
const stories=sandbox.window.CE2_CHALLENGES;
const colors={ponctuation:0,dialogue:1,temps:2,verbe:3,negation:4};
const MARKERS=Object.keys(colors).map(x=>({name:x,task:x}));
const values={};
const storage={
 getItem:k=>Object.prototype.hasOwnProperty.call(values,k)?values[k]:null,
 setItem:(k,v)=>{values[k]=String(v)},
 removeItem:k=>{delete values[k]}
};
const profile=id=>{storage.setItem('ce2_v82526_clean_profiles',JSON.stringify({activeId:id,profiles:{childA:{name:'Alice'},childB:{name:'Bob'}}}))};
profile('childA');
let mapCalls=0;
function runSession(){
 const state={screen:'landing',step:0,selected:[],color:0},db={},buttons={};
 const $=id=>(buttons[id]??={onclick:null,disabled:false,textContent:'',innerHTML:''});
 const root={hidden:true,scrollTop:0,querySelectorAll:()=>[],querySelector:()=>null};
 const main={hidden:true};
 const window={ce2GoToWorldMap:()=>mapCalls++};
 const render=()=>{if(state.screen==='play')funcs.play()};
 const code=[
  src(challenge,'function profile(){','function speech('),
  src(challenge,'function chips(','function practice('),
  src(challenge,'function start(id){','// Les signes'),
  src(challenge,'function acceptableColors(','function result()'),
  src(challenge,'function close(){','function open(){'),
  'return {load,save,key,start,play,resumeChallenge,rememberChallenge,close};'
 ].join('\n');
 const funcs=new Function('localStorage','D','state','db','render','root','$','wrap','speech','MARKERS','esc','levels','document','location','window','speechSynthesis',code)(
  storage,stories,state,db,render,root,$,()=>{},()=>{},MARKERS,x=>String(x),['Explorateur','Expert','Maître'],
  {getElementById:()=>main},{hash:'#challenge'},window,{cancel:()=>{}}
 );
 return {state,db,buttons,root,funcs};
}
function answerOne(session,correct=true,advance=true){
 const {state,buttons}=session;
 const m=state.questions[state.step];
 assert(m,'Mission absente');
 state.selected=[...m.answer];
 state.color=correct?colors[m.kind]:(colors[m.kind]+2)%5;
 buttons['#ch-check'].onclick();
 assert.equal(typeof buttons['#ch-next'].onclick,'function','Bouton suivant absent');
 if(advance)buttons['#ch-next'].onclick();
}
{
 const s=runSession();s.funcs.load();s.funcs.start('C1-01');
 assert.equal(s.state.step,0);
 assert.equal(JSON.parse(storage.getItem(s.funcs.key())).inProgress.step,0);
 for(let i=0;i<8;i++)answerOne(s);
 assert.equal(s.state.step,8);assert.equal(s.state.score,16);
 s.buttons['#ch-quit'].onclick();
 assert.equal(s.state.screen,'select');
 const saved=JSON.parse(storage.getItem(s.funcs.key())).inProgress;
 assert.equal(saved.step,8);assert.equal(saved.score,16);
 // Rechargement du jeu : nouvelle mémoire JS, même sauvegarde sur l'appareil.
 const restored=runSession();restored.funcs.load();
 assert(restored.funcs.resumeChallenge());
 assert.equal(restored.state.step,8);assert.equal(restored.state.score,16);
 answerOne(restored,false,false);
 assert.equal(restored.state.score,16);
 assert.equal(JSON.parse(storage.getItem(restored.funcs.key())).inProgress.feedback.ok,false);
 // Quitter après une réponse déjà vérifiée, puis revenir : pas de double comptage.
 restored.root.hidden=false;restored.funcs.close();
 assert.equal(mapCalls,1);assert.equal(restored.root.hidden,true);
 const afterClose=runSession();afterClose.funcs.load();
 assert(afterClose.funcs.resumeChallenge());
 assert.equal(afterClose.state.step,8);assert.equal(afterClose.state.score,16);
 assert.equal(afterClose.buttons['#ch-check'].disabled,true);
 afterClose.buttons['#ch-next'].onclick();
 assert.equal(afterClose.state.step,9);assert.equal(afterClose.state.score,16);
 answerOne(afterClose,true);
 assert.equal(afterClose.state.step,10);assert.equal(afterClose.state.score,18);
 const completed=JSON.parse(storage.getItem(afterClose.funcs.key()));
 assert.equal(completed.history['C1-01'].best,18);
 assert.equal(completed.inProgress,undefined);
}
{
 // Un enfant ne peut jamais reprendre le Challenge de l'autre.
 profile('childA');
 const s=runSession();s.funcs.load();s.funcs.start('C1-02');answerOne(s);
 profile('childB');
 const second=runSession();second.funcs.load();
 assert.equal(second.db.inProgress,undefined);
 assert.equal(second.funcs.resumeChallenge(),false);
 profile('childA');
 const first=runSession();first.funcs.load();
 assert(first.funcs.resumeChallenge());
 assert.equal(first.state.step,1);
}
// Simulation isolée du défilement principal, Challenge et absence de contenu défilable.
function scrollCase(challengeVisible,canScroll=true){
 const events={};
 const makeBtn=()=>({hidden:false,addEventListener:(name,handler)=>{events[name+Object.keys(events).length]=handler}});
 const up=makeBtn(),down=makeBtn();let upClick,downClick;
 up.addEventListener=(n,cb)=>{if(n==='click')upClick=cb};
 down.addEventListener=(n,cb)=>{if(n==='click')downClick=cb};
 const panel={hidden:false,classList:{add(){},remove(){}},setAttribute(){},querySelector:id=>id==='#scroll-guide-up'?up:down};
 const scroller=(height)=>({scrollHeight:height,clientHeight:600,scrollTop:100,scrollBy(options){this.scrollTop+=options.top;this.lastScrollBy=options}});
 const page=scroller(1200),challenge=scroller(canScroll?1200:600);
 challenge.hidden=!challengeVisible;challenge.contains=()=>false;challenge.overflowY='auto';
 const scene=scroller(600);scene.querySelectorAll=()=>[];scene.overflowY='visible';scene.parentElement=null;
 const document={
  activeElement:down,
  scrollingElement:page,documentElement:page,
  body:{appendChild(){}},
  createElement:()=>panel,
  getElementById:id=>id==='scene'?scene:id==='challenge-root'?challenge:null,
  addEventListener(){}
 };
 const timers=[];
 const fn=new Function('document','window','getComputedStyle','requestAnimationFrame',
  'clearTimeout','setTimeout','MutationObserver','setInterval','matchMedia',arrows);
 fn(document,{addEventListener(){}},e=>({overflowY:e.overflowY||'visible'}),
  cb=>cb(),()=>{},(_,delay)=>{timers.push(delay);return 1},
  function(){this.observe=()=>{}},()=>{},()=>({matches:true}));
 assert(timers.includes(4500),'La disparition après 4,5 s ne doit pas changer');
 if(canScroll||!challengeVisible)downClick();
 return {page:page.lastScrollBy,challenge:challenge.lastScrollBy,panelHidden:panel.hidden};
}
{
 const main=scrollCase(false),challenge=scrollCase(true),noScroll=scrollCase(true,false);
 assert(main.page&&main.page.top>0);
 assert.equal(main.challenge,undefined);
 assert(challenge.challenge&&challenge.challenge.top>0);
 assert.equal(challenge.page,undefined,'Ne jamais faire défiler le jeu derrière le Challenge');
 assert.equal(noScroll.panelHidden,true);
}
assert(css.includes('body:has(#challenge-root:not([hidden])) #scroll-guides{z-index:10000}'));
assert(game.includes("window.ce2GoToWorldMap=()=>go('map')"));
assert(game.includes("Retour à l’espace parents"));
assert(challenge.includes("showResumeButton('.ch-levels')"));
assert(challenge.includes("showResumeButton('#ch-surprise')"));
console.log('Flèches et navigation : défilement du Challenge, pause/reprise, erreur, profils et 4,5 s validés.');
