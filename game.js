(()=>{'use strict';const D=window.CE2_DATA,W=D.worlds,root=document.getElementById('scene'),canvas=document.getElementById('world'),ctx=canvas.getContext('2d');const names=['Flamme','Foxy','Luna','Bip','Panda','Princesse Étoile','Fée Iris','Super Nova','Magicienne Zoé','Mimi','Coralie','Éclair'];const symbols=['🌲','💬','⌛','🔍','✨'];const palettes=[['#102a3c','#2a7e70','#103c37'],['#2d1d48','#854d83','#342452'],['#17264f','#476cb4','#23365e'],['#142d44','#32777c','#193b49'],['#37224d','#9b638f','#432752']];const KEY='ce2_v82526_clean_progress';let soundOn=true,audioCtx=null;function chime(ok){if(!soundOn)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();let now=audioCtx.currentTime;[0,1,2].forEach((i)=>{let osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=(ok?[523,659,784]:[330,294,262])[i];gain.gain.setValueAtTime(.0001,now+i*.09);gain.gain.exponentialRampToValueAtTime(.07,now+i*.09+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.16);osc.connect(gain).connect(audioCtx.destination);osc.start(now+i*.09);osc.stop(now+i*.09+.18)})}catch{}}let S={name:'',hero:1,coins:0,world:0,step:0,correct:0,completed:{},screen:'home',answered:null,awarded:{},history:[],exam:null,examHistory:[],attempts:{},practice:null,assisted:0};try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{};const PROFILE_KEY='ce2_v82526_clean_profiles';let profiles={},activeId='';try{let d=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');profiles=d.profiles||{};activeId=d.activeId||''}catch{};const fresh=()=>({name:'',hero:1,coins:0,world:0,step:0,correct:0,completed:{},screen:'home',answered:null,awarded:{},history:[],tutorialDone:false,exam:null,examHistory:[],attempts:{},practice:null,assisted:0,worldRuns:{},questionDecks:{},lastQuestionTopics:{},runQuestions:null,rewardStats:null});const RUN_SIZE=10;
function exportProfiles(){const payload={format:'royaume-ce2-backup',version:1,createdAt:new Date().toISOString(),profiles,activeId,legacyGuest:localStorage.getItem(KEY),legacyProfiles:localStorage.getItem('ce2_v712_profiles'),legacyChallengeGuest:localStorage.getItem('ce2_challenge_v8254_guest'),challenges:{}};for(const id of Object.keys(profiles)){payload.challenges[id]=localStorage.getItem('ce2_challenge_v8254_'+id)}const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='sauvegarde-royaume-ce2-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
async function importProfiles(file){
 if(!file)return;
 if(file.size>10000000){alert('Le fichier de sauvegarde est trop volumineux (limite 10 Mo).');return}
 let payload;
 try{payload=JSON.parse(await file.text())}catch{alert('Impossible de lire ce fichier JSON.');return}
 if(!payload||payload.format!=='royaume-ce2-backup'||payload.version!==1||!payload.profiles||typeof payload.profiles!=='object'||Array.isArray(payload.profiles)){
  alert('Ce fichier ne correspond pas à une sauvegarde compatible du Royaume des Mots.');return;
 }
 const entries=Object.entries(payload.profiles);
 if(!entries.length||entries.length>30){alert('Sauvegarde vide ou nombre de profils excessif.');return}
 const restored={};const idMap={};const importedChallenge={};
 for(const [oldId,value] of entries){
  if(!value||typeof value!=='object'||Array.isArray(value)){alert('Sauvegarde invalide : profil endommagé.');return}
  const name=String(value.firstName||value.name||'').trim().slice(0,28);
  if(!name){alert('Sauvegarde invalide : prénom manquant.');return}
  let newId;
  do{newId='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,9)}while(profiles[newId]||restored[newId]);
  idMap[oldId]=newId;
  restored[newId]={...fresh(),...value,name,firstName:name,screen:'home'};
  const stored=payload.challenges&&payload.challenges[oldId];
  if(typeof stored==='string'){
   try{const obj=JSON.parse(stored);if(obj&&typeof obj==='object'&&!Array.isArray(obj))importedChallenge[newId]=stored}catch{}
  }
 }
 if(!confirm('Importer '+entries.length+' profil(s) ? Ils seront ajoutés sans remplacer les enfants déjà enregistrés.'))return;
 let original;
 try{original=localStorage.getItem(PROFILE_KEY)}catch{alert('Le stockage local est inaccessible.');return}
 const written=[];
 try{
  localStorage.setItem(PROFILE_KEY,JSON.stringify({profiles:{...profiles,...restored},activeId}));
  for(const [id,raw] of Object.entries(importedChallenge)){const key='ce2_challenge_v8254_'+id;localStorage.setItem(key,raw);written.push(key)}
  Object.assign(profiles,restored);
  alert(entries.length+' profil(s) restauré(s). Ouvre « Changer d’enfant » pour les retrouver. Les profils existants ont été préservés.');
  update();
 }catch(e){
  try{for(const key of written)localStorage.removeItem(key);if(original===null)localStorage.removeItem(PROFILE_KEY);else localStorage.setItem(PROFILE_KEY,original)}catch{}
  alert('La restauration a échoué, peut-être par manque de place. Les profils présents n’ont pas été remplacés.');
 }
}
function sessionLength(){return Math.min(RUN_SIZE,W[S.world].questions.length)}
function sessionQuestionIndex(step){return (Array.isArray(S.runQuestions)&&Number.isInteger(S.runQuestions[step]))?S.runQuestions[step]:step}
function sessionQuestion(step){return W[S.world].questions[sessionQuestionIndex(step)]}
function questionTopic(world,index){
 const q=W[world].questions[index];
 const answer=String(q.options[q.answer]||'').trim();
 if(world===0)return ({'?':'interrogation','!':'exclamation','.':'point',',':'virgule',':':'deux-points','…':'suspension','La phrase reste en suspens':'suspension'})[answer]||answer;
 return answer.toLocaleLowerCase('fr');
}
function orderByTopic(world,indices,previousTopic){
 const result=[],remaining=[...indices];
 while(remaining.length){
   const last=result.length?questionTopic(world,result[result.length-1]):previousTopic;
   const candidates=remaining.map((id,i)=>({id,i})).filter(x=>questionTopic(world,x.id)!==last);
   const pool=candidates.length?candidates:remaining.map((id,i)=>({id,i}));
   const chosen=pool[Math.floor(Math.random()*pool.length)];
   result.push(chosen.id);remaining.splice(chosen.i,1);
 }
 return result;
}
function newQuestionRun(world){
 S.questionDecks=S.questionDecks||{};
 S.lastQuestionTopics=S.lastQuestionTopics||{};
 if((world===0||world===4)&&window.CE2_PEDAGOGY){
   // Dix compétences distinctes, dix situations différentes pour Lunettes magiques.
   // Les 100 questions passent une fois chacune avant de commencer un nouveau cycle.
   S.pedagogicalTurns=S.pedagogicalTurns||{};
   const turn=Number(S.pedagogicalTurns[world])||0;
   const selection=window.CE2_PEDAGOGY.makeRun(world,turn,S.lastQuestionTopics[world]||null);
   S.runQuestions=selection.indices;
   S.lastQuestionTopics[world]=selection.lastTopic;
   S.pedagogicalTurns[world]=turn+1;
   return;
 }
 if(world===2||world===3){
   // Une partie = deux définitions, deux identifications, deux applications,
   // deux corrections, une comparaison et un raisonnement.
   // Chaque famille contient dix exercices inédits, répartis sur dix sessions :
   // pas de nouvelle question avant d'avoir parcouru les cent.
   const bank=W[world].questions,types=['definition','identification','application','correction','comparaison','raisonnement'];
   let deck=Array.isArray(S.questionDecks[world])?S.questionDecks[world].filter(i=>Number.isInteger(i)&&i>=0&&i<bank.length):[];
   deck=[...new Set(deck)];
   const chosen=[];
   for(let family=0;family<10;family++){
     let available=deck.filter(i=>bank[i].learningFamily===family);
     if(!available.length){
       const fresh=bank.map((q,i)=>({q,i})).filter(x=>x.q.learningFamily===family).map(x=>x.i);
       if(fresh.length!==10)throw Error('Contrôle pédagogique : famille incomplète dans le monde '+world);
       deck=deck.filter(i=>bank[i].learningFamily!==family).concat(fresh);
       available=fresh;
     }
     available.sort((a,b)=>bank[a].learningRound-bank[b].learningRound);
     const selected=available[0];
     chosen.push(selected);
     deck.splice(deck.indexOf(selected),1);
   }
   const result=[],remaining=chosen.slice();
   // Une sélection complète évite même la répétition des démarches aux deux
   // dernières questions ; le tirage varie d'une aventure à l'autre.
   function arrange(previous){
     if(!remaining.length)return true;
     const eligible=remaining.filter(i=>bank[i].learningType!==previous);
     for(let n=eligible.length-1;n>0;n--){const k=Math.floor(Math.random()*(n+1));[eligible[n],eligible[k]]=[eligible[k],eligible[n]]}
     for(const idx of eligible){
       result.push(idx);remaining.splice(remaining.indexOf(idx),1);
       if(arrange(bank[idx].learningType))return true;
       result.pop();remaining.push(idx);
     }
     return false;
   }
   if(!arrange(S.lastQuestionTopics[world]||null))throw Error('Contrôleur pédagogique : alternance impossible dans le monde '+world);
   S.runQuestions=result;
   S.questionDecks[world]=deck;
   S.lastQuestionTopics[world]=bank[result[result.length-1]].learningType;
   return;
 }
 if(world===1){
   // Banque enrichie : chaque partie associe cinq repérages et cinq réinvestissements.
   // Dix parties couvrent la banque de 100 questions sans répétition.
   if(window.CE2_PEDAGOGY?.makeDialogueRun){
     S.pedagogicalTurns=S.pedagogicalTurns||{};
     const turn=Number(S.pedagogicalTurns[world])||0;
     const selected=window.CE2_PEDAGOGY.makeDialogueRun(turn,S.lastQuestionTopics[world]||null);
     S.runQuestions=selected.indices;
     S.lastQuestionTopics[world]=selected.lastTopic;
     S.pedagogicalTurns[world]=turn+1;
     return;
   }
   // Deux questions par compétence, sans deux compétences identiques à la suite.
   const topics=['verbes','tirets','deux-points','guillemets','dialogue'];
   let deck=Array.isArray(S.questionDecks[world])?S.questionDecks[world]:[];
   deck=deck.filter(x=>Number.isInteger(x)&&x>=0&&x<W[world].questions.length);
   const chosen=[];
   const difficultyRank={easy:0,medium:1,hard:2};
   for(const topic of topics){
     let available=deck.filter(x=>W[world].questions[x].topic===topic);
     if(available.length<2){
       // Nouveau cycle de 20 questions pour cette notion.
       const all=W[world].questions.map((q,i)=>({q,i})).filter(x=>x.q.topic===topic).map(x=>x.i);
       for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]]}
       deck=deck.filter(x=>W[world].questions[x].topic!==topic).concat(all);
       available=all;
     }
     available.sort((a,b)=>difficultyRank[W[world].questions[a].difficulty]-difficultyRank[W[world].questions[b].difficulty]||a-b);
     chosen.push(...available.slice(0,2));
     for(const id of available.slice(0,2)){const pos=deck.indexOf(id);if(pos>=0)deck.splice(pos,1)}
   }
   const groups=Object.fromEntries(topics.map(topic=>[topic,chosen.filter(id=>W[world].questions[id].topic===topic)]));
   const run=[];
   // Cherche une séquence valide plutôt qu'un choix glouton susceptible de
   // bloquer sur deux questions de la même compétence en fin de partie.
   function arrange(previous){
     if(run.length===RUN_SIZE)return true;
     const eligible=topics.filter(topic=>groups[topic].length&&topic!==previous);
     eligible.sort((a,b)=>groups[b].length-groups[a].length||(Math.random()-.5));
     for(const topic of eligible){
       const id=groups[topic].pop();
       run.push(id);
       if(arrange(topic))return true;
       run.pop();
       groups[topic].push(id);
     }
     return false;
   }
   if(!arrange(S.lastQuestionTopics[world]||null))throw Error('Répartition pédagogique impossible : monde '+world);
   S.runQuestions=run;S.questionDecks[world]=deck;
   S.lastQuestionTopics[world]=W[world].questions[run[run.length-1]].topic;
   return;
 }
 let deck=Array.isArray(S.questionDecks[world])?S.questionDecks[world].filter(x=>Number.isInteger(x)&&x>=0&&x<W[world].questions.length):[];
 const lastTopic=S.lastQuestionTopics[world]||null;
 if(deck.length<RUN_SIZE){
   deck=Array.from({length:W[world].questions.length},(_,i)=>i);
   for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
 }
 // L'enfant commence par les notions de base, puis accède progressivement
 // aux questions intermédiaires et difficiles. Les identifiants du cycle restent uniques.
 const ranks={easy:0,medium:1,hard:2};
 deck.sort((a,b)=>ranks[W[world].questions[a].difficulty]-ranks[W[world].questions[b].difficulty]);
 S.runQuestions=orderByTopic(world,deck.splice(0,RUN_SIZE),lastTopic);
 S.questionDecks[world]=deck;
 S.lastQuestionTopics[world]=questionTopic(world,S.runQuestions[S.runQuestions.length-1]);
}
function ensureState(){
 S.worldRuns=S.worldRuns||{};
 S.history=Array.isArray(S.history)?S.history:[];
 S.examHistory=Array.isArray(S.examHistory)?S.examHistory:[];
 S.attempts=S.attempts||{};
 S.completed=S.completed||{};
 S.awarded=S.awarded||{};
 S.assisted=Number(S.assisted)||0;
 S.questionDecks=S.questionDecks||{};
 S.lastQuestionTopics=S.lastQuestionTopics||{};
 const historyPerfect=S.history.filter(x=>x.total===10&&x.score===10).length;
 // La galerie ne conserve que 60 parties : les récompenses utilisent des
 // compteurs cumulés et les identifiants de parties terminées, jamais sa longueur.
 const awarded=Object.values(S.awarded).filter(Boolean);
 const recordedPerfect=awarded.filter(x=>typeof x==='object'&&x.perfect===true).length;
 if(!S.rewardStats||typeof S.rewardStats!=='object')S.rewardStats={runs:0,perfect:0};
 S.rewardStats.runs=Math.max(0,Number(S.rewardStats.runs)||0,S.history.length,awarded.length);
 // Les vieux identifiants contiennent true, sans score : ne pas inventer
 // d'anciens sans-faute impossibles à retrouver après la limite de 60 parties.
 S.rewardStats.perfect=Math.max(0,Number(S.rewardStats.perfect)||0,historyPerfect,recordedPerfect);
}function storeProfiles(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify({profiles,activeId}))}catch{}}function persist(){if(activeId){profiles[activeId]={...S};storeProfiles()}else{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}}}const save=persist;function speakError(msg){try{speechSynthesis.cancel();if(!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(msg);u.lang='fr-FR';u.rate=.88;u.pitch=1.04;const v=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('fr'));if(v)u.voice=v;speechSynthesis.speak(u)}catch{}}function stopSpeech(){try{speechSynthesis.cancel()}catch{}}function praiseSometimes(){if(!soundOn)return;S.praiseCount=(S.praiseCount||0)+1;if(S.praiseCount%3!==1)return;try{const u=new SpeechSynthesisUtterance(['Bravo ! Tu progresses très bien !','Super ! Continue ton aventure !','Quelle belle série de réussites !'][Math.floor(S.praiseCount/3)%3]);u.lang='fr-FR';u.rate=.95;u.volume=1;const v=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('fr'));if(v)u.voice=v;speechSynthesis.speak(u)}catch{}}function switchProfile(id){stopSpeech();if(!profiles[id])return;activeId=id;S={...fresh(),...profiles[id]};ensureState();S.screen=S.tutorialDone?'home':'tutorial';guideReturn=null;guideStep=0;storeProfiles();save();update()}function createProfile(first){const name=($('#new-first')?.value||'').trim().slice(0,28),last='';if(!name){$('#profile-error').textContent='Écris au moins ton prénom pour commencer.';return}const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);profiles[id]={...fresh(),name,firstName:name,lastName:last};activeId=id;S={...profiles[id]};storeProfiles();save();guideStep=0;S.tutorialDone=false;save();go('tutorial')}function onboarding(){
const existing=Object.entries(profiles);
const returning=existing.length>0;
const active=profiles[activeId]||existing[0]?.[1];
const selectedId=profiles[activeId]?activeId:existing[0]?.[0];
const name=active?escape(active.firstName||active.name||'Aventurier'):'';
root.innerHTML=`<div class="castle-welcome welcome-v77"><div class="welcome-symbol" aria-hidden="true">✦ ✧ ✦</div><div class="castle-menu"><div class="eyebrow">✦ LE ROYAUME DES MOTS ✦</div><h1>La grande aventure du français</h1>${returning?`<p class="castle-greeting">Bon retour, ${name} !</p><p class="castle-description">Ton aventure t'attend. Prêt à retrouver tes mondes magiques ?</p><button class="cta castle-button" id="resume-adventure" type="button">Continuer mon aventure</button><button class="secondary castle-button" id="switch-adventurer" type="button">Changer d'enfant</button>`:`<p class="castle-greeting">Bienvenue, jeune aventurier !</p><p class="castle-description">Explore cinq mondes magiques, relève des défis de français et gagne des trésors. Chaque erreur t'aide à apprendre !</p><label class="castle-label" for="new-first">Quel est ton prénom ?</label><input id="new-first" maxlength="28" autocomplete="given-name" placeholder="Écris ton prénom…"><p id="profile-error" class="notice" aria-live="polite"></p><button class="cta castle-button" id="make-profile" type="button">Commencer mon aventure</button>`}${!returning?`<button class="secondary castle-button" id="existing-adventurer" type="button">J’ai déjà un profil</button><p id="existing-help" class="welcome-install-help" hidden>Les profils sont enregistrés sur l’appareil et le navigateur où ils ont été créés. Pour retrouver ton profil, ouvre le jeu sur cet appareil en navigation normale.</p>`:""}<aside class="device-install-panel" id="device-install-panel" aria-label="Installer ou jouer sur ordinateur, tablette et téléphone"><div class="device-install-heading">📱 💻 ✨ Joue où tu veux !</div><p>Retrouve <strong>La grande aventure du français CE2</strong> sur <strong>téléphone, tablette ou ordinateur</strong>.</p><button type="button" class="device-install-action" id="device-install-action">⬇ Installer gratuitement le jeu</button><p class="device-install-small">Ou joue directement dans ton navigateur, sans installation.</p><p class="device-install-small">🔒 Ta progression reste enregistrée sur cet appareil, tant que ses données sont conservées. Elle n'est pas synchronisée entre appareils.</p><div id="device-install-guidance" class="device-install-guidance" hidden role="status"></div></aside>${returning?`<div id="choose-adventurer" class="castle-chooser" hidden><p>Qui joue aujourd'hui ?</p><div class="profile-grid">${existing.map(([id,v])=>`<button class="profile-choice" data-profile="${escape(id)}" type="button">🌟 ${escape(v.firstName||v.name||'Aventurier')}</button>`).join('')}</div><button class="secondary castle-button" id="add-adventurer" type="button">＋ Ajouter un enfant</button></div>`:''}</div></div>`;
const make=$('#make-profile');if(make)make.onclick=()=>createProfile();
const inp=$('#new-first');if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter')createProfile()});
const resume=$('#resume-adventure');if(resume)resume.onclick=()=>switchProfile(selectedId);
const chooser=$('#choose-adventurer');const change=$('#switch-adventurer');if(change)change.onclick=()=>{chooser.hidden=!chooser.hidden;change.setAttribute('aria-expanded',String(!chooser.hidden))};
root.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>switchProfile(b.dataset.profile));
const add=$('#add-adventurer');if(add)add.onclick=()=>{root.innerHTML='';onboardingNewChild()};
const existingButton=$('#existing-adventurer');if(existingButton)existingButton.onclick=()=>{$('#existing-help').hidden=false};
const deviceInstall=$('#device-install-action');if(deviceInstall)deviceInstall.onclick=installGame;}
function onboardingNewChild(){root.innerHTML=`<div class="castle-welcome welcome-v77"><div class="castle-menu"><div class="eyebrow">✦ NOUVEL AVENTURIER ✦</div><h2>Bienvenue dans le royaume !</h2><p class="castle-description">Comment t'appelles-tu ?</p><label class="castle-label" for="new-first">Ton prénom</label><input id="new-first" maxlength="28" autocomplete="given-name" placeholder="Écris ton prénom…"><p id="profile-error" class="notice" aria-live="polite"></p><button class="cta castle-button" id="make-profile" type="button">Commencer mon aventure</button><button class="secondary castle-button" id="back-castle" type="button">Retour à l’accueil</button></div></div>`;$('#make-profile').onclick=()=>createProfile();$('#new-first').addEventListener('keydown',e=>{if(e.key==='Enter')createProfile()});$('#back-castle').onclick=onboarding}
const guide=[
 ['🏰','Bienvenue au Royaume des Mots !','Ici, tu vas apprendre le français en t’amusant. Prêt à vivre une aventure magique ?'],
 ['🦄','Choisis ton héros','Choisis ton compagnon préféré. Il t’accompagnera dans tous tes défis !'],
 ['🗺️','Explore les cinq mondes','Tu peux choisir librement ton monde et revenir à la Carte des mondes sans perdre ta progression. Chaque monde propose dix défis.'],
 ['💡','Apprends à ton rythme','Lis les questions et choisis une réponse. Si tu te trompes, une voix t’explique pourquoi pour t’aider à progresser.'],
 ['🏅','Gagne des récompenses','En réussissant les défis, tu gagnes des pièces et tu peux découvrir tes récompenses !'],
 ['📝','Teste tes connaissances','Quand tu te sens prêt, lance l’Évaluation sur 20. Elle comporte vingt-cinq questions, sans chronomètre imposé.'],
 ['🖍️','Découvre le Mode Challenge !','Prêt à devenir un champion des mots ? Lis de petites histoires et utilise tes surligneurs magiques pour retrouver les mots demandés ! Relève des défis de plus en plus difficiles, gagne des récompenses et deviens un véritable Maître des mots !'],
 ['👨‍👩‍👧','Un espace pour les parents','Dans « Parents », tes parents peuvent suivre tes progrès dans chaque monde, tes pièces, tes dernières aventures et tes notes aux évaluations. Les résultats restent sur cet appareil.']
];let guideStep=0,guideReturn=null;
function openGuide(){guideReturn=S.screen==='tutorial'?(guideReturn||'map'):S.screen;guideStep=0;go('tutorial')}
function tutorial(){const [ico,title,desc]=guide[guideStep];const isReplay=!!guideReturn;root.innerHTML=`<div class="panel guide-panel"><div class="guide-icon" aria-hidden="true">${ico}</div><div class="eyebrow">COMMENT JOUER ? · ${guideStep+1} / ${guide.length}</div><h2>${title}</h2><p class="sub">${desc}</p><div class="guide-dots" aria-label="Étape ${guideStep+1} sur ${guide.length}">${guide.map((_,i)=>`<span class="${i===guideStep?'selected':''}">●</span>`).join('')}</div><button class="cta" id="guide-next">${guideStep===guide.length-1?(isReplay?'Terminer la présentation ✓':'J’ai compris, c’est parti ! 🚀'):'Suivant →'}</button>${guideStep>0?'<button class="secondary" id="guide-prev">← Précédent</button>':''}<button class="secondary" id="guide-skip">${isReplay?'Retour au jeu':'Passer la présentation'}</button></div>`;
const end=()=>{if(isReplay){const destination=guideReturn;guideReturn=null;go(destination)}else{S.tutorialDone=true;save();go('heroes')}};
$('#guide-next').onclick=()=>{if(++guideStep>=guide.length)end();else tutorial()};$('#guide-skip').onclick=end;if($('#guide-prev'))$('#guide-prev').onclick=()=>{guideStep--;tutorial()}}
function profileSelector(){root.innerHTML=`<div class="panel"><div class="eyebrow">✦ LES AVENTURIERS ✦</div><h2>Qui joue aujourd'hui ?</h2><div class="profile-grid">${Object.entries(profiles).map(([id,v])=>`<button class="profile-choice" data-profile="${escape(id)}">🌟 ${escape(v.firstName||v.name||'Aventurier')}</button>`).join('')}</div><button class="cta" id="new-player">＋ Ajouter un enfant</button></div>`;root.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>switchProfile(b.dataset.profile));$('#new-player').onclick=()=>go('onboarding')}const pic=i=>`./hero-${i+1}.webp`;const $=sel=>document.querySelector(sel);const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let time=0,stars=Array.from({length:55},(_,i)=>({x:(i*73.37)%100/100,y:(i*47.19)%100/100,r:1+(i%4)/2}));let particles=[];let worldTick=0;let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let lastPaint=0;function paint(t){if(t-lastPaint<32){requestAnimationFrame(paint);return}lastPaint=t;if(document.hidden){requestAnimationFrame(paint);return}let w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}time=t*.001;const p=palettes[(S.screen==='quiz'||S.screen==='finish')?S.world:0],grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,p[0]);grad.addColorStop(.65,p[1]);grad.addColorStop(1,p[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);for(let i=0;i<stars.length;i++){let s=stars[i],x=s.x*w,y=s.y*h*.66;ctx.globalAlpha=.35+.5*Math.sin(time*(reduced?0:1)+i)**2;ctx.fillStyle='#fff4ce';ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;const moonX=w*.78,moonY=h*.2;let g=ctx.createRadialGradient(moonX,moonY,2,moonX,moonY,80);g.addColorStop(0,'#ffe9acaa');g.addColorStop(.6,'#ffe9ac24');g.addColorStop(1,'#ffe9ac00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(moonX,moonY,80,0,7);ctx.fill();ctx.fillStyle='#ffeac3c4';ctx.beginPath();ctx.arc(moonX,moonY,32,0,7);ctx.fill();for(let layer=0;layer<3;layer++){ctx.beginPath();let y=h*(.67+layer*.11);ctx.moveTo(0,h);ctx.lineTo(0,y);for(let x=0;x<=w+15;x+=15)ctx.lineTo(x,y+Math.sin(x*.012+layer*2+(reduced?0:time*.12))*(22+layer*8));ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle=['#1b355f8c','#102b47c9','#081b30'][layer];ctx.fill()}if(S.screen==='home'||S.screen==='map'){let cx=w*.5,base=h*.70;ctx.fillStyle='#101c42';ctx.fillRect(cx-72,base-90,144,110);for(let dx of [-65,-10,45]){ctx.fillRect(cx+dx,base-155,25,95);ctx.beginPath();ctx.moveTo(cx+dx-9,base-155);ctx.lineTo(cx+dx+12,base-180);ctx.lineTo(cx+dx+34,base-155);ctx.fill()}ctx.fillStyle='#ffd78e';for(let dx of [-43,10,50])ctx.fillRect(cx+dx,base-65,10,18);ctx.fillStyle='#392654';ctx.beginPath();ctx.arc(cx,base-12,20,Math.PI,0);ctx.fillRect(cx-20,base-12,40,28)}if(S.screen==='quiz'){for(let i=0;i<11;i++){let x=i*w/10+Math.sin(time*.4+i)*5,y=h*.65+Math.cos(i*2)*25;ctx.fillStyle='#0a292a';ctx.fillRect(x-5,y,10,h-y);ctx.beginPath();ctx.moveTo(x-40,y+15);ctx.lineTo(x,y-110-(i%3)*22);ctx.lineTo(x+40,y+15);ctx.fillStyle='#164f43b8';ctx.fill()}}// V71: each learning world has a distinct animated landmark.
if(S.screen==='quiz'||S.screen==='finish'){
 ctx.save();const zone=S.world,baseY=h*.67;
 if(zone===0){ // enchanted punctuation forest
  for(let j=0;j<7;j++){let x=(j+.35)*w/7,y=baseY+((j%2)*25);ctx.fillStyle='#0b3538';ctx.fillRect(x-6,y-115,12,170);ctx.beginPath();ctx.moveTo(x,y-210);ctx.lineTo(x-55,y-65);ctx.lineTo(x+55,y-65);ctx.fillStyle=j%2?'#196d63':'#125a56';ctx.fill();ctx.fillStyle='#f6d69b';ctx.font='bold 30px serif';ctx.globalAlpha=.35;ctx.fillText(['?','!','…'][j%3],x-10,y-102);ctx.globalAlpha=1}
 }else if(zone===1){ // theater of dialogues
  ctx.fillStyle='#271331';ctx.fillRect(0,h*.38,w,h*.48);for(let side of [0,1]){ctx.save();if(side){ctx.translate(w,0);ctx.scale(-1,1)}ctx.fillStyle='#9e3e69';ctx.beginPath();ctx.moveTo(0,h*.25);ctx.bezierCurveTo(w*.3,h*.4,w*.04,h*.6,w*.26,h*.7);ctx.lineTo(0,h*.8);ctx.fill();ctx.restore()}ctx.strokeStyle='#ffd78b';ctx.lineWidth=6;ctx.strokeRect(w*.22,h*.32,w*.56,h*.38);ctx.fillStyle='#ffdba3';ctx.font='bold 36px serif';ctx.fillText('«  »',w*.45,h*.48);
 }else if(zone===2){ // time tower
  const x=w*.52,y=h*.5;ctx.fillStyle='#23335e';ctx.fillRect(x-55,y-95,110,260);ctx.fillStyle='#b1c4e8';ctx.beginPath();ctx.arc(x,y-55,47,0,7);ctx.fill();ctx.strokeStyle='#283c6c';ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-55);ctx.lineTo(x+24,y-80);ctx.moveTo(x,y-55);ctx.lineTo(x-12,y-25);ctx.stroke();ctx.fillStyle='#b1c4e8';ctx.beginPath();ctx.moveTo(x-70,y-95);ctx.lineTo(x,y-175);ctx.lineTo(x+70,y-95);ctx.fill();
 }else if(zone===3){ // detective library
  for(let k=0;k<6;k++){let x=k*w/6;ctx.fillStyle='#0d333e';ctx.fillRect(x,h*.38,w/7,h*.45);for(let r=0;r<4;r++){ctx.fillStyle=['#cb9875','#68a3a1','#a8a1cf'][r%3];for(let b=0;b<5;b++)ctx.fillRect(x+8+b*13,h*.42+r*55,9,42)}}ctx.strokeStyle='#fce5a5';ctx.lineWidth=9;ctx.beginPath();ctx.arc(w*.78,h*.4,45,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(w*.81,h*.44);ctx.lineTo(w*.9,h*.54);ctx.stroke();
 }else{ // star observatory
  ctx.fillStyle='#251c46';ctx.beginPath();ctx.arc(w*.5,h*.78,w*.32,Math.PI,0);ctx.fill();ctx.fillStyle='#cf9bd6';ctx.beginPath();ctx.arc(w*.5,h*.43,75,Math.PI,0);ctx.fill();ctx.strokeStyle='#f8dca2';ctx.lineWidth=5;ctx.stroke();for(let k=0;k<9;k++){let x=w*(k+.5)/9,y=h*(.3+(k%3)*.11);ctx.fillStyle='#fff3b5';ctx.font='24px serif';ctx.fillText('✦',x,y)}}ctx.restore();
}
for(let i=particles.length-1;i>=0;i--){let q=particles[i];q.x+=q.vx;q.y+=q.vy;q.vy+=.025;q.life-=.015;ctx.globalAlpha=Math.max(0,q.life);ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,3+q.life*3,0,7);ctx.fill();if(q.life<=0)particles.splice(i,1)}ctx.globalAlpha=1;
// Layered scenery: perspective, silhouetted pines and floating lanterns.
if(S.screen==='home'||S.screen==='map'){
  const cx=w*.5, by=h*.71;
  ctx.save();ctx.globalAlpha=.8;
  let path=ctx.createLinearGradient(cx,by,cx,h);path.addColorStop(0,'#f3dba8a8');path.addColorStop(1,'#a56e6e18');
  ctx.beginPath();ctx.moveTo(cx-15,by);ctx.bezierCurveTo(cx-80,h*.85,cx+100,h*.91,cx-85,h);ctx.lineTo(cx+95,h);ctx.bezierCurveTo(cx+145,h*.9,cx+15,h*.83,cx+15,by);ctx.closePath();ctx.fillStyle=path;ctx.fill();
  for(let side of [-1,1])for(let k=0;k<6;k++){
    let x=side<0?k*32:w-k*32, yy=h*(.68+(k%3)*.09), height=70+k*14;
    ctx.fillStyle=k%2?'#092b36':'#0c3741';ctx.fillRect(x-5,yy,10,height);
    ctx.beginPath();ctx.moveTo(x,yy-height*.95);ctx.lineTo(x-28-k*2,yy+20);ctx.lineTo(x+28+k*2,yy+20);ctx.closePath();ctx.fill();
  }ctx.restore();
}
if(S.screen==='quiz'){
  ctx.save();ctx.globalAlpha=.55;
  for(let side of [-1,1])for(let k=0;k<5;k++){
    const x=side<0?k*40:w-k*40, yy=h*(.48+k*.11), size=60+k*9;
    ctx.fillStyle=k%2?'#0b3437':'#125248';ctx.beginPath();ctx.moveTo(x,yy-size);ctx.lineTo(x-size*.4,yy+size*.2);ctx.lineTo(x+size*.4,yy+size*.2);ctx.fill();
  }ctx.restore();
}
// V69: layered fantasy landscape with distant citadel, arched bridge, cloud wisps and lanterns.
if(S.screen==='home'||S.screen==='map'){
ctx.save();let cx=w*.5,by=h*.69;
for(let i=0;i<5;i++){let xx=(w*(i*.28-.08)+Math.sin(time*.06+i)*16),yy=h*(.22+i*.075);ctx.strokeStyle='rgba(255,239,209,.075)';ctx.lineWidth=12+i*4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(xx-90,yy);ctx.bezierCurveTo(xx-10,yy-26,xx+35,yy+25,xx+115,yy-10);ctx.stroke()}
ctx.translate(cx,by);let scale=Math.min(w/400,1.2);ctx.scale(scale,scale);
ctx.fillStyle='#09162e';ctx.strokeStyle='#caa675';ctx.lineWidth=2;
for(let [x,hh] of [[-85,115],[-42,178],[0,142],[40,190],[85,115]]){ctx.fillRect(x-19,-hh,38,hh+10);ctx.strokeRect(x-19,-hh,38,hh+10);ctx.beginPath();ctx.moveTo(x-25,-hh);ctx.lineTo(x,-hh-37);ctx.lineTo(x+25,-hh);ctx.closePath();ctx.fillStyle='#1a2143';ctx.fill();ctx.stroke();ctx.fillStyle='#09162e';for(let wy=-hh+20;wy<0;wy+=42){ctx.fillStyle='#ffd797';ctx.fillRect(x-4,wy,8,16);ctx.fillStyle='#09162e'}}
ctx.fillStyle='#0d1935';ctx.fillRect(-105,-80,210,88);ctx.strokeRect(-105,-80,210,88);ctx.fillStyle='#e9bb73';ctx.beginPath();ctx.arc(0,-12,18,Math.PI,0);ctx.lineTo(18,8);ctx.lineTo(-18,8);ctx.fill();ctx.restore();
for(let i=0;i<9;i++){let xx=(i*149.7+time*(reduced?0:3+i%3))%(w+90)-45,yy=h*(.33+(i*19%38)/100);ctx.save();ctx.translate(xx,yy);ctx.rotate(Math.sin(time+i)*.2);ctx.fillStyle='#ffe6a6';ctx.shadowColor='#ffd787';ctx.shadowBlur=18;ctx.beginPath();ctx.ellipse(0,0,3,6,0,0,Math.PI*2);ctx.fill();ctx.restore()}
}
// Fireflies and depth cues stay behind interactive content.
for(let k=0;k<21;k++){let px=((k*79.1+time*(reduced?0:(4+k%4)))%(w+80))-40,py=h*(.34+(k*31%57)/100);let r=1.5+(k%3);ctx.globalAlpha=.22+.36*Math.sin(time*1.3+k)**2;ctx.fillStyle=k%3===0?'#9affda':'#ffe59e';ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill()}ctx.globalAlpha=1;requestAnimationFrame(paint)}try{requestAnimationFrame(paint)}catch(e){console.warn('Décor animé indisponible',e)}function burst(){for(let i=0;i<38;i++){let a=Math.PI*2*i/38;particles.push({x:innerWidth/2,y:innerHeight*.48,vx:Math.cos(a)*(2+Math.random()*3),vy:Math.sin(a)*(2+Math.random()*3)-1,life:1,color:i%2?'#ffdc74':'#8df7e2'})}}function screenTitle(){const titles={onboarding:'Le Royaume des Mots',tutorial:'Découvre ton aventure',profiles:'Choisir un enfant',home:'Le Royaume des Mots',map:'Carte des mondes',heroes:'Choisis ton héros',quiz:W[S.world]?.name||'Mon aventure',finish:'Fin du monde',exam:'Évaluation', 'exam-result':'Résultats de l’évaluation',rewards:'Mes récompenses',parent:'Espace parents'};return titles[S.screen]||'Le Royaume des Mots'}function updateHeader(){const brand=document.querySelector('header .brand');if(!brand)return;const title=screenTitle();const worldIcons=['🌳','🦁','⏳','🔎','🪄'];
const icon=(S.screen==='quiz'||S.screen==='finish')?(worldIcons[S.world]||'✨'):'';
brand.replaceChildren();
if(icon){const pict=document.createElement('span');pict.className='brand-icon';pict.textContent=icon;pict.setAttribute('aria-hidden','true');brand.appendChild(pict);}
const label=document.createElement('span');label.className='brand-label';label.textContent=title;brand.appendChild(label);
brand.setAttribute('aria-label','Écran : '+title);document.title=title+' · La grande aventure du français CE2'}function update(){updateHeader();root.className='scene';document.body.classList.toggle('is-welcome',S.screen==='onboarding');document.getElementById('coins').textContent='✦ '+S.coins;document.querySelectorAll('[data-go]').forEach(b=>b.style.opacity=b.dataset.go===S.screen?'1':'.65');if(typeof window.ce2RefreshChallengeNav==='function')window.ce2RefreshChallengeNav();if(S.screen==='onboarding')onboarding();else if(S.screen==='tutorial')tutorial();else if(S.screen==='profiles')profileSelector();else if(S.screen==='home')home();else if(S.screen==='map')map();else if(S.screen==='heroes')heroes();else if(S.screen==='quiz')quiz();else if(S.screen==='finish')finish();else if(S.screen==='exam')exam();else if(S.screen==='exam-result')examResult();else if(S.screen==='rewards')rewards();else parent()}function home(){root.innerHTML=`<div class="eyebrow">✦ LE GRAND VOYAGE DES MOTS ✦</div><button class="player-chip" id="player-switch">👤 ${escape(S.firstName||S.name||'Aventurier')} · Changer d’enfant</button><div class="hero-stage"><span class="hero-aura"></span><img class="hero" src="${pic(S.hero)}" alt="${escape(names[S.hero])}"></div><h1>Le Royaume<br>des Mots</h1><p class="sub">Une aventure magique où chaque bonne réponse éclaire ton chemin.</p><button class="cta" id="play">✦ Partir à l'aventure ✦</button><aside class="device-install-panel" id="device-install-panel" aria-label="Installer ou jouer sur ordinateur, tablette et téléphone"><div class="device-install-heading">📱 💻 ✨ Joue où tu veux !</div><p>Retrouve <strong>La grande aventure du français CE2</strong> sur <strong>téléphone, tablette ou ordinateur</strong>.</p><button type="button" class="device-install-action" id="device-install-action">⬇ Installer gratuitement le jeu</button><p class="device-install-small">Ou joue directement dans ton navigateur, sans installation.</p><p class="device-install-small">🔒 Ta progression reste enregistrée sur cet appareil, tant que ses données sont conservées. Elle n'est pas synchronisée entre appareils.</p><div id="device-install-guidance" class="device-install-guidance" hidden role="status"></div></aside>${S.step>0&&S.step<sessionLength()?'<button class="secondary" id="resume">↪ Reprendre mon aventure</button>':''}<div class="home-sparks" aria-hidden="true"><span>✧</span><span>✦</span><span>✧</span></div><p class="sub">Ton compagnon : <b>${escape(names[S.hero])}</b>${S.name?' · '+escape(S.name):''}</p>`;$('#player-switch').onclick=()=>go('profiles');$('#play').onclick=()=>{S.screen='map';save();update()};const installAction=$('#device-install-action');if(installAction)installAction.onclick=installGame;if($('#resume'))$('#resume').onclick=()=>go('quiz')}function challengeUnlocked(){return !!S.challengeUnlocked||(S.examHistory||[]).some(h=>Number(h.score)>=15)}
window.ce2ChallengeUnlocked=()=>challengeUnlocked();window.ce2OpenChallengeWithGate=()=>openChallengeFromMap();
function challengeBest(){const scores=(S.examHistory||[]).map(h=>Number(h.score)).filter(Number.isFinite);return scores.length?Math.max(...scores):null}
function openChallengeFromMap(){if(!challengeUnlocked()){const best=challengeBest();const message=best===null?'Le Mode Challenge se débloque dès 15/20 à l’évaluation générale. Tu peux commencer ton évaluation maintenant !':`Ton meilleur résultat est ${best}/20. Obtiens au moins 15/20 pour débloquer le Mode Challenge !`;showChallengeLockedDialog(message,()=>{if(S.exam)go('exam');else startExam()});return}S.challengeUnlocked=true;save();if(typeof window.openCE2Challenge==='function')window.openCE2Challenge();else alert('Le Mode Challenge n’est pas disponible. Recharge la page.')}
function map(){const last=Number.isInteger(S.mapWorld)?S.mapWorld:S.world;root.innerHTML=`<div class="eyebrow">✦ CARTE DES CINQ ROYAUMES ✦</div><h2>Où partons-nous ?</h2><p class="sub">Choisis un royaume : ton héros empruntera le chemin pour le rejoindre.</p><div class="journey-map" id="journey-map"><svg viewBox="0 0 340 286" class="journey-path" aria-hidden="true"><path d="M62 48 C142 48 215 52 270 86 S222 171 170 158 S47 154 62 219 S216 264 278 240" fill="none" stroke="#a77a4e" stroke-width="22" stroke-linecap="round"/><path d="M62 48 C142 48 215 52 270 86 S222 171 170 158 S47 154 62 219 S216 264 278 240" fill="none" stroke="#ffe6b0" stroke-width="13" stroke-linecap="round" stroke-dasharray="4 8"/></svg>${W.map((w,i)=>`<button class="journey-stop stop-${i} ${i===last?'current':''}" data-world="${i}" aria-label="Aller à ${escape(w.name)}"><span class="stop-symbol">${symbols[i]}</span><span class="stop-title">${escape(w.name)}</span><small>${S.completed[i]!==undefined?'★ '+S.completed[i]+'/10':S.worldRuns?.[i]?.step?'↪ Reprendre':'Découvrir'}</small></button>`).join('')}<div class="traveler" id="traveler" style="--tx:${[18,79,50,18,82][last]}%;--ty:${[17,30,55,76,83][last]}%"><img src="${pic(S.hero)}" alt="${escape(names[S.hero])}"><span>${escape(S.firstName||S.name||'Héros')}</span></div></div><p class="map-help">👆 Touche un royaume pour voir ton héros s'y déplacer.</p><div class="map-help-challenge"><button class="secondary howto-map" id="help-map">❔ Comment jouer ?</button><button class="secondary challenge-map-button ${challengeUnlocked()?'challenge-open':'challenge-locked'}" id="challenge-map" aria-label="Mode Challenge ${challengeUnlocked()?'débloqué':'verrouillé, obtenir 15 sur 20'}">${challengeUnlocked()?'🏆':'🔒'} Mode Challenge<small>${challengeUnlocked()?'✨ Débloqué':'⭐ 15/20 pour débloquer'}</small></button></div><div class="map-actions"><button class="secondary" id="change">♜ Choisir un autre héros</button><button class="secondary" id="eval-map">📝 Évaluation sur 20</button><button class="secondary" id="switch-map">👤 Changer d’enfant</button><button class="secondary" id="rewards">🏅 Mes récompenses</button></div>`;root.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>portal(+b.dataset.world));$('#change').onclick=()=>go('heroes');$('#eval-map').onclick=()=>startExam();$('#switch-map').onclick=()=>go('profiles');$('#rewards').onclick=()=>go('rewards');$('#help-map').onclick=openGuide;$('#challenge-map').onclick=openChallengeFromMap}
function heroes(){root.innerHTML=`<div class="eyebrow">✦ TES COMPAGNONS ✦</div><h2>Choisis ton héros</h2><div class="heroes">${names.map((n,i)=>`<button class="hero-card ${i===S.hero?'active':''}" data-hero="${i}"><span class="portrait-frame"><img src="${pic(i)}" alt=""></span><span>${escape(n)}</span></button>`).join('')}</div><button class="cta" id="hero-ok">Continuer ✦</button>`;root.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>{S.hero=+b.dataset.hero;save();update()});$('#hero-ok').onclick=()=>go('map')}let travelBusy=false;function saveWorldRun(){S.worldRuns=S.worldRuns||{};if(S.runId&&S.step<sessionLength())S.worldRuns[S.world]={runQuestions:[...(S.runQuestions||[])],step:S.step,correct:S.correct,answered:S.answered,attempts:{...S.attempts},runId:S.runId,practice:S.practice}}
function portal(i){if(travelBusy)return;stopSpeech();saveWorldRun();const old=Number.isInteger(S.mapWorld)?S.mapWorld:S.world;S.mapWorld=old;save();const travelProfile=activeId;const finishTravel=()=>{document.querySelector('.world-portal-overlay')?.remove();if(S.screen!=='map'||activeId!==travelProfile){travelBusy=false;return}const run=(i===1&&S.theaterBankVersion!=='v50')?null:S.worldRuns?.[i];S.world=i;if(i===1)S.theaterBankVersion='v50';if(run&&Array.isArray(run.runQuestions)&&run.runQuestions.length===RUN_SIZE&&run.step<RUN_SIZE){S.runQuestions=[...run.runQuestions];S.step=run.step;S.correct=run.correct;S.answered=run.answered??null;S.attempts={...run.attempts};S.runId=run.runId;S.practice=run.practice||null}else{newQuestionRun(i);S.step=0;S.correct=0;S.answered=null;S.attempts={};S.runId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);S.practice=null}S.mapWorld=i;travelBusy=false;S.screen='quiz';save();update()};const traveler=$('#traveler');if(!traveler||reduced){finishTravel();return}travelBusy=true;root.querySelectorAll('[data-world]').forEach(b=>b.disabled=true);const positions=[[18,17],[79,30],[50,55],[18,76],[82,83]];const from=positions[old],to=positions[i];let dx=to[0]-from[0],dy=to[1]-from[1];traveler.classList.add('walking');traveler.style.setProperty('--dx',dx+'%');traveler.style.setProperty('--dy',dy+'%');traveler.style.transform=`translate(calc(-50% + ${dx}cqw), calc(-50% + ${dy}cqh))`;let caption=document.createElement('p');caption.className='travel-caption';caption.textContent=old===i?'Ton héros reprend son aventure !':'En route vers '+W[i].name+' !';$('#journey-map').after(caption);setTimeout(()=>{const overlay=document.createElement('div');overlay.className='world-portal-overlay';overlay.innerHTML=`<div class="portal-door"><img src="${pic(S.hero)}" alt=""></div><p>Bienvenue dans ${escape(W[i].name)} !</p>`;document.body.append(overlay);setTimeout(finishTravel,1100)},old===i?600:1600)}
function quiz(){let w=W[S.world],q=S.practice?w.questions[S.practice.index]:sessionQuestion(S.step);if(!q){S.screen='finish';save();update();return}root.innerHTML=`<div class="topline"><button class="return-map" id="return-map" type="button">🗺️ Carte des mondes</button><span class="world-name-quiz">${symbols[S.world]} ${escape(w.name)}</span><span class="quiz-counter">${S.step+1} / ${sessionLength()} · ${S.correct} ★</span></div><div class="panel quest-panel"><div class="progress" role="progressbar" aria-label="Progression des défis" aria-valuemin="0" aria-valuemax="${sessionLength()}" aria-valuenow="${S.step}"><i style="width:${S.step/sessionLength()*100}%"></i></div><div class="quest-companion"><span class="companion-glow"></span><img class="question-hero" src="${pic(S.hero)}" alt="${escape(names[S.hero])}"><span class="companion-label">${escape(names[S.hero])} t'accompagne</span></div><div class="quest-tag">✧ ${S.practice?'ENTRAÎNEMENT BONUS':'MISSION '+(S.step+1)+' / '+sessionLength()} ✧</div><div class="question">${escape(q.q)}</div><div class="quest-stars" aria-label="${S.correct} bonnes réponses">${'★'.repeat(Math.min(S.correct,10))}${'☆'.repeat(Math.max(0,10-S.correct))}</div><div class="answers">${q.options.map((a,i)=>`<button class="answer" data-answer="${i}"><span class="answer-letter">${'ABCD'[i]||i+1}</span><span>${escape(a)}</span></button>`).join('')}</div><button class="hint-btn" id="hint" type="button">💡 Un petit indice</button><div class="feedback" id="feedback" aria-live="polite">✦ Choisis ta réponse pour avancer…</div><div id="nextbox"></div></div>`;$('#return-map').onclick=()=>go('map');root.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(+b.dataset.answer));if(S.answered!==null){restoreAnswer()}$('#hint').onclick=()=>{$('#feedback').textContent='Prends le temps de lire la question, puis élimine les réponses qui ne correspondent pas.';$('#hint').disabled=true}}function currentQuestion(){return S.practice?W[S.world].questions[S.practice.index]:sessionQuestion(S.step)}
function advanceQuest(){stopSpeech();if(S.step>=sessionLength()-1){S.step=sessionLength();S.answered=null;S.practice=null;S.screen='finish';save();update();return}const runId=S.runId,profileId=activeId,world=S.world;walkToNext(()=>{if(S.screen!=='quiz'||S.runId!==runId||activeId!==profileId||S.world!==world)return;S.step++;S.answered=null;S.practice=null;save();update()})}
function walkToNext(done){if(reduced){done();return}const el=document.createElement('div');el.className='walking-transition';el.innerHTML=`<div class="walking-scene"><div class="walking-track"></div><img class="walking-hero" src="${pic(S.hero)}" alt="${escape(names[S.hero])} avance vers le prochain défi"><div class="walking-gate">✦</div></div><p>En route vers le prochain défi !</p>`;document.body.append(el);setTimeout(()=>{el.remove();done()},1700)}
function chooseAnother(){stopSpeech();const choices=W[S.world].questions.map((q,i)=>i).filter(i=>!S.runQuestions.includes(i)&&i!==(S.practice?.index??-1));if(!choices.length){retrySame();return}const last=S.practice?.index??S.step;const idx=choices[(S.step+S.assisted+1)%choices.length];S.practice={index:idx,original:S.step,previous:last};S.answered=null;save();update()}
function retrySame(){stopSpeech();S.practice=S.practice||{index:sessionQuestionIndex(S.step),original:S.step};S.answered=null;save();update()}
function showFeedback(){const q=currentQuestion(),n=S.answered,ok=n===q.answer,assisted=!!S.practice;root.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;if(+b.dataset.answer===q.answer)b.classList.add('correct');else if(+b.dataset.answer===n)b.classList.add('wrong')});const fb=$('#feedback'),next=$('#nextbox');if(ok){fb.textContent=assisted?'🌟 Bravo ! Tu as réussi après avoir réessayé.':'✨ Bravo ! Bien joué !';next.innerHTML=`<button class="cta" id="next">${S.step===sessionLength()-1?'Découvrir le trésor':'Défi suivant →'}</button>`;$('#next').onclick=advanceQuest;root.querySelector('.question-hero')?.classList.add('hero-cheer')}else{fb.textContent='💛 Pas encore ! '+q.explanation;next.innerHTML='<button class="secondary" id="replay-explanation">🔊 Réécouter l’explication</button><button class="cta" id="retry-same">↻ Réessayer cette question</button><button class="secondary" id="retry-other">✨ Essayer une autre question</button>';$('#replay-explanation').onclick=()=>speakError('Regardons ensemble. '+q.explanation);$('#retry-same').onclick=retrySame;$('#retry-other').onclick=chooseAnother;root.querySelector('.question-hero')?.classList.add('hero-encourage')}}
function answer(n){if(S.answered!==null)return;const q=currentQuestion(),ok=n===q.answer,assisted=!!S.practice;S.answered=n;S.attempts=S.attempts||{};const key=S.world+':'+S.step;const prev=S.attempts[key]||{};S.attempts[key]={choice:n,correct:ok,firstTry:prev.firstTry===undefined?ok:prev.firstTry,tries:(prev.tries||0)+1,question:q.q,explanation:q.explanation};if(ok){if(!assisted){S.correct++;S.coins+=3}else{S.assisted=(S.assisted||0)+1;S.coins+=1}burst();chime(true);praiseSometimes()}else{chime(false);speakError('Regardons ensemble. '+q.explanation)}showFeedback();save();$('#coins').textContent='✦ '+S.coins}
function finish(){
 ensureState();
 const runKey=S.world+':'+(S.runId||'legacy');
 if(!S.awarded[runKey]){
  const total=sessionLength(),perfect=total===10&&S.correct===10;
  S.completed[S.world]=Math.max(S.completed[S.world]||0,S.correct);
  S.history.unshift({world:S.world,score:S.correct,total,date:new Date().toISOString(),answers:{...(S.attempts||{})}});
  S.history=S.history.slice(0,60);
  S.rewardStats.runs++;
  if(perfect)S.rewardStats.perfect++;
  // Pour les futures sauvegardes, conserver aussi le statut sans faute par partie.
  S.awarded[runKey]={perfect};
 }
 // Une ancienne sauvegarde intermédiaire ne doit jamais relancer une partie terminée.
 if(S.worldRuns&&S.worldRuns[S.world])delete S.worldRuns[S.world];
 save();
 root.innerHTML=`<div class="finish"><svg viewBox="0 0 180 145" width="180" height="145" role="img" aria-label="Coffre au trésor doré"><defs><linearGradient id="treasureGold" x2="1" y2="1"><stop stop-color="#fff1a3"/><stop offset="1" stop-color="#cf7c26"/></linearGradient></defs><path d="M26 67V46Q26 10 90 10Q154 10 154 46V67Z" fill="url(#treasureGold)" stroke="#693c27" stroke-width="7"/><path d="M19 66H161L150 130H30Z" fill="#8e4d31" stroke="#f6cb68" stroke-width="8"/><path d="M77 66H103V125H77Z" fill="#ffd979"/><rect x="82" y="77" width="16" height="20" rx="5" fill="#7c4b2d"/><circle cx="45" cy="52" r="5" fill="#fff5a6"/><circle cx="135" cy="52" r="5" fill="#fff5a6"/></svg></div><div class="eyebrow">✦ LE COFFRE DU ROYAUME ✦</div><h1>Bravo, aventurier !</h1><img class="hero" src="${pic(S.hero)}" alt=""><p class="sub">${S.correct} bonnes réponses sur 10 · ${S.correct*3} pièces gagnées</p><button class="cta" id="again">Explorer un autre monde</button><button class="secondary" id="see-rewards">🏅 Voir mes récompenses</button>`;burst();$('#again').onclick=()=>go('map');$('#see-rewards').onclick=()=>go('rewards')}function restoreAnswer(){showFeedback()}window.ce2RefreshRewards=()=>{if(S.screen==='rewards')rewards()};window.ce2GoToWorldMap=()=>go('map');
