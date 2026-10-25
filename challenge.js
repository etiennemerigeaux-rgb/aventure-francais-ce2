(()=>{'use strict';const RAW=window.CE2_CHALLENGES,ALLOWED=['ponctuation','dialogue','temps','verbe','negation'],D=Array.isArray(RAW)?RAW.filter(t=>Array.isArray(t.missions)&&t.missions.length>=10&&t.missions.every(m=>ALLOWED.includes(m.kind))):[],root=document.getElementById('challenge-root');if(!root)return;const levels=['🥉 Explorateur','🥈 Expert','🥇 Maître des mots'],colors=['#ffe27a','#ffc184','#a4d9ff','#d6b2ff','#b9ef9d'];let state={screen:'landing',level:0,id:null,step:0,selected:[],color:0,practice:false,guideStep:0,guideColor:0,guideMarks:[],guideChecked:false,guideVisited:[0],guideError:'',pilotPhase:0,pilotMarks:{},pilotColor:-1,pilotHint:0,pilotError:'',pilotIntroStep:0,pilotPending:null},db={};const $=s=>root.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));function profile(){
  // Utiliser les profils actifs de la version courante, et non l'ancienne clé V71.
  // Ne pas réattribuer automatiquement les anciens résultats « guest » à un enfant.
  try{
    const current=JSON.parse(localStorage.getItem('ce2_v82526_clean_profiles')||'{}');
    if(current&&current.activeId&&current.profiles&&Object.prototype.hasOwnProperty.call(current.profiles,current.activeId)){
      return current.activeId;
    }
  }catch{}
  return 'guest';
}function key(){return 'ce2_challenge_v8254_'+profile()}function load(){try{db=JSON.parse(localStorage.getItem(key())||'{}')}catch{db={}}db.history=db.history||{};db.tutorialDone=!!db.tutorialDone;db.drawBags=db.drawBags||{};// Les anciens indicateurs de déblocage ne font pas foi : seuls les scores réels du profil comptent.
const passed=l=>D.some(x=>x.level===l&&Number(db.history[x.id]?.best)>=15);
db.unlocked=[true,passed(0),passed(0)&&passed(1)];}function save(){localStorage.setItem(key(),JSON.stringify(db))}
function rememberChallenge(){
  if(state.screen!=='play')return;
  const story=D.find(t=>t.id===state.id);
  if(!story||!Array.isArray(state.questions)||state.questions.length!==10)return;
  const order=state.questions.map(m=>story.missions.indexOf(m));
  if(order.some(i=>i<0))return;
  db.inProgress={version:2,id:story.id,level:story.level,step:state.step,
    score:state.score,order,selected:[...(state.selected||[])],color:state.color,choice:state.choice??-1,reviewing:!!state.reviewing,
    errors:(state.errors||[]).slice(0,10),feedback:state.feedback||null,pilotPhase:state.pilotPhase||0,pilotMarks:state.pilotMarks||{},pilotColor:state.pilotColor??-1,pilotHint:state.pilotHint||0,pilotContentVersion:2};
  save();
}
function resumeChallenge(){
  const saved=db.inProgress,story=D.find(t=>t.id===saved?.id);
  if(!story||![1,2].includes(saved.version)||!Number.isInteger(saved.step)||saved.step<0||saved.step>=10||
    !Array.isArray(saved.order)||saved.order.length!==10||
    saved.order.some(i=>!Number.isInteger(i)||i<0||i>=story.missions.length)||
    new Set(saved.order).size!==10||
    !Number.isInteger(saved.score)||saved.score<0||saved.score>20||(saved.version===1&&saved.score%2!==0)||
    saved.score>(saved.step+(saved.feedback?1:0))*2)return false;
  state.id=story.id;state.level=story.level;state.step=saved.step;
  state.score=saved.score;state.questions=saved.order.map(i=>story.missions[i]);
  // Les cartes marines ajoutées au récit déplacent 9 mots à partir de l'ancienne position 84.
  // Traduire les anciennes sélections locales une seule fois, sans toucher aux scores.
  const migrateIndex=i=>saved.pilotContentVersion!==2&&(story.id==='C2-01'||story.id==='C3-01')&&i>=84?i+9:i;
  state.selected=Array.isArray(saved.selected)?saved.selected.map(migrateIndex).filter(i=>Number.isInteger(i)&&i>=0&&i<story.tokens.length):[];
  state.color=Number.isInteger(saved.color)&&saved.color>=-1&&saved.color<5?saved.color:-1;state.choice=Number.isInteger(saved.choice)&&saved.choice>=-1&&saved.choice<4?saved.choice:-1;state.reviewing=!!saved.reviewing;
  state.errors=Array.isArray(saved.errors)?saved.errors.slice(0,10):[];
  state.feedback=saved.feedback&&typeof saved.feedback.msg==='string'&&
    typeof saved.feedback.ok==='boolean'?saved.feedback:null;
  state.pilotPhase=saved.pilotPhase===1?1:0;
  state.pilotMarks={};if(saved.pilotMarks&&typeof saved.pilotMarks==='object'){for(const [k,v] of Object.entries(saved.pilotMarks)){const n=migrateIndex(Number(k));if(Number.isInteger(n)&&n>=0&&n<story.tokens.length&&Number.isInteger(v)&&v>=0&&v<=4)state.pilotMarks[n]=v;}}
  state.pilotColor=Number.isInteger(saved.pilotColor)&&saved.pilotColor>=-1&&saved.pilotColor<=4?saved.pilotColor:-1;state.pilotHint=Number.isInteger(saved.pilotHint)?Math.min(2,Math.max(0,saved.pilotHint)):0;state.pilotError='';
  state.screen='play';root.scrollTop=0;render();return true;
}
function showResumeButton(anchorSelector){
  if(!db.inProgress)return;
  const anchor=root.querySelector(anchorSelector);
  if(!anchor)return;
  const button=document.createElement('button');
  button.id='ch-resume-story';button.type='button';button.className='ch-main';
  button.textContent='↪ Reprendre mon histoire en cours';
  button.onclick=()=>{if(!resumeChallenge())alert('Cette histoire ne peut plus être reprise.')};
  anchor.before(button);
}
function speech(msg){try{if(localStorage.getItem('ce2_challenge_voice_off')==='1')return;speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(msg);u.lang='fr-FR';u.rate=.88;speechSynthesis.speak(u)}catch{}}function show(){root.hidden=false;document.getElementById('app').hidden=true;root.scrollTop=0;render()}function close(){
  if(state.screen==='play')rememberChallenge();
  speechSynthesis?.cancel?.();root.hidden=true;
  document.getElementById('app').hidden=false;location.hash='';
  if(typeof window.ce2RefreshRewards==='function')window.ce2RefreshRewards();
  if(typeof window.ce2GoToWorldMap==='function')window.ce2GoToWorldMap();
}function open(){load();state.screen=db.practice4Done?'levels':(db.tutorialDone?'levels':'guide');state.guideStep=0;state.guideColor=0;state.guideMarks=[];state.guideChecked=false;state.guideVisited=[0];show()}window.openCE2Challenge=open;function wrap(body){root.innerHTML='<div class="ch-shell"><div class="ch-top"><strong>✨ Mode Challenge · '+(window.CE2_APP_VERSION||'version indisponible')+'</strong><button id="ch-exit" class="ch-mini">✕ Retour aux mondes</button></div>'+body+'</div>';$('#ch-exit').onclick=close}function render(){if(state.screen==='guide')guide();else if(state.screen==='practice')practice();else if(state.screen==='practiceSuccess')practiceSuccess();else if(state.screen==='levels')levelsPage();else if(state.screen==='pilotIntro')pilotIntroPage();else if(state.screen==='select')selectPage();else if(state.screen==='play')play();else if(state.screen==='result')result()}
const MARKERS=[{name:'Jaune',hex:'#ffe27a',world:'🌳 Forêt de la ponctuation',task:'les signes de ponctuation',example:'Dans « Le chat dort. », touche le point.'},{name:'Orange',hex:'#ffc184',world:'💬 La Cité des dialogues',task:'les guillemets, les tirets de dialogue, les répliques et les verbes de dialogue',example:'Dans « Bonjour ! », les guillemets entourent les paroles prononcées.'},{name:'Bleu',hex:'#a4d9ff',world:'⏳ Machine du temps',task:'les indices de temps selon la consigne',example:'Dans « Hier, je jouais. », touche « Hier » si on cherche un indice de passé.'},{name:'Violet',hex:'#d6b2ff',world:'🔎 Détective des verbes',task:'les verbes',example:'Dans « Le chat dort. », touche « dort ».'},{name:'Vert',hex:'#b9ef9d',world:'🪄 Lunettes magiques',task:'les mots de négation et l’encadrement du verbe',example:'Dans « Le chat ne dort pas. », touche « ne » et « pas » pour la négation.'}];
const guideSteps=[
['🎨','Découvre les cinq surligneurs','Chaque couleur a une mission. Le JAUNE est déjà sélectionné : découvre les quatre autres surligneurs.'],
['🌳','Jaune : la ponctuation','Les signes comme le point, la virgule ou le point d’interrogation. Consigne : touche le point final avec le JAUNE.'],
['🦁','Orange : les guillemets','Un guillemet ouvrant («) et un guillemet fermant (») encadrent les paroles prononcées. Consigne : touche seulement ces deux signes avec l’ORANGE.'],
['🦁','Orange : les deux-points','Les deux-points (:) peuvent annoncer les paroles d’un personnage. Consigne : touche UNIQUEMENT le signe deux-points avec l’ORANGE.'],
['🦁','Orange : le tiret de dialogue','Le tiret — annonce une réplique : un personnage prend la parole. Consigne : touche le tiret avec l’ORANGE.'],
['🦁','Orange : une réplique','Une réplique est la phrase prononcée par un personnage. Consigne : touche les mots « Bonjour » et « ! », sans le tiret ni le verbe « dit ».'],
['🦁','Orange : le verbe de dialogue','Les verbes « dit », « demande », « répond » indiquent qu’un personnage parle. Consigne : touche « dit » avec l’ORANGE.'],
['⏳','Bleu : les indices de temps','Un indice de temps indique quand se passe l’action. Consigne : touche « Hier » avec le BLEU.'],
['🔎','Violet : les verbes','Le verbe exprime une action ou un état. Consigne : touche « dort » avec le VIOLET.'],
['🪄','Vert : la négation','La négation peut encadrer le verbe : ne … pas. Consigne : touche « ne » ET « pas » avec le VERT.'],
['↩️','Corriger une sélection','Si tu t’es trompé, retouche le mot colorié pour effacer. Consigne : efface « chat », puis vérifie. La couleur active n’a pas d’importance pour effacer.'],
['🔎','Dernier entraînement : la négation','Entraîne-toi encore : choisis le VERT, marque « ne » et « pas », puis appuie sur « Vérifier ma réponse ».'],
['🏆','Prêt pour la mission finale !','Tu connais maintenant les cinq surligneurs. Réussis une dernière mission avant de commencer les défis !']
];
const GUIDE_EXAMPLES={
1:{tokens:['Le','chat','dort','.'],answer:[3],color:0},
2:{tokens:['Le','lion','dit',':','«','Bonjour','!','»'],answer:[4,7],color:1},
3:{tokens:['Le','lion','dit',':','«','Bonjour','!','»'],answer:[3],color:1},
4:{tokens:['—','Bonjour','!','dit','le','lion','.'],answer:[0],color:1},
5:{tokens:['—','Bonjour','!','dit','le','lion','.'],answer:[1,2],color:1},
6:{tokens:['—','Bonjour','!','dit','le','lion','.'],answer:[3],color:1},
7:{tokens:['Hier',',','je','jouais','.'],answer:[0],color:2},
8:{tokens:['Le','chat','dort','.'],answer:[2],color:3},
9:{tokens:['Le','chat','ne','dort','pas','.'],answer:[2,4],color:4},
10:{tokens:['Le','chat','dort','.'],answer:[],color:3,initial:{1:3}},
11:{tokens:['Le','chat','ne','dort','pas','.'],answer:[2,4],color:4,check:true}
};
function guide(){
const n=state.guideStep,[emoji,title,desc]=guideSteps[n],ex=GUIDE_EXAMPLES[n],interactive=n<guideSteps.length-1;
const tokens=ex?ex.tokens:[];
const palette=MARKERS.map((m,i)=>`<button type="button" class="ch-color ${state.guideColor===i?'active':''} ${n===0&&state.guideVisited.includes(i)?'ch-discovered':''}" data-guide-color="${i}" style="background:${m.hex}" aria-label="Surligneur ${m.name}${n===0&&state.guideVisited.includes(i)?' découvert':''}" title="${esc(m.name+' : '+m.task)}">${n===0&&state.guideVisited.includes(i)?'✓':'✎'}</button>`).join('');
const tokenButtons=tokens.map((w,i)=>`<button type="button" class="ch-token ${state.guideMarks[i]!==undefined?'ch-marked':''}" data-guide-word="${i}" style="${state.guideMarks[i]!==undefined?'--marker:'+MARKERS[state.guideMarks[i]].hex:''}">${esc(w)}</button>`).join(' ');
const exact=ex&&(ex.answer.length===0||state.guideColor===ex.color)&&Object.keys(state.guideMarks).length===ex.answer.length&&ex.answer.every(i=>state.guideMarks[i]===ex.color);
const achieved=n===0?state.guideVisited.length===5:ex?(state.guideChecked&&exact):true;
wrap(`<div class="ch-card ch-center"><div class="ch-emoji">${emoji}</div><div class="ch-over">Tutoriel interactif ${n+1} / ${guideSteps.length}</div><h1>${title}</h1><p>${desc}</p>${interactive?`<div class="ch-colors">${palette}</div><p class="ch-hint" role="status"><strong>Couleur choisie : ${MARKERS[state.guideColor].name}</strong> — ${esc(MARKERS[state.guideColor].task)}</p>${n===0?`<p class="ch-discovery-progress" role="status" aria-live="polite">🎨 Surligneurs découverts : <strong>${state.guideVisited.length} / 5</strong></p>`:''}${ex?`<div class="ch-text">${tokenButtons}</div>`:''}<p class="ch-hint" id="ch-guide-hint" role="status">${achieved?(n===0?'✨ Bravo, tu connais les cinq surligneurs !':'✨ Bravo, tu as réussi !'):state.guideChecked===false&&state.guideError?'Essaie encore : '+esc(state.guideError):n===0?'Découvre les autres surligneurs pour continuer.':'Suis la consigne affichée au-dessus.'}</p>`:''}${ex?'<button id="ch-guide-check" class="ch-minor">✓ Vérifier ma réponse</button>':''}<button id="ch-next" class="ch-main" ${interactive&&!achieved?'disabled':''}>${n===guideSteps.length-1?'Passer à la mission finale →':'Continuer →'}</button>${db.tutorialDone?'<button id="ch-guide-back" class="ch-minor">← Retour aux niveaux</button>':''}</div>`);
root.querySelectorAll('[data-guide-color]').forEach(btn=>btn.onclick=()=>{state.guideColor=+btn.dataset.guideColor;if(n===0&&!state.guideVisited.includes(state.guideColor))state.guideVisited.push(state.guideColor);render()});
root.querySelectorAll('[data-guide-word]').forEach(btn=>btn.onclick=()=>{let i=+btn.dataset.guideWord;if(state.guideMarks[i]!==undefined)delete state.guideMarks[i];else state.guideMarks[i]=state.guideColor;state.guideChecked=false;state.guideError='';render()});
if(ex)$('#ch-guide-check').onclick=()=>{state.guideChecked=!!exact;if(!exact){state.guideError='Observe bien le signe ou les mots demandés. Tu peux toucher une sélection pour l’effacer.';$('#ch-guide-hint').textContent=state.guideError;}else{state.guideError='';render()}};
$('#ch-next').onclick=()=>{if(interactive&&!achieved)return;if(n===guideSteps.length-1){state.screen='practice';state.selected=[];state.color=4;render();return}state.guideStep++;if(state.guideStep===10)state.guideColor=3;state.guideMarks={...(GUIDE_EXAMPLES[state.guideStep]?.initial||{})};state.guideChecked=false;state.guideError='';render()};
if(db.tutorialDone)$('#ch-guide-back').onclick=()=>{state.screen='levels';render()};
}
function chips(tokens,selected,answer,disabled=false){return tokens.map((t,i)=>`<button class="ch-token ${selected.includes(i)?'ch-marked':''}" style="${selected.includes(i)?'--marker:'+(colors[state.color]||'transparent'):''}" data-token="${i}" ${disabled?'disabled':''}>${esc(t)}</button>`).join(' ')}
function colorsUI(){return `<div class="ch-colors" aria-label="Couleur du surligneur">${MARKERS.map((m,i)=>`<button class="ch-color ${state.color===i?'active':''}" data-color="${i}" style="background:${m.hex}" aria-label="Surligneur ${m.name} : ${esc(m.world)}" title="${m.name} : ${esc(m.task)}">✎</button>`).join('')}</div><p class="ch-hint">${state.color<0?'Aucune couleur sélectionnée : choisis un surligneur.':esc(MARKERS[state.color].name+' : '+MARKERS[state.color].task)}</p>`}
function wireChips(){root.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{if(state.color<0){const hint=$('.ch-hint');if(hint)hint.textContent='Choisis d’abord une couleur de surligneur.';return}let i=+b.dataset.token;state.selected=state.selected.includes(i)?state.selected.filter(x=>x!==i):[...state.selected,i];if(state.screen==='play')rememberChallenge();render()});root.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{state.color=+b.dataset.color;state.selected=[];if(state.screen==='play')rememberChallenge();render()})}
function practice(){
const tokens=['Le','chien','ne','joue','jamais','.'];
wrap(`<div class="ch-card"><div class="ch-over">🧪 Mission finale du tutoriel</div><h1>À toi de jouer !</h1><p>Dans cette phrase, retrouve <strong>les deux mots qui rendent la phrase négative</strong>.</p><p class="ch-task">🎯 Choisis le <strong>surligneur VERT</strong>, puis touche <strong>les deux mots de la négation</strong>. Quand tu as terminé, appuie sur « Vérifier ma réponse ».</p>${colorsUI()}<p class="ch-hint" role="status">Couleur choisie : <strong>${MARKERS[Math.max(0,state.color)]?.name||'Jaune'}</strong> — ${esc(MARKERS[Math.max(0,state.color)]?.task||'Ponctuation')}</p><div class="ch-text">${chips(tokens,state.selected)}</div><p class="ch-hint">↩️ Tu t'es trompé ? Retouche un mot colorié pour effacer. La consigne reste visible.</p><button id="ch-check" class="ch-main">✓ Vérifier ma réponse</button><div id="ch-feedback" role="status"></div></div>`);
wireChips();$('#ch-check').onclick=()=>{
const correct=state.color===4&&state.selected.length===2&&state.selected.includes(2)&&state.selected.includes(4);
if(correct){db.tutorialDone=true;db.practice4Done=true;save();state.screen='practiceSuccess';render();return}
let msg=state.color!==4?'Choisis le surligneur VERT : il sert ici à repérer la négation.':state.selected.length===0?'Tu n’as encore surligné aucun mot. Cherche les deux petits mots qui entourent « joue ».':state.selected.some(i=>i!==2&&i!==4)?'Regarde les mots qui entourent « dort ». « ne » est placé avant le verbe et « jamais » après. Retouche les autres mots pour les effacer.':'Tu as trouvé une partie de la réponse ! La négation contient deux mots : « ne » ET « jamais ». Trouve celui qui manque.';
$('#ch-feedback').innerHTML='<p class="ch-error">'+esc(msg)+'</p>';speech(msg);
};}
function practiceSuccess(){wrap(`<div class="ch-card ch-center"><div class="ch-emoji">🌟</div><div class="ch-over">Mission finale réussie</div><h1>Bravo, mission accomplie !</h1><p>Tu as trouvé <strong>« ne » ET « jamais »</strong> avec le surligneur vert.</p><p>Dans « Le chien <strong>ne</strong> joue <strong>jamais</strong>. », ces deux mots entourent le verbe <strong>« joue »</strong> et rendent la phrase négative.</p><button id="ch-levels-go" class="ch-main">🗺️ Découvrir les trois niveaux →</button><button id="ch-replay" class="ch-minor">↻ Refaire la mission</button><button id="ch-end" class="ch-minor">← Retour aux mondes</button></div>`);$('#ch-levels-go').onclick=()=>{load();state.screen='levels';render()};$('#ch-replay').onclick=()=>{state.selected=[];state.color=4;state.screen='practice';render()};$('#ch-end').onclick=close;}
function canEnter(l){const passed=n=>D.some(x=>x.level===n&&Number(db.history[x.id]?.best)>=15);return l===0||(l===1&&passed(0))||(l===2&&passed(0)&&passed(1))}
function randomText(l){const items=D.filter(x=>x.level===l);if(!items.length){alert('Les textes du Challenge ne sont pas chargés. Recharge la page.');return null;}let bag=db.drawBags[l]||[];bag=bag.filter(id=>items.some(x=>x.id===id));if(!bag.length){const last=db.lastDraw?.[l];bag=items.map(x=>x.id);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}if(last&&bag.length>1&&bag[0]===last)[bag[0],bag[1]]=[bag[1],bag[0]];}const id=bag.shift();db.drawBags[l]=bag;db.lastDraw=db.lastDraw||{};db.lastDraw[l]=id;save();return id}
function levelsPage(){wrap(`<div class="ch-center"><div class="ch-emoji">🗺️</div><h1>Choisis ton niveau !</h1><p>Un niveau après l'autre : obtiens <strong>15/20 sur un seul texte</strong> pour débloquer le suivant.</p><p class="ch-hint">🎲 Un nouveau texte est choisi au hasard, sans répétition jusqu'au passage des 10 textes.</p></div><div class="ch-levels">${levels.map((l,i)=>{const ok=canEnter(i),range=['55 à 65','90 à 105','120 à 145'][i],help=['Aides détaillées','Corrections et comparaisons','Raisonnement sans compteur'][i],objectif=['Reconnaître','Appliquer et comprendre','Raisonner et transformer'][i];return `<button class="ch-card ch-level" data-level="${i}" ${ok?'':'disabled aria-disabled="true"'} style="${ok?'':'opacity:.65;cursor:not-allowed'}"><strong>${ok?'🔓':'🔒'} ${l}</strong><span>${range} mots · ${help}</span><span class="ch-goal">🎯 Objectif : ${objectif}</span><small>${ok?(i===0?'Accessible': 'Débloqué !'):(i===1?'Réussis un texte Explorateur avec 15/20':'Réussis un texte Expert avec 15/20')}</small></button>`}).join('')}</div><div class="ch-center"><button class="ch-minor" id="ch-help">📖 Revoir le tutoriel</button><p class="ch-hint">Version ${window.CE2_APP_VERSION||'indisponible'} · Cinq compétences : ponctuation, dialogue, temps, verbes et négation.</p></div>`);showResumeButton('.ch-levels');root.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{const l=+b.dataset.level;if(!canEnter(l))return;state.level=l;state.screen='select';render()});$('#ch-help').onclick=()=>{state.guideStep=0;state.guideColor=0;state.guideMarks={};state.guideChecked=false;state.guideVisited=[0];state.screen='guide';render()}}
function selectPage(){if(!canEnter(state.level)){state.screen='levels';render();return}const l=state.level;const hasPilot=!!(window.CE2_CHALLENGE_PILOT&&l>0);
const pilotInfo=hasPilot?'<p class="ch-hint">🏴‍☠️ Histoire pilote : dix missions progressives avec recherche d’indices et questions. Les autres histoires restent inchangées.</p><button class="ch-main" id="ch-pilot-story">🏴‍☠️ Le trésor des pirates · Histoire pilote</button><button class="ch-minor" id="ch-pilot-intro">📖 Revoir l’initiation (sans note)</button>':'';
wrap(`<button class="ch-minor" id="ch-back">← Les niveaux</button><div class="ch-card ch-center"><div class="ch-emoji">${['🧭','🔎','👑'][l]}</div><h1>${levels[l]}</h1><p>Objectif : <strong>15/20 sur un texte</strong>. Sur les histoires classiques, la bonne couleur compte. Sur l’histoire pilote, trouve les preuves puis réponds à la question. Après une erreur, tu peux réessayer sans points supplémentaires.</p><p class="ch-hint">Les textes sont tirés au hasard, sans répétition jusqu'à ce que les 10 soient proposés.</p><p class="ch-hint">Textes de ${['55 à 65','90 à 105','120 à 145'][l]} mots · 10 défis : 5 surlignages et 5 exercices de réflexion pour les histoires classiques.</p>${pilotInfo}<button id="ch-surprise" class="ch-main">🎲 Lancer un texte au hasard (essai)</button></div>`);showResumeButton('#ch-surprise');
if(hasPilot){
 $('#ch-pilot-story').onclick=()=>{if(db.inProgress&&!confirm('Une histoire est en cours. En commencer une nouvelle remplacera sa sauvegarde. Continuer ?'))return;start(l===1?'C2-01':'C3-01')};
 $('#ch-pilot-intro').onclick=()=>{state.pilotPending=null;state.pilotIntroStep=0;state.pilotDemoColor=-1;state.pilotDemoMarks={};state.screen='pilotIntro';render()};
}
$('#ch-back').onclick=()=>{state.screen='levels';render()};$('#ch-surprise').onclick=()=>{if(db.inProgress&&!confirm('Une histoire est en cours. En commencer une nouvelle remplacera sa sauvegarde. Continuer ?'))return;const id=randomText(l);if(id)start(id)}}
function start(id){
 const story=D.find(t=>t.id===id);
 if(!story){alert('Le texte n’est pas disponible. Recharge la page.');return;}
 state.id=id;state.level=story.level;
 const pilot=story.missions.filter(m=>m.mode==='pilot');
 if(pilot.length&&!db.pilotIntroSeen?.[story.level]){state.pilotPending=id;state.pilotIntroStep=0;state.pilotDemoColor=-1;state.pilotDemoMarks={};state.screen='pilotIntro';root.scrollTop=0;render();return;}
 state.step=0;state.selected=[];state.choice=-1;state.color=-1;state.score=0;state.errors=[];state.feedback=null;state.reviewing=false;
 state.pilotPhase=0;state.pilotMarks={};state.pilotColor=-1;state.pilotHint=0;state.pilotError='';
 if(pilot.length){state.questions=pilot;state.screen='play';rememberChallenge();root.scrollTop=0;render();return;}
 const kinds=['ponctuation','dialogue','temps','verbe','negation'];
 const choose=(list)=>list[Math.floor(Math.random()*list.length)];
 const ordered=kinds.map(kind=>{
  const available=story.missions.filter(m=>m.kind===kind);
  const marked=available.filter(m=>m.mode!=='choice'),advanced=available.filter(m=>m.mode==='choice');
  if(!marked.length||!advanced.length)throw Error('Activités insuffisantes : '+story.id+' / '+kind);
  return {kind,marked:choose(marked),advanced:choose(advanced)};
 });
 for(let i=ordered.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ordered[i],ordered[j]]=[ordered[j],ordered[i]]}
 state.questions=ordered.flatMap(row=>[row.marked,row.advanced]);
 state.screen='play';rememberChallenge();root.scrollTop=0;render();
}
// Les signes qui délimitent ou introduisent un dialogue sont aussi des signes de ponctuation.
// Règle partagée par les trois niveaux, sans changer les bonnes réponses ni le barème.
function acceptableColors(m,tokens){
 const base={ponctuation:0,dialogue:1,temps:2,verbe:3,negation:4}[m.kind];
 const accepted=[base];
 if(m.kind!=='ponctuation'&&m.kind!=='dialogue')return accepted;
 const answers=Array.isArray(m.answer)?m.answer:[];
 const signs=answers.map(i=>tokens[i]);
 if(!signs.length||!signs.every(t=>[':', '«', '»', '—', '–', '-'].includes(t)))return accepted;
 const colonIsDialogue=i=>{
   const after=tokens.slice(i+1,i+5);
   const before=tokens.slice(Math.max(0,i-4),i).map(x=>String(x).toLowerCase());
   return (after.includes('«')||after.includes('—')||after.includes('–')) && before.some(x=>['dit','demande','répond','répondit','murmure','s’écrie','crie','ajoute','annonce','explique','déclare','souffle'].includes(x));
 };
 const dialogueSign=answers.every(i=>tokens[i]!==':'||colonIsDialogue(i));
 if(dialogueSign)accepted.push(base===0?1:0);
 return [...new Set(accepted)];
}

