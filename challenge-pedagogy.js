/* Version V82.5.66 : activités Challenge et variantes acceptables */
(function install(){
'use strict';
const B=window.CE2_CHALLENGES;
if(!Array.isArray(B)||B.length!==30)throw Error("Banque Challenge absente");
const meta=[
["Lina","Tom","découvre","découvrir","découvrent","une carte","Lina ne trouve pas la clé.","Lina trouve la clé.","Les livres aidaient les pirates à retrouver leur chemin.","Hier"],
["Milo","Inès","suit","suivre","suivent","des traces","Milo ne voit pas l’oiseau derrière les fougères.","Milo voit l’oiseau derrière les fougères.","Le garde forestier va soigner le geai.","Ce matin"],
["Nora","Sami","termine","terminer","terminent","un robot","Le robot ne tourne pas devant le cube.","Le robot tourne devant le cube.","Le capteur détecte la boîte rouge.","Hier"],
["Hugo","la guide","découvre","découvrir","découvrent","une maquette","Hugo ne trouve pas son casque de simulation.","Hugo trouve son casque de simulation.","Hugo voit un grand cratère.","Hier"],
["Emma","Paul","remarque","remarquer","remarquent","une porte","Emma ne possède pas la clé de cette porte.","Emma possède la clé de cette porte.","Le guide autorise la lecture, mais avec précaution.","Ce matin"],
["Adam","Léa","prépare","préparer","préparent","une course","Adam ne court pas avant le signal du départ.","Adam court avant le signal du départ.","Adam fait tout son possible pendant la course.","Hier"],
["Zoé","sa grand-mère","découvre","découvrir","découvrent","une boîte","Zoé ne parvient pas à ouvrir le couvercle.","Zoé parvient à ouvrir le couvercle.","La grand-mère jouait avec ses amis chaque mercredi.","Hier"],
["Noé","son père","aperçoit","apercevoir","aperçoivent","une pousse","Noé ne sait pas encore quelle plante grandira.","Noé sait déjà quelle plante grandira.","La plante a besoin d’eau et de lumière.","Hier"],
["Jade","le gardien","découvre","découvrir","découvrent","une horloge","Jade ne comprend pas le fonctionnement de l’horloge.","Jade comprend le fonctionnement de l’horloge.","Les voitures anciennes étaient différentes de celles d’aujourd’hui.","Hier"],
["Louis","Rose","prépare","préparer","préparent","une fête","Louis ne retrouve pas le panier du petit chien.","Louis retrouve le panier du petit chien.","Une famille souhaite rencontrer le chien.","Hier"]];
const kinds=["ponctuation","dialogue","temps","verbe","negation"];
function task(kind,prompt,right,bad,reason,type,seed){
 const raw=[right,...bad];if(raw.length!==4||new Set(raw).size!==4)throw Error("Choix non distincts : "+prompt);
 const shift=(seed+kinds.indexOf(kind))%4;
 return {mode:"choice",kind,prompt,options:raw.map((_,i)=>raw[(i-shift+4)%4]),correct:shift,answer:[],words:[right],taskType:type,explanation:reason,generated:true};
}
function make(story,profile,k){
 const [n,other,verb,inf,pl,obj,neg,pos,outcome,cue]=profile;
 const quote=story.text.match(/«\s*([^»]+?)\s*»/)?.[1]||"Bonjour !";
 const unusedInf=[...new Set(meta.map(p=>p[3]))].filter(x=>x!==inf).slice(0,3);
 const dialoguePurposes=["Pour comprendre pourquoi les pirates conservaient des livres.","Pour savoir si le geai va guérir.","Pour comprendre pourquoi le robot s’arrête.","Pour savoir ce que Hugo voit à droite.","Pour demander si le journal peut être lu.","Pour encourager Adam pendant la course.","Pour savoir si la grand-mère jouait avec ses amis.","Pour demander ce dont la plante a besoin.","Pour savoir si les voitures existaient autrefois.","Pour demander qui voudrait adopter un animal."];
 const endings=[["Lina","racontera son aventure à sa classe","Pour partager sa découverte avec les autres élèves."],["Milo","reviendra avec sa sœur","Pour suivre les nouvelles du geai."],["Nora","présentera son robot à l’école","Pour faire découvrir son invention."],["Hugo","dessinera une fusée","Pour garder un souvenir de sa visite."],["Emma","reviendra au château avec sa classe","Pour partager la découverte avec ses camarades."],["Adam","s’entraînera encore","Pour progresser dans la course de relais."],["Zoé","écrira les souvenirs de famille","Pour conserver les histoires de sa grand-mère."],["Noé","mesurera la plante de nouveau","Pour observer sa croissance."],["Jade","racontera sa visite à son grand-père","Pour partager ce qu’elle a appris au musée."],["Louis","aidera encore au refuge","Pour continuer à prendre soin des animaux."]];
 const quotes=[...story.text.matchAll(/«\s*([^»]+?)\s*»/g)].map(m=>m[1]);
 const secondQuote=quotes[1]||quote;

 if(unusedInf.length!==3)throw Error("Pas assez d'infinitifs");
 if(story.level===0)return [
  task("ponctuation",`Pourquoi écrit-on deux-points après « ${n} dit » dans une phrase ?`,"Pour introduire les paroles du personnage",["Pour supprimer les guillemets","Pour indiquer une fin de chapitre","Pour signaler une question au narrateur"],"Les deux-points introduisent les paroles rapportées après le verbe de parole.","fonction",k),
  task("dialogue",`Dans l’extrait « ${n} ... : « ${quote} » », qui prononce les paroles ?`,n,[other,"Le narrateur","Tous les personnages"],`L’auteur indique que ${n} prononce la réplique.`,"locuteur",k+1),
  task("temps",`Dans le récit, « ${cue} » situe l’action...`,"dans le passé",["dans le futur","à aucun moment","dans une question"],`« ${cue} » indique une action qui se situe avant le moment présent.`,"chronologie",k+2),
  task("verbe",`Quel est l’infinitif de « ${verb} » dans « ${n} ${verb} ${obj} » ?`,inf,unusedInf,`Le verbe conjugué « ${verb} » a pour infinitif « ${inf} ».`,"infinitif",k+3),
  task("negation",`Dans « ${neg} », que signifie « ne… pas » ?`,"L’action ne se réalise pas.",["L’action a toujours lieu.","La phrase pose une question.","L’action se produit plus souvent."],"« Ne… pas » exprime une négation autour du verbe.","sens",k+4)
 ];
 if(story.level===1)return [
  task("ponctuation",`Quelle phrase présente correctement les paroles de ${n} ?`,`${n} dit : « ${quote} »`,[`${n} dit ? « ${quote} »`,`${n} dit ! « ${quote} »`,`${n} dit : « ${quote}`],"Après le verbe de parole, les deux-points annoncent les paroles et les guillemets les encadrent.","correction",k),
  task("dialogue",`Dans la suite de l’histoire, pourquoi le personnage dit-il « ${secondQuote} » ?`,dialoguePurposes[k],dialoguePurposes.filter((_,i)=>i!==k).slice(0,3),`Cette réplique sert à : ${dialoguePurposes[k].toLocaleLowerCase("fr")}`,"compréhension",k+1),
  task("temps",`Quel rapport au temps exprime « ${cue} » ?`,`${cue} → passé`,[`${cue} → futur`,`${cue} → négation`,`${cue} → nom d'un personnage`],`« ${cue} » permet de repérer une action qui s’est déjà produite.`,"application",k+2),
  task("verbe",`Quel est le sujet du verbe « ${verb} » dans « ${n} ${verb} ${obj} » ?`,n,[obj,other,"le narrateur"],`« ${n} » est le sujet : il réalise l’action indiquée par le verbe.`,"sujet",k+3),
  task("negation",`Quelle phrase transforme « ${neg} » à la forme affirmative ?`,pos,[neg,"Cette phrase n'a pas de verbe.","Il faut garder « ne… pas »."],"On retire « ne… pas » et on conserve la phrase correctement construite.","transformation",k+4)
 ];
 const incorrectActions=meta.filter((_,i)=>i!==k).slice(0,3).map(m=>m[8]);
 return [
  task("ponctuation","Quel signe termine une question que pose un personnage dans un dialogue ?","Le point d’interrogation ?",["La virgule ,","Les deux-points :","Le point final ."],"Le point d’interrogation clôt la question ; les deux-points introduisent les paroles.","fonction",k),
  task("dialogue",`Dans le dernier passage de « ${story.title} », pourquoi ${endings[k][0]} ${endings[k][1]} ?`,endings[k][2],endings.filter((_,i)=>i!==k).slice(0,3).map(x=>x[2]),`La fin de l’histoire montre que ${endings[k][0]} poursuit une intention précise : ${endings[k][2].toLocaleLowerCase("fr")}`,"inférence",k+1),
  task("temps",`Pourquoi le récit contient-il « ${cue} » puis « Demain » ?`,"Pour situer des événements à différents moments.",["Pour indiquer que toutes les actions se déroulent ensemble.","Pour remplacer tous les verbes.","Pour montrer uniquement qui parle."],"Ces mots aident à situer les actions dans le passé ou dans le futur.","comparaison",k+2),
  task("verbe",`Si « ${n} ${verb} ${obj} » devient « Les enfants ... », quelle phrase est correcte ?`,`Les enfants ${pl} ${obj}.`,[`${n} ${pl} ${obj}.`,`Les enfants ${verb} ${obj}.`,`Les enfants ${inf} ${obj}.`],`Avec le sujet pluriel « Les enfants », la forme du verbe est « ${pl} ».`,"accord",k+3),
  task("negation","Quelle différence existe entre « ne… pas » et « ne… jamais » ?","« Ne… jamais » signifie « à aucun moment ».",["« Ne… pas » signifie toujours « plus maintenant ».","« Ne… jamais » met le verbe au futur.","Les deux expressions sont des questions."],"« Ne… jamais » indique une absence à tout moment, contrairement à une simple négation.","raisonnement",k+4)
 ];
}
let groups=0,ambiguous=0,added=0;
for(const story of B){
 const idx=Number(story.id.slice(3))-1;
 const suffix=story.id.slice(3);
 const prev=B.find(x=>x.id==='C'+(story.level)+'-'+suffix);
 story.focusExcerpt=story.level===0?'':prev&&story.text.startsWith(prev.text)?story.text.slice(prev.text.length).trim():'';
 if(story.level>0&&!story.focusExcerpt)throw Error('Passage inédit introuvable : '+story.id);if(idx<0||idx>=10)throw Error("Mauvais numéro de récit");
 const byPrompt=new Map();
 for(const m of story.missions){
  m.mode="highlight";m.taskType="repérage";
  const id=m.kind+"|"+m.prompt;const a=byPrompt.get(id)||[];a.push(m);byPrompt.set(id,a);
 }
 for(const values of byPrompt.values()){
  const index=new Map();
  for(const m of values)for(const alt of (m.alternatives?.length?m.alternatives:[m.answer])){
   index.set([...alt].sort((a,b)=>a-b).join(","),[...alt]);
  }
  if(index.size<2)continue;
  const choices=[...index.values()];
  for(const m of values){m.alternatives=choices.map(a=>[...a]);m.ambiguityResolved=true}
  groups++;ambiguous+=values.length;
 }
 const fresh=make(story,meta[idx],idx);
 if(fresh.length!==5)throw Error("Questionnaire incomplet "+story.id);
 story.missions.push(...fresh);added+=5;
}
function grade(m,selected,color,chosen,colors){
 if(m.mode==='choice'){
  const correct=Number.isInteger(chosen)&&chosen===m.correct;
  return {ok:correct,points:correct?2:0,wordOk:correct,colorOk:true};
 }
 const selections=Array.isArray(selected)?selected:[];
 const valid=m.alternatives?.length?m.alternatives:[m.answer];
 const value=[...selections].sort((a,b)=>a-b).join(',');
 const wordOk=valid.some(a=>[...a].sort((a,b)=>a-b).join(',')===value);
 const colorOk=Array.isArray(colors)&&colors.includes(color);
 return {ok:wordOk&&colorOk,points:wordOk?(colorOk?2:1):0,wordOk,colorOk};
}
window.CE2_CHALLENGE_PEDAGOGY={version:2,repairedGroups:groups,repairedMissions:ambiguous,generated:added,grade};
})();