function rewards(){
 ensureState();const earned=S.history||[],finished=Object.keys(S.completed||{}).length,perfect=earned.some(x=>x.total===10&&x.score===10),runs=S.rewardStats.runs,perfectRuns=S.rewardStats.perfect,coins=S.coins||0;
 let challenge={history:{},unlocked:[true,false,false]};try{const raw=JSON.parse(localStorage.getItem('ce2_challenge_v8254_'+(activeId||'guest'))||'{}');challenge={...challenge,...raw}}catch{}
 const challengeEntries=Object.entries(challenge.history||{});const bestLevel=l=>challengeEntries.some(([id,h])=>{const item=(window.CE2_CHALLENGES||[]).find(t=>String(t.id)===String(id));return item&&Number(item.level)===l&&Number(h.best)>=15});
 const examBest=(S.examHistory||[]).some(x=>Number(x.score)>=15)||!!S.challengeUnlocked;
 const medals=[
 ['🌱','Premier pas','Terminer une aventure',runs,1,'bronze'],
 ['🗺️','Explorateur','Terminer 3 mondes différents',finished,3,'bronze'],
 ['🏰','Gardien du royaume','Terminer les 5 mondes',finished,5,'or'],
 ['⭐','Sans-faute','Réussir 10 réponses sur 10',perfectRuns,1,'argent'],
 ['💎','Collectionneur','Gagner 100 pièces',coins,100,'bronze'],
 ['👑','Légende des mots','Terminer 10 aventures',runs,10,'or'],
 ...[[5,'Petit aventurier','bronze','🥾'],[15,'Voyageur des mondes','bronze','🧭'],[25,'Grand explorateur','argent','🗺️'],[40,'Héros des chemins','argent','⚔️'],[60,'Champion des mondes','or','🏆'],[100,'Couronne des mots','legendaire','👑']].map(([n,t,r,e])=>[e,t,`Terminer ${n} aventures`,runs,n,r]),
 ...[[3,'Étoile appliquée','bronze','🌟'],[5,'Précision magique','argent','🎯'],[10,'Œil de lynx','argent','🦉'],[15,'Virtuose des mots','or','✨'],[25,'Champion du sans-faute','or','🏅'],[50,'Diamant du sans-faute','legendaire','💠']].map(([n,t,r,e])=>[e,t,`Réussir ${n} aventures sans faute`,perfectRuns,n,r]),
 ...[[250,'Bourse de pièces','bronze','🪙'],[500,'Petit coffre','bronze','🎁'],[1000,'Coffre argenté','argent','🧰'],[2000,'Trésor doré','or','💰'],[3500,'Fortune magique','or','🔮'],[5000,'Trésor royal','legendaire','🏆']].map(([n,t,r,e])=>[e,t,`Gagner ${n} pièces au total`,coins,n,r]),
 ['📝','Première évaluation','Terminer une évaluation générale',(S.examHistory||[]).length,1,'bronze'],
 ['🎓','Évaluation réussie','Obtenir au moins 15/20 à une évaluation',Number(examBest),1,'argent'],
 ['🥉','Défi Explorateur','Réussir un défi Explorateur avec 15/20',Number(bestLevel(0)),1,'bronze'],
 ['🥈','Défi Expert','Réussir un défi Expert avec 15/20',Number(bestLevel(1)),1,'argent'],
 ['🥇','Défi Maître','Réussir un défi Maître des mots avec 15/20',Number(bestLevel(2)),1,'or'],
 ['📖','Grand maître du français','Réussir un défi Maître des mots avec 20/20',Number(challengeEntries.some(([id,h])=>{const item=(window.CE2_CHALLENGES||[]).find(t=>String(t.id)===String(id));return item&&Number(item.level)===2&&Number(h.best)>=20})),1,'legendaire']
 ];
 const count=medals.filter(m=>m[3]>=m[4]).length;
 root.innerHTML=`<div class="eyebrow">✦ SALLE DES TRÉSORS ✦</div><h2>Mes récompenses</h2><p class="sub">Tu as débloqué <strong>${count} récompenses sur ${medals.length}</strong> !</p><div class="reward-progress" role="progressbar" aria-label="Récompenses obtenues" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="${medals.length}"><span style="width:${Math.round(count/medals.length*100)}%"></span></div><div class="reward-grid">${medals.map(m=>{const unlocked=m[3]>=m[4];return `<div class="reward-card ${unlocked?'unlocked':'locked'} reward-${m[5]}"><span class="reward-symbol reward-medallion"><img src="recompense-${String(medals.indexOf(m)+1).padStart(2,'0')}.webp" alt="" loading="lazy">${unlocked?'':'<span class="reward-lock">🔒</span>'}</span><b>${m[1]}</b><small>${m[2]}</small><span class="reward-status">${unlocked?'✦ Débloquée':`${Math.min(m[3],m[4])} / ${m[4]}`}</span><span class="reward-rarity">${{bronze:'🥉 Bronze',argent:'🥈 Argent',or:'🥇 Or',legendaire:'👑 Légendaire'}[m[5]]}</span></div>`}).join('')}</div><button class="cta" id="back-map">Continuer l'aventure ✦</button>`;
 $('#back-map').onclick=()=>go('map');}