function pilotIntroPage(){
 const config=window.CE2_CHALLENGE_PILOT;
 if(!config){state.screen='select';render();return;}
 const lesson=(state.level===1?config.level1:config.level2).intro;
 const i=Math.min(state.pilotIntroStep||0,lesson.length-1),part=lesson[i];
 wrap('<div class="ch-card ch-center"><div class="ch-emoji">📖</div><div class="ch-over">Initiation '+(state.level===1?'Expert':'Maître des mots')+' · '+(i+1)+' / '+lesson.length+'</div><h1>'+esc(part.title)+'</h1><p>'+esc(part.body)+'</p><p class="ch-hint">Cette initiation n’est pas notée.</p><button id="ch-pilot-next" class="ch-main">'+(i===lesson.length-1?'J’ai compris, commencer les missions →':'Je continue →')+'</button><button id="ch-pilot-back" class="ch-minor">← Retour aux histoires</button></div>');
 const demoReady=i===1?mountPilotIntroDemo():true;
 $('#ch-pilot-back').onclick=()=>{state.pilotPending=null;state.screen='select';render()};
 $('#ch-pilot-next').onclick=()=>{
  if(!demoReady)return;
  if(i+1<lesson.length){state.pilotIntroStep++;render();return;}
  db.pilotIntroSeen=db.pilotIntroSeen||{};db.pilotIntroSeen[state.level]=true;save();
  const pending=state.pilotPending;state.pilotPending=null;
  if(pending)start(pending);else{state.screen='select';render();}
 };
}

function mountPilotIntroDemo(){
 const isExpert=state.level===1;
 const words=isExpert?['Tom','demande',':','«','Où','est','la','clé','?','»']:['Lina','ne','trouve','pas','la','clé','.'];
 const needed=isExpert?[[1,1],[8,0]]:[[1,4],[3,4],[2,3]];
 const marks=state.pilotDemoMarks||{};
 const done=Object.keys(marks).length===needed.length&&needed.every(([word,color])=>marks[word]===color);
 const prompt=isExpert?'Essaie : colorie « demande » en orange, puis « ? » en jaune.':'Essaie : colorie « ne » et « pas » en vert, puis « trouve » en violet.';
 const colors=MARKERS.map((c,i)=>'<button class="ch-color'+(state.pilotDemoColor===i?' active':'')+'" data-pilot-demo-color="'+i+'" style="background:'+c.hex+'" aria-label="Surligneur '+c.name+'">✎</button>').join('');
 const tokens=words.map((word,i)=>'<button class="ch-token'+(marks[i]!==undefined?' ch-marked':'')+'" data-pilot-demo-word="'+i+'"'+(marks[i]!==undefined?' style="--marker:'+MARKERS[marks[i]].hex+'"':'')+'>'+esc(word)+'</button>').join(' ');
 $('#ch-pilot-next').insertAdjacentHTML('beforebegin','<div class="ch-card"><p class="ch-task">'+esc(prompt)+'</p><div class="ch-colors">'+colors+'</div><p class="ch-hint">Couleur choisie : '+(state.pilotDemoColor<0?'Aucune':MARKERS[state.pilotDemoColor].name)+'</p><div class="ch-text ch-pilot-excerpt">'+tokens+'</div><p class="ch-hint" role="status">'+(done?'✨ Bravo ! Tu sais utiliser plusieurs couleurs.':'Touche une couleur, puis un mot. Retouche un mot pour l’effacer.')+'</p></div>');
 $('#ch-pilot-next').disabled=!done;
 root.querySelectorAll('[data-pilot-demo-color]').forEach(b=>b.onclick=()=>{state.pilotDemoColor=+b.dataset.pilotDemoColor;render()});
 root.querySelectorAll('[data-pilot-demo-word]').forEach(b=>b.onclick=()=>{
  const i=+b.dataset.pilotDemoWord;
  if(Object.prototype.hasOwnProperty.call(state.pilotDemoMarks,i))delete state.pilotDemoMarks[i];
  else if(state.pilotDemoColor>=0)state.pilotDemoMarks[i]=state.pilotDemoColor;
  render();
 });
 return done;
}
function playPilot(story,m){
 const phase=state.pilotPhase||0,marks=state.pilotMarks||{},first=m.range[0],last=m.range[1],hint=state.pilotHint||0;
 const excerpt=story.tokens.slice(first,last+1).map((word,i)=>{
  const idx=i+first,chosen=marks[idx],picked=chosen!==undefined;
  const bg=picked?' style="--marker:'+MARKERS[chosen].hex+'"':'';
  return '<button type="button" class="ch-token'+(picked?' ch-marked':'')+'" data-pilot-word="'+idx+'"'+bg+' aria-label="'+esc(word)+(picked?' colorié en '+MARKERS[chosen].name:'')+'">'+esc(word)+'</button>';
 }).join(' ');
 const colors=MARKERS.map((c,i)=>'<button type="button" data-pilot-color="'+i+'" class="ch-color'+(state.pilotColor===i?' active':'')+'" style="background:'+c.hex+'" aria-label="Surligneur '+c.name+'">✎</button>').join('');
 const proof=story.tokens.slice(first,last+1).map((word,i)=>{const chosen=marks[i+first];return '<span class="ch-pilot-proof-word'+(chosen!==undefined?' ch-marked':'')+'"'+(chosen!==undefined?' style="--marker:'+MARKERS[chosen].hex+'"':'')+'>'+esc(word)+'</span>'}).join(' ');
 const choices=m.options.map((option,i)=>'<button type="button" class="ch-option'+(state.choice===i?' active':'')+'" data-pilot-choice="'+i+'" aria-pressed="'+(state.choice===i)+'">'+esc(option)+'</button>').join('');
 const taskHtml=phase===0?
  '<p class="ch-task">🎨 Étape 1 sur 2 · Retrouve les preuves</p><p>'+esc(m.task)+'</p><p class="ch-hint">Touche un surligneur, puis les mots demandés. Tu peux changer de couleur sans perdre les autres. Retouche un mot pour l’effacer.</p><div class="ch-colors">'+colors+'</div><p class="ch-hint">Couleur choisie : '+(state.pilotColor<0?'Aucune':MARKERS[state.pilotColor].name)+'</p><div class="ch-text ch-pilot-excerpt">'+excerpt+'</div><button id="ch-pilot-check" class="ch-main">✓ Vérifier mes indices</button>':
  '<p class="ch-task">🧩 Étape 2 sur 2 · Comprends l’histoire</p><p>Relis les indices trouvés :</p><div class="ch-text ch-pilot-proof">'+proof+'</div><p class="ch-task">'+esc(m.question)+'</p><div class="ch-options">'+choices+'</div><button id="ch-check" class="ch-main">✓ Vérifier ma réponse</button>';
 wrap('<div class="ch-over">'+esc(levels[story.level])+' · '+(story.level===2?'Mission en cours':'Mission '+(state.step+1)+' sur 10')+'</div><h1>'+esc(story.title)+'</h1><div class="ch-card"><p class="ch-hint">🏴‍☠️ Histoire pilote · '+esc(m.title)+'</p>'+taskHtml+
  '<button id="ch-pilot-help" class="ch-minor">💡 '+(hint===0?'Aide-moi':hint===1?'Encore un indice':'Relire mon indice')+'</button><div id="ch-feedback" role="status">'+(state.pilotError?'<div class="ch-error">'+esc(state.pilotError)+'</div>':'')+'</div></div><button id="ch-quit" class="ch-minor">← Choisir une autre histoire</button>');
 $('#ch-quit').onclick=()=>{rememberChallenge();state.screen='select';render()};
 $('#ch-pilot-help').onclick=()=>{state.pilotHint=Math.min(2,hint+1);state.pilotError=state.pilotHint===1?m.help:'Relis attentivement la consigne et le passage.';rememberChallenge();render()};
 if(phase===0){
  root.querySelectorAll('[data-pilot-color]').forEach(b=>b.onclick=()=>{state.pilotColor=+b.dataset.pilotColor;state.pilotError='';rememberChallenge();render()});
  root.querySelectorAll('[data-pilot-word]').forEach(b=>b.onclick=()=>{
   const k=+b.dataset.pilotWord;
   if(Object.prototype.hasOwnProperty.call(state.pilotMarks,k))delete state.pilotMarks[k];
   else if(state.pilotColor<0){state.pilotError='Choisis d’abord une couleur de surligneur.';}
   else state.pilotMarks[k]=state.pilotColor;
   rememberChallenge();render();
  });
  $('#ch-pilot-check').onclick=()=>{
   const pairs=m.evidence,ok=Object.keys(state.pilotMarks).length===pairs.length&&pairs.every(([k,c])=>state.pilotMarks[k]===c);
   if(!ok){state.pilotError='Ce n’est pas encore ça. '+m.help;speech(m.help);render();return;}
   state.pilotError='';state.pilotPhase=1;state.choice=-1;state.pilotHint=0;rememberChallenge();render();
  };
 }else{
  root.querySelectorAll('[data-pilot-choice]').forEach(b=>b.onclick=()=>{if(state.feedback)return;state.choice=+b.dataset.pilotChoice;state.pilotError='';rememberChallenge();render()});
  if(state.feedback){showChallengeFeedback(story);return;}
  $('#ch-check').onclick=()=>{
   if(state.choice<0){state.pilotError='Choisis une réponse avant de vérifier.';render();return;}
   const ok=state.choice===m.correct,firstAttempt=!state.reviewing;
   if(firstAttempt){
    if(ok)state.score+=2;
    else state.errors.push({prompt:m.question,expected:m.options[m.correct],explanation:m.explanation});
   }
   const msg=state.reviewing?(ok?'Bravo, tu as compris ! Ce nouvel essai ne change pas ta note.':'Relis cette explication : '+m.explanation):
    ok?'Bravo ! Tu as bien utilisé les indices. 2 points !':'Regarde ce que racontent les indices. '+m.explanation;
   state.feedback={ok,points:ok&&firstAttempt?2:0,msg,reviewed:state.reviewing};
   rememberChallenge();
   if(!ok)speech(m.explanation);else if(!state.reviewing&&state.step%4===0)speech('Bravo !');
   showChallengeFeedback(story);
  };
 }
}