const EXAM_COUNT=25;
const EXAM_PATTERN=['easy','easy','medium','medium','hard'];
function examQuestions(e){
 // Les évaluations déjà commencées sous une ancienne version restent cohérentes.
 // Les nouvelles évaluations utilisent les 4 choix de la banque actuelle.
 return e?.items||D.exam||[]
}
function shuffleExam(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
function buildExam(){
 const used=new Set((S.examHistory||[]).flatMap(h=>(h.items||[]).map(q=>q.id).filter(Boolean)));
 const chosen=[];
 for(let levelIndex=0;levelIndex<5;levelIndex++){
  for(let world=0;world<5;world++){
   const difficulty=EXAM_PATTERN[levelIndex];
   const candidates=D.examBank.filter(q=>q.world===world&&q.difficulty===difficulty&&(!q.topic||world!==1||q.topic===['verbes','tirets','deux-points','guillemets','dialogue'][levelIndex])&&!chosen.some(c=>c.id===q.id));
   const fresh=candidates.filter(q=>!used.has(q.id));
   const pool=fresh.length?fresh:candidates;
   if(!pool.length)throw Error('Banque de questions incomplète : '+world+'/'+difficulty);
   chosen.push(pool[Math.floor(Math.random()*pool.length)]);
  }
 }
 return chosen;
}
function startExam(){
 stopSpeech();if(!activeId){go('profiles');return}
 if(S.exam&&S.exam.step<examQuestions(S.exam).length){
  if(confirm('Reprendre ton évaluation à la question '+(S.exam.step+1)+' ?')){go('exam');return}
  if(!confirm('Recommencer l’évaluation ? La tentative en cours sera abandonnée.'))return
 }
 S.exam={step:0,answers:[],items:buildExam(),started:new Date().toISOString()};save();go('exam')
}
function exam(){
 if(!S.exam){root.innerHTML='<div class="panel"><h2>Évaluation de français</h2><p>25 questions, 5 par monde : 2 faciles, 2 intermédiaires et 1 plus difficile. Note sur 20. Sans chronomètre ni aide pendant l’épreuve.</p><button class="cta" id="exam-start">Commencer l’évaluation</button><button class="secondary" id="exam-results">Voir mes anciens résultats</button></div>';$('#exam-start').onclick=startExam;$('#exam-results').onclick=()=>go('exam-result');return}
 const e=S.exam,items=examQuestions(e);
 if(e.step>=items.length){completeExam();return}
 const q=items[e.step];
 root.innerHTML=`<div class="panel exam-panel"><div class="eyebrow">📝 ÉVALUATION · ${escape(S.firstName||S.name)}</div><div class="topline"><span>Question ${e.step+1} / ${items.length}</span><button class="return-map" id="exam-leave">← Quitter et reprendre plus tard</button></div><div class="progress"><i style="width:${e.step/items.length*100}%"></i></div><p class="sub">Lis attentivement et choisis une seule réponse. Il n’y a pas d’aide pendant l’évaluation.</p><div class="question">${escape(q.q)}</div><div class="answers">${q.options.map((o,i)=>`<button class="answer" data-exam-answer="${i}"><span class="answer-letter">${'ABCD'[i]||i+1}</span><span>${escape(o)}</span></button>`).join('')}</div></div>`;
 $('#exam-leave').onclick=()=>go('map');root.querySelectorAll('[data-exam-answer]').forEach(b=>b.onclick=()=>{if(S.exam.step!==e.step)return;S.exam.answers.push(+b.dataset.examAnswer);S.exam.step++;save();update()})
}
let celebrationTimer=null;
function clearExamCelebration(){if(celebrationTimer){clearTimeout(celebrationTimer);celebrationTimer=null}document.getElementById('exam-celebration-layer')?.remove()}
function playExamCelebration(score){
 clearExamCelebration();
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const tier=score===20?'fireworks':score>=18?'trophy':score>=15?'confetti':'encourage';
 const layer=document.createElement('div');layer.id='exam-celebration-layer';layer.className='exam-celebration '+tier;
 layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);
 if(tier==='encourage'){
   layer.innerHTML='<div class="exam-cheer-hero">🌟</div>';
 }else{
   const colors=['#ffcf52','#ff658d','#6ce6ee','#9af27a','#bba2ff','#ffffff'];
   const count=reduced?0:(tier==='fireworks'?110:tier==='trophy'?85:65);
   const bits=document.createDocumentFragment();
   for(let i=0;i<count;i++){
     const bit=document.createElement('i');bit.className='exam-confetti';
     bit.style.setProperty('--x',((i*73.17)%100)+'vw');
     bit.style.setProperty('--delay',((i*17)%35)/20+'s');
     bit.style.setProperty('--duration',(2.2+(i%9)*.18)+'s');
     bit.style.setProperty('--turn',((i%2?1:-1)*(240+i%7*80))+'deg');
     bit.style.backgroundColor=colors[i%colors.length];bits.appendChild(bit)
   }
   layer.appendChild(bits);
   if(tier==='fireworks'&&!reduced){for(let i=0;i<4;i++){
     const fire=document.createElement('div');fire.className='exam-firework';
     fire.style.left=[20,75,42,62][i]+'%';fire.style.top=[28,34,17,48][i]+'%';
     fire.style.animationDelay=(i*.5)+'s';layer.appendChild(fire)
   }}
   if(tier==='trophy'||tier==='fireworks'){
     const trophy=document.createElement('div');trophy.className='exam-cheer-hero';
     trophy.textContent=tier==='fireworks'?'👑':'🏆';layer.appendChild(trophy)
   }
 }
 celebrationTimer=setTimeout(clearExamCelebration,reduced?1300:5100)
}
function completeExam(){
 if(!S.exam)return;
 const e=S.exam,items=examQuestions(e),right=items.reduce((n,q,i)=>n+(e.answers[i]===q.answer?1:0),0),score=Math.round(right/items.length*200)/10;
 const result={id:'e'+Date.now(),date:new Date().toISOString(),score,right,total:items.length,items:items.map(q=>({...q})),answers:e.answers.slice(),started:e.started};
 S.examHistory=S.examHistory||[];S.examHistory.unshift(result);S.examHistory=S.examHistory.slice(0,30);if(score>=15)S.challengeUnlocked=true;S.exam=null;save();go('exam-result');playExamCelebration(score);if(soundOn){const msg=score>=15?'Bravo ! Tu as acquis beaucoup de connaissances. Continue à t’amuser avec les mots ! Le Mode Challenge est maintenant débloqué dans l’onglet Mondes !':score>=10?'Beau travail ! Tu avances à ton rythme. Quelques entraînements et tu progresseras encore !':'Bravo d’avoir terminé toute l’évaluation ! Chaque essai te fait apprendre. Nous allons progresser ensemble !';speakError(msg)}requestAnimationFrame(()=>{window.scrollTo(0,0);document.scrollingElement?.scrollTo(0,0);root.scrollTop=0})
}
function examResult(){
 const h=(S.examHistory||[])[0];
 if(!h){root.innerHTML='<div class="panel"><h2>Mes évaluations</h2><p>Aucune évaluation terminée pour le moment.</p><button class="cta" id="exam-go">Commencer une évaluation</button><button class="secondary" id="exam-map">Retour à la carte</button></div>';$('#exam-go').onclick=startExam;$('#exam-map').onclick=()=>go(S.resultOrigin==='parent'?'parent':'map');return}
 const items=h.items||D.exam||[], total=items.length, right=h.right??Math.round(h.score*total/20);
 const byWorld=W.map((w,i)=>({name:w.name,world:i,indices:items.map((q,j)=>q.world===i?j:-1).filter(j=>j>=0)})).filter(w=>w.indices.length).map(w=>({...w,good:w.indices.filter(i=>h.answers[i]===items[i].answer).length}));
 const ranked=[...byWorld].sort((a,b)=>(a.good/a.indices.length)-(b.good/b.indices.length));
 const weak=ranked.filter(w=>w.good<w.indices.length), strong=ranked.filter(w=>w.good===w.indices.length);
 const encouragement=h.score>=15?'Bravo ! Tu as acquis beaucoup de connaissances. Continue à t’amuser avec les mots !':h.score>=10?'Beau travail ! Tu avances à ton rythme. Quelques entraînements et tu progresseras encore !':'Bravo d’avoir terminé toute l’évaluation ! Chaque essai te fait apprendre. Nous allons progresser ensemble !';
 const next=h.score>=15?'Le Mode Challenge est maintenant débloqué dans l’onglet Mondes ! En attendant, continue tes aventures dans les cinq mondes !':weak.length?'Je te propose de retourner dans '+weak.slice(0,2).map(w=>w.name).join(' et ')+' pour t’entraîner tranquillement.':'Continue à explorer les mondes pour consolider tes acquis !';
 const breakdown=byWorld.map(w=>{const pct=Math.round(100*w.good/w.indices.length);return `<div class="exam-skill"><div class="exam-skill-head"><b>${escape(w.name)}</b><strong>${w.good}/${w.indices.length}</strong></div><div class="exam-meter"><span style="width:${pct}%"></span></div><small>${pct===100?'🌟 Très bien maîtrisé':pct>=60?'👍 Tu es sur la bonne voie':'🌱 À retravailler tranquillement'}</small>${pct<100?`<button class="secondary exam-train" data-train="${w.world}">🎯 Réviser ce monde</button>`:''}</div>`}).join('');
 const advice=weak.length?`<p>Pour tes prochaines révisions, commence par <b>${weak.slice(0,2).map(w=>escape(w.name)).join(' et ')}</b>. Tu peux t’entraîner directement avec les boutons ci-dessus.</p>`:'<p>🌟 Bravo ! Tous les mondes évalués sont maîtrisés. Continue à jouer pour garder tes acquis.</p>';
 root.innerHTML=`<div class="panel exam-panel exam-report"><div class="eyebrow">✦ TON GRAND BILAN ✦</div><h2>Mon évaluation de français</h2><div class="exam-score">${h.score} <small>/ 20</small></div><p class="sub">${right} bonnes réponses sur ${total}</p><p class="exam-encourage">🌟 ${escape(encouragement)}</p><button class="secondary exam-replay" id="exam-celebrate-again">🎉 Revoir ma célébration</button><h3>🗺️ Mon bilan dans les 5 mondes</h3><p class="sub">Voici ce que tu sais déjà faire et ce que tu peux encore apprendre.</p>${breakdown}<h3>🎯 Mes prochaines révisions</h3>${advice}<p class="exam-next">${escape(next)}</p><h3>📖 Comprendre mes erreurs</h3><p class="sub">Choisis un monde pour découvrir les questions à revoir. Les mondes sans erreur sont aussi indiqués.</p><div class="exam-world-corrections">${byWorld.map(w=>{const mistakes=w.indices.filter(i=>h.answers[i]!==items[i].answer);return `<details class="exam-world-group ${mistakes.length?'has-mistakes':'all-correct'}"><summary><span class="exam-world-title">${mistakes.length?'📖':'🌟'} ${escape(w.name)}</span><span class="exam-world-count">${mistakes.length?mistakes.length+' erreur'+(mistakes.length>1?'s':''):'✓ Bravo ! '+w.good+'/'+w.indices.length+' — Aucune erreur !'}</span></summary><div class="exam-world-content">${mistakes.length?mistakes.map(i=>{const q=items[i];return `<details class="correction is-wrong"><summary>Question ${i+1} · ${escape(q.q)}</summary><p><b>Ta réponse :</b> ${escape(q.options[h.answers[i]]??'Aucune')}</p><p><b>Bonne réponse :</b> ${escape(q.options[q.answer])}</p><p>${escape(q.explanation||'Observe la bonne réponse et entraîne-toi de nouveau.')}</p><button class="secondary exam-speak" data-speak="${i}">🔊 Écouter l’explication</button></details>`}).join(''):'<p class="exam-world-well-done">🌟 Bravo ! Tu as tout bon dans ce monde ! Continue comme ça !</p>'}</div></details>`}).join('')}</div><button class="cta" id="exam-retry">Refaire une évaluation</button><button class="secondary" id="exam-back">${S.resultOrigin==='parent'?'← Retour à l’espace parents':'← Retour à la carte'}</button></div>`;
 root.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speakError(items[+b.dataset.speak].explanation||'Regarde la bonne réponse. Tu vas y arriver !'));
 root.querySelectorAll('[data-train]').forEach(b=>b.onclick=()=>portal(+b.dataset.train));

 $('#exam-celebrate-again').onclick=()=>playExamCelebration(h.score);$('#exam-retry').onclick=startExam;$('#exam-back').onclick=()=>go(S.resultOrigin==='parent'?'parent':'map');
}
function parent(){root.innerHTML=`<div class="panel"><div class="eyebrow">ESPACE PARENTS</div><h2>Suivi de ${escape(S.firstName||S.name||'l’aventurier')}</h2><button class="secondary" id="choose-profile">👨‍👩‍👧 Changer d’enfant / Ajouter un profil</button><button class="secondary" id="parent-exams">📝 Résultats des évaluations</button><button class="secondary" id="replay-guide">❔ Comment jouer ?</button><p class="sub" style="text-align:left">Les résultats sont sauvegardés sur cet appareil. Le meilleur score est conservé pour chaque monde.</p><div class="parent-row"><b>Pièces</b><span>${S.coins}</span></div>${W.map((w,i)=>`<div class="parent-row"><span>${escape(w.name)}</span><b>${S.completed[i]===undefined?'Non terminé':S.completed[i]+'/10'}</b></div>`).join('')}<h3>Évaluations sur 20</h3>${(S.examHistory||[]).slice(0,6).map(h=>`<div class="parent-row"><span>${new Date(h.date).toLocaleDateString('fr-FR')}</span><b>${h.score}/20</b></div>`).join('')||'<p class="sub">Aucune évaluation pour le moment.</p>'}<h3>Dernières aventures</h3>${(S.history||[]).slice(0,8).map(h=>`<div class="parent-row"><span>${escape(W[h.world]?.name||'Monde')} · ${new Date(h.date).toLocaleDateString('fr-FR')}</span><b>${h.score}/${h.total}</b></div>`).join('')||'<p class="sub">Aucune aventure terminée pour le moment.</p>'}<p class="notice">Les profils et la progression sont enregistrés sur cet appareil. Ne supprime pas les données du site.</p><button class="secondary" id="export-profiles" type="button">💾 Exporter une sauvegarde des profils</button><button class="secondary" id="import-profiles" type="button">📂 Restaurer des profils depuis une sauvegarde</button><input id="import-profiles-file" type="file" accept=".json,application/json" hidden></div>`;$('#export-profiles').onclick=exportProfiles;$('#import-profiles').onclick=()=>$('#import-profiles-file').click();$('#import-profiles-file').onchange=e=>importProfiles(e.target.files[0]);$('#choose-profile').onclick=()=>go('profiles');$('#parent-exams').onclick=()=>{S.resultOrigin='parent';go('exam-result')};$('#replay-guide').onclick=openGuide}let deferredInstall=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e});window.addEventListener('appinstalled',()=>{deferredInstall=null});async function installGame(){
 const target=document.getElementById('device-install-guidance')||document.getElementById('install-help');
 const explain=(msg)=>{if(target){target.hidden=false;target.textContent=msg}else alert(msg)};
 if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true){explain('Le jeu est déjà ouvert comme une application sur cet appareil.');return}
 if(deferredInstall){const prompt=deferredInstall;deferredInstall=null;try{await prompt.prompt();return}catch(e){/* fall through to instructions */}}
 if(/iPhone|iPad|iPod/i.test(navigator.userAgent))explain('Sur iPhone ou iPad : ouvre le jeu dans Safari, touche Partager, puis « Sur l’écran d’accueil » et « Ajouter ». Tu peux aussi jouer sans installation.');
 else if(/Android/i.test(navigator.userAgent))explain('Sur Android : dans Chrome, ouvre le menu ⋮ et choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ». Tu peux aussi jouer sans installation.');
 else explain('Sur ordinateur : dans Chrome ou Edge, cherche l’icône d’installation dans la barre d’adresse ou l’option « Installer » du menu. Si elle n’apparaît pas, joue directement dans le navigateur.');
}
function go(v){if(v!=='map')travelBusy=false;if(v!=='exam-result')clearExamCelebration();if(v==='onboarding'){guideStep=0;}stopSpeech();if(S.screen==='quiz'&&v!=='quiz')saveWorldRun();if(v==='exam-result'&&S.screen==='parent')S.resultOrigin='parent';if(v==='parent')S.resultOrigin='parent';S.screen=v;save();update()}document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{if(!activeId){go('onboarding');return}if(b.dataset.go==='home'){go('onboarding')}else if(b.dataset.go==='exam'){if(S.exam)go('exam');else startExam()}else go(b.dataset.go)});const soundToggle=document.getElementById('sound-toggle');if(soundToggle)soundToggle.onclick=()=>{soundOn=!soundOn;soundToggle.textContent=soundOn?'🔊':'🔇';soundToggle.setAttribute('aria-label',soundOn?'Désactiver le son':'Activer le son')};if(!activeId){S={...fresh(),screen:'onboarding'}}else{S={...fresh(),...profiles[activeId]};ensureState();S.screen='onboarding';guideStep=0}try{update()}catch(e){console.error('Erreur accueil',e);root.innerHTML='<div class="castle-menu"><h1>Bienvenue dans le royaume des mots</h1><p>Le jeu n’a pas pu démarrer. Recharge la page pour réessayer.</p><button onclick="location.reload()">Réessayer</button></div>'}if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});})();