function showChallengeFeedback(story){
 const feedback=state.feedback;
 root.querySelectorAll('[data-token],[data-color],[data-choice],[data-pilot-word],[data-pilot-color],[data-pilot-choice]').forEach(b=>b.disabled=true);
 const check=$('#ch-check');if(check)check.disabled=true;
 const points=feedback.points||0;
 const text=feedback.ok?'ch-success':points===1?'ch-notice':'ch-error';
 const retry= !feedback.ok&&!state.reviewing && !feedback.reviewed && '<button class="ch-minor" id="ch-retry">↻ Réessayer pour comprendre (sans point supplémentaire)</button>';
 $('#ch-feedback').innerHTML=`<div class="${text}">${esc(feedback.msg)}</div>${retry||''}<button class="ch-main" id="ch-next">${state.step===9?'Voir mon résultat':'Question suivante →'}</button>`;
 if($('#ch-retry'))$('#ch-retry').onclick=()=>{
  state.reviewing=true;state.feedback=null;state.selected=[];state.choice=-1;state.color=-1;
  rememberChallenge();render();
 };
 $('#ch-next').onclick=()=>{
  state.step++;state.selected=[];state.choice=-1;state.color=-1;state.feedback=null;state.reviewing=false;state.pilotPhase=0;state.pilotMarks={};state.pilotColor=-1;state.pilotHint=0;state.pilotError='';
  if(state.step===10){
   const previous=db.history[story.id]||{best:0,attempts:0};
   db.history[story.id]={best:Math.max(previous.best,state.score),last:state.score,attempts:previous.attempts+1,date:new Date().toISOString()};
   if(state.score>=15&&story.level<2)db.unlocked[story.level+1]=true;
   delete db.inProgress;save();state.screen='result';
  }else rememberChallenge();
  root.scrollTop=0;render();
 };
}
function play(){
 const story=D.find(t=>t.id===state.id);
 if(!story){state.screen='levels';render();return;}
 const m=state.questions[state.step];if(m.mode==='pilot'){playPilot(story,m);return;}
 const hard=story.level===2,mc=m.mode==='choice';
 const focus=story.focusExcerpt?`<details class="ch-focus"><summary>📖 Lire le passage ajouté à ce niveau</summary><p>${esc(story.focusExcerpt)}</p></details>`:"";
 const cards=mc?`${focus}<div class="ch-text ch-story"><p>${esc(story.text)}</p></div><div class="ch-options" role="group" aria-label="Choisis la bonne réponse">${m.options.map((option,i)=>`<button type="button" class="ch-option ${state.choice===i?'active':''}" data-choice="${i}" aria-pressed="${state.choice===i}">${esc(option)}</button>`).join('')}</div>`:
 `${colorsUI()}<div class="ch-text">${chips(story.tokens,state.selected)}</div>`;
 wrap(`<div class="ch-over">${levels[story.level]}${hard?'':' · Mission '+(state.step+1)+' sur 10'}</div><h1>${esc(story.title)}</h1><div class="ch-card"><p class="ch-task">🎯 ${esc(m.prompt)}</p>${cards}<button id="ch-check" class="ch-main">Vérifier ✓</button><div id="ch-feedback" role="status"></div></div><button id="ch-quit" class="ch-minor">← Choisir une autre histoire</button>`);
 $('#ch-quit').onclick=()=>{rememberChallenge();state.screen='select';root.scrollTop=0;render()};
 if(mc){
  root.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{state.choice=Number(button.dataset.choice);rememberChallenge();render()});
 }else wireChips();
 if(state.feedback){showChallengeFeedback(story);return;}
 $('#ch-check').onclick=()=>{
  if(mc&&state.choice<0){$('#ch-feedback').innerHTML='<div class="ch-error">Choisis une réponse avant de vérifier.</div>';return;}
  if(!mc&&state.color<0){$('#ch-feedback').innerHTML='<div class="ch-error">Choisis d’abord un surligneur.</div>';return;}
  const palette=mc?[]:acceptableColors(m,story.tokens);
  const graded=window.CE2_CHALLENGE_PEDAGOGY.grade(m,state.selected,state.color,state.choice,palette);
  const firstAttempt=!state.reviewing;
  if(firstAttempt){
   state.score+=graded.points;
   if(!graded.ok)state.errors.push({prompt:m.prompt,expected:mc?m.options[m.correct]:m.words.join(' + '),explanation:m.explanation});
  }
  let msg;
  if(state.reviewing){
   msg=graded.ok?'Bravo, tu as compris ! Ce nouvel essai ne change pas ta note.':'Regarde la correction : '+m.explanation+' La réponse est : '+(mc?m.options[m.correct]:m.words.join(' et '))+'.';
  }else if(graded.ok){
   msg='Bravo, réponse complète : 2 points !';
  }else if(graded.points===1){
   msg='Tu as trouvé les bons mots : 1 point. La couleur attendue était '+MARKERS[palette[0]].name.toLowerCase()+'. '+m.explanation;
  }else{
   msg='La bonne réponse est : '+(mc?m.options[m.correct]:m.words.join(' et '))+'. '+m.explanation;
  }
  const wasReview=state.reviewing;
  state.feedback={ok:graded.ok,points:firstAttempt?graded.points:0,msg,reviewed:wasReview};
  rememberChallenge();
  if(!graded.ok)speech(m.explanation);
  else if(!wasReview&&state.step%4===0)speech('Bravo !');
  showChallengeFeedback(story);
 };
}
function result(){let x=D.find(t=>t.id===state.id),score=state.score;load();wrap(`<div class="ch-card ch-center"><div class="ch-emoji">${score===20?'🏆':score>=12?'🌟':'🌱'}</div><h1>Défi terminé !</h1><div class="ch-score">${score}/20</div><p>${score===20?'Magnifique ! Tu as tout trouvé !':'Chaque essai t’aide à progresser. Bravo pour tes efforts !'}</p></div>${score>=15&&x.level<2?'<div class="ch-card ch-center">🔓 Bravo ! Le niveau suivant est débloqué pour ton profil.</div>':''}${state.errors.length?`<div class="ch-card"><h2>Comprendre mes erreurs</h2>${state.errors.map(e=>`<details class="ch-detail"><summary>${esc(e.prompt)}</summary><p><strong>Réponse : ${esc(e.expected)}</strong></p><p>${esc(e.explanation)}</p><button class="ch-minor ch-voice" data-voice="${esc(e.explanation)}">🔊 Écouter</button></details>`).join('')}</div>`:'<div class="ch-card ch-center">✨ Aucune erreur !</div>'}${score>=15&&x.level<2&&canEnter(x.level+1)?'<button class="ch-main" id="ch-next-level">🚀 Passer au niveau supérieur</button>':''}<button class="ch-main" id="ch-levels-return">🗺️ Retour au choix des niveaux</button><button class="ch-main" id="ch-again">Rejouer ce texte</button><button class="ch-minor" id="ch-list">Choisir un autre texte</button>`);$('#ch-again').textContent='🎲 Essayer un autre texte';$('#ch-again').onclick=()=>{const id=randomText(x.level);if(id)start(id)};$('#ch-list').onclick=()=>{state.screen='select';render()};$('#ch-levels-return').onclick=()=>{state.screen='levels';render()};const nextButton=$('#ch-next-level');if(nextButton)nextButton.onclick=()=>{load();if(!canEnter(x.level+1)){state.screen='levels';render();return}state.level=x.level+1;state.screen='select';render()};root.querySelectorAll('[data-voice]').forEach(b=>b.onclick=()=>speech(b.dataset.voice))}
const btn=document.createElement('button');btn.type='button';btn.id='challenge-entry';function refreshChallengeNav(){const unlocked=typeof window.ce2ChallengeUnlocked==='function'&&window.ce2ChallengeUnlocked();btn.textContent=unlocked?'✨ Challenge':'🔒 Challenge';btn.setAttribute('aria-label',unlocked?'Mode Challenge débloqué':'Mode Challenge verrouillé : obtenir 15 sur 20 à l’évaluation générale');btn.title=unlocked?'Accéder au Mode Challenge':'Obtiens au moins 15/20 à l’évaluation générale';btn.classList.toggle('challenge-nav-locked',!unlocked)}window.ce2RefreshChallengeNav=refreshChallengeNav;refreshChallengeNav();btn.addEventListener('click',()=>{refreshChallengeNav();if(typeof window.ce2OpenChallengeWithGate==='function')window.ce2OpenChallengeWithGate();else alert('Le Mode Challenge est momentanément indisponible. Recharge la page.')});document.getElementById('nav').appendChild(btn);if(location.hash==='#challenge'){location.hash='';if(typeof window.ce2OpenChallengeWithGate==='function')window.ce2OpenChallengeWithGate()}})();