// Fenêtre intégrée au jeu : évite le titre technique imposé par le navigateur.
function showChallengeLockedDialog(message,onConfirm){
 const old=document.getElementById('challenge-locked-overlay');if(old)old.remove();
 const overlay=document.createElement('div');overlay.id='challenge-locked-overlay';overlay.className='challenge-locked-overlay';
 overlay.innerHTML='<section class="challenge-locked-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-locked-title"><h2 id="challenge-locked-title">🔒 Le défi est encore verrouillé !</h2><p class="challenge-locked-message"></p><p>Tu es prêt à relever le défi ?</p><div class="challenge-locked-actions"><button type="button" class="challenge-locked-cancel">Plus tard</button><button type="button" class="challenge-locked-accept">Passer l’évaluation</button></div></section>';
 overlay.querySelector('.challenge-locked-message').textContent=message;
 const close=()=>{document.removeEventListener('keydown',onKey);overlay.remove()};
 const onKey=e=>{if(e.key==='Escape')close()};
 overlay.querySelector('.challenge-locked-cancel').addEventListener('click',close);
 overlay.querySelector('.challenge-locked-accept').addEventListener('click',()=>{close();onConfirm()});
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',onKey);document.body.appendChild(overlay);overlay.querySelector('.challenge-locked-accept').focus();
}
