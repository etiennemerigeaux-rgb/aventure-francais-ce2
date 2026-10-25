// V82.5.57 — Compléments pédagogiques CE2, sans modification des identifiants historiques.
// Script chargé après data.js et avant game.js. Les profils restent stockés localement.
(()=>{
'use strict';
const W=window.CE2_DATA&&window.CE2_DATA.worlds;
if(!W||W.length!==5)return;

// q, choix, index de bonne réponse, explication.
// Les situations sont rédigées et non créées en combinant aléatoirement des mots.
const foretCorrections=[
["« Où habites-tu. » : quelle est la bonne correction ?",["Où habites-tu ?","Où habites-tu !","Où habites-tu,","Où habites-tu :"],0,"Une question se termine par un point d’interrogation."],
["« Quelle belle surprise. » : quel signe final exprime la joie ?",[".",",","!",":"],2,"Le point d’exclamation exprime ici la joie."],
["Quelle phrase présente correctement une énumération ?",["Je prends des crayons des feuilles et une règle.","Je prends des crayons, des feuilles et une règle.","Je prends des crayons ? des feuilles et une règle.","Je prends des crayons : des feuilles et une règle."],1,"Les virgules séparent les premiers éléments d’une énumération."],
["Complète : « Voici mon matériel__ une règle, un stylo et un cahier. »",["?",",","!",":"],3,"Les deux-points annoncent ici une liste."],
["« Ce matin, nous avons couru ? » donne une information. Quel signe final convient ?",["Le point (.)","Le point d’interrogation (?)","Les deux-points (:)","La virgule (,)"],0,"Une phrase qui donne simplement une information se termine normalement par un point."],
["Un personnage s'écrie « Au secours. » Quel signe final montre qu'il appelle à l'aide ?",["?",":","!",","],2,"Le point d’exclamation convient à un appel urgent."],
["« Quand commence le spectacle ! » : quelle ponctuation doit-on corriger ?",["Remplacer ! par ?","Remplacer ! par ,","Supprimer le premier mot","Remplacer ! par :"],0,"La phrase demande quand le spectacle commence : c’est une question."],
["« Je voulais t'expliquer… » : pourquoi les points de suspension conviennent-ils ?",["Ils montrent que la phrase n'est pas achevée.","Ils annoncent toujours une liste.","Ils séparent deux personnages.","Ils remplacent le point d’interrogation."],0,"Les points de suspension indiquent ici que la pensée reste inachevée."],
["« Le soleil se couche, La nuit arrive. » : quelle correction est nécessaire ?",["Mettre deux-points à la fin.","Mettre un point après « couche » et une minuscule à « la ».","Placer un point d’interrogation après « couche ».","Supprimer le verbe « arrive »."],1,"Il y a deux phrases déclaratives : on peut écrire « Le soleil se couche. La nuit arrive. »"],
["« Léo demande Tu viens ? » : quel signe manque après « demande » ?",["Un point d’exclamation","Une virgule","Deux-points","Un point"],2,"Les deux-points peuvent introduire les paroles rapportées."],
];
const foretRaisonnement=[
["Quelle phrase pose clairement une question ?",["La porte s'ouvre.","Comme il fait froid !","Qui a pris mon ballon ?","Je range mon sac :"],2,"Le point d’interrogation signale ici la question."],
["Compare « Tu viens. » et « Tu viens ? ». Qu’est-ce qui change ?",["Le personnage n'est plus le même.","La deuxième phrase pose une question.","La deuxième phrase annonce une liste.","La première phrase exprime une surprise."],1,"Un point donne une information ; un point d’interrogation fait de la phrase une question."],
["Remets les mots en ordre et ajoute le bon signe : « caché / où / est / le trésor ».",["Où est le trésor.","Le trésor est où !","Où est caché le trésor ?","Où le trésor est caché !"],2,"« Où est caché le trésor ? » est une question correctement construite."],
["Quelle phrase permet de lire facilement une liste ?",["Dans la boîte, il y a des billes, des cartes et des dés.","Dans la boîte il y a des billes ? des cartes et des dés.","Dans la boîte il y a des billes ! des cartes et des dés.","Dans la boîte, il y a : des billes ? des cartes !"],0,"Les virgules servent à séparer les éléments de l’énumération."],
["Dans « J'ai compris : il faut attendre son tour. », à quoi servent les deux-points ?",["À introduire une explication","À poser une question","À exprimer un ordre","À terminer le dialogue"],0,"Les deux-points annoncent ici ce qui explique « J’ai compris »."],
["« Elle ouvre la boîte et découvre… » : que suggèrent les trois points ?",["La découverte n'est pas encore racontée.","Le récit est une question.","La phrase contient une liste.","La phrase indique une interdiction."],0,"Les points de suspension laissent la suite de l’histoire en attente."],
["« Quelle victoire ! » : quel sentiment la ponctuation aide-t-elle à exprimer ?",["L'enthousiasme","Une question","Un doute sur l'heure","Une liste d’objets"],0,"Le point d’exclamation souligne l’enthousiasme."],
["Compare « Attention. » et « Attention ! ». Quelle phrase marque le mieux un avertissement urgent ?",["La première, grâce au point.","La deuxième, grâce au point d’exclamation.","Les deux sont des questions.","Aucune : il faut deux-points."],1,"Le point d’exclamation renforce l’avertissement."],
["Quelle phrase utilise les deux-points pour annoncer une liste ?",["J'apporte trois choses : une gourde, un livre et un goûter.","J'apporte trois choses ? une gourde, un livre et un goûter.","J'apporte trois choses ! une gourde, un livre et un goûter.","J'apporte trois choses. : une gourde, un livre et un goûter."],0,"On place ici les deux-points juste avant la liste."],
["Choisis la question correctement reconstruite avec « pourquoi / souris / tu ».",["Pourquoi tu souris.","Pourquoi souris-tu ?","Souris tu pourquoi !","Pourquoi, souris-tu :"],1,"« Pourquoi souris-tu ? » est une question bien construite et ponctuée."],
];
const lunettesCorrections=[
["Quelle phrase est correctement écrite ?",["Je pas mange de soupe.","Je ne mange pas de soupe.","Je ne mange de soupe pas.","Je mange ne pas de soupe."],1,"À l’écrit, « ne » et « pas » encadrent le verbe conjugué."],
["Corrige « Nous jouons plus dans cette équipe » pour dire que nous avons arrêté.",["Nous ne jouons plus dans cette équipe.","Nous jouons jamais dans cette équipe.","Nous plus ne jouons dans cette équipe.","Nous ne jouons pas plus dans cette équipe."],0,"« Ne… plus » signifie que l’action a cessé."],
["Quelle phrase signifie que Léa ne ment à aucun moment ?",["Léa ne ment plus.","Léa ment parfois.","Léa ne ment jamais.","Léa ne ment pas aujourd'hui."],2,"« Ne… jamais » indique que l’action ne se produit à aucun moment."],
["Transforme correctement « Je termine mon dessin. » à la forme négative.",["Je ne termine pas mon dessin.","Je termine ne pas mon dessin.","Je pas termine mon dessin.","Je ne termine mon dessin pas."],0,"Dans une négation simple, « ne » précède le verbe et « pas » le suit."],
["Quelle phrase est la correction de « Il ne vient jamais pas » ?",["Il vient ne jamais.","Il ne vient jamais.","Il jamais ne vient pas.","Il ne jamais vient."],1,"La négation « ne… jamais » n’a pas besoin de « pas »."],
["Complète correctement : « Nous __ voyons __ ce film : c'est la première fois. »",["ne / jamais","ne / plus","ne / pas","toujours / pas"],0,"« Ne… jamais » exprime l’absence d’une action dans le temps."],
["Corrige « Tu ne dessines plus jamais » pour dire simplement que tu as arrêté de dessiner.",["Tu ne dessines plus.","Tu ne dessines pas plus.","Tu dessines ne plus.","Tu ne dessines jamais plus pas."],0,"« Ne… plus » exprime l’arrêt d’une activité."],
["Quelle est la transformation affirmative de « Ils ne chantent pas. » ?",["Ils ne chantent plus.","Ils chantent.","Ils ne chantent jamais.","Ils chantent pas."],1,"Pour revenir à la forme affirmative, on enlève la négation « ne… pas »."],
["Quelle négation est bien formée ?",["Elle ne regarde plus la télévision.","Elle regarde plus ne la télévision.","Elle ne plus regarde la télévision.","Elle regarde ne plus la télévision."],0,"« Ne » se place avant le verbe et « plus » après."],
["« Nous ne mangeons jamais de bonbons » : quelle phrase contraire est affirmative ?",["Nous ne mangeons plus de bonbons.","Nous ne mangeons pas de bonbons.","Nous mangeons des bonbons.","Nous mangeons jamais de bonbons."],2,"La forme affirmative ne contient plus de négation."],
];
const lunettesRaisonnement=[
["Avant, Hugo allait à la piscine ; maintenant, il a arrêté. Quelle phrase convient ?",["Hugo ne va jamais à la piscine.","Hugo ne va plus à la piscine.","Hugo ne va pas à la piscine aujourd'hui.","Hugo va toujours à la piscine."],1,"« Ne… plus » indique une activité pratiquée avant, puis arrêtée."],
["Mila n'a, à aucun moment, oublié ses clés. Quelle phrase l'exprime ?",["Mila n'oublie jamais ses clés.","Mila n'oublie plus ses clés.","Mila n'oublie pas ses clés aujourd'hui.","Mila oublie parfois ses clés."],0,"« Ne… jamais » exprime « à aucun moment »."],
["« Je ne lis pas ce soir » et « Je ne lis jamais » ont-elles le même sens ?",["Oui, les deux indiquent une habitude.","Non, la première concerne ce soir, la seconde tous les moments.","Oui, les deux signifient que j'ai arrêté de lire.","Non, la seconde signifie que je lis souvent."],1,"« Pas ce soir » concerne un moment précis ; « jamais » une absence d’action à tout moment."],
["Quel énoncé décrit le mieux « Elle ne court plus » ?",["Elle commence à courir.","Elle n'a couru aucun jour de sa vie.","Elle courait avant mais elle a arrêté.","Elle court uniquement aujourd'hui."],2,"« Ne… plus » indique un arrêt par rapport à avant."],
["Un enfant refuse de manger un plat seulement aujourd'hui. Quelle phrase correspond ?",["Je ne mange pas ce plat aujourd'hui.","Je ne mange jamais ce plat.","Je ne mange plus ce plat.","Je mange toujours ce plat."],0,"« Ne… pas aujourd’hui » exprime une négation limitée à la journée."],
["« Il ne pleut plus » signifie-t-il qu'il n'a jamais plu ?",["Oui, jamais n'a plu.","Non, il pleuvait auparavant et cela s'est arrêté.","Oui, il pleut toujours.","Non, il pleuvra obligatoirement demain."],1,"« Ne… plus » indique ici que la pluie s’est arrêtée."],
["Quelle expression indique une action qui ne se produit à aucun moment ?",["ne… pas aujourd'hui","ne… plus","ne… jamais","encore"],2,"« Ne… jamais » indique une absence d’action dans le temps."],
["Un ami dit : « Je ne joue plus au tennis. » Qu'en déduis-tu ?",["Il n'a jamais joué au tennis.","Il a arrêté de jouer au tennis.","Il joue tous les jours.","Il jouera forcément demain."],1,"« Ne… plus » suggère qu’il jouait auparavant et qu’il a arrêté."],
["« Je ne prends jamais le bus » : quelle affirmation est correcte ?",["Je ne le prends qu'aujourd'hui.","Je le prenais avant mais j'ai arrêté.","Je ne prends le bus à aucun moment.","Je prends le bus parfois."],2,"« Jamais » signifie « à aucun moment »."],
["Pour dire qu'une activité s'est arrêtée, quel couple de mots choisis-tu ?",["ne… jamais","ne… plus","ne… pas aujourd'hui","très… souvent"],1,"On utilise « ne… plus » pour dire qu’une activité a cessé."],
];
function replace(world,index,row,learningType,topic,difficulty){
 const original=W[world].questions[index];
 if(!original||!Array.isArray(original.options))throw Error('Question source manquante : '+world+'/'+index);
 const [q,options,answer,explanation]=row;
 if(!q||!explanation||options.length!==4||!Number.isInteger(answer)||answer<0||answer>=4||new Set(options).size!==4)throw Error('Question pédagogique incorrecte : '+world+'/'+index);
 W[world].questions[index]={...original,q,options,answer,explanation,difficulty,learningType,topic};
}
foretCorrections.forEach((row,i)=>replace(0,60+i,row,'correction','correction','medium'));
foretRaisonnement.forEach((row,i)=>replace(0,90+i,row,'raisonnement','reconstruction','hard'));
lunettesCorrections.forEach((row,i)=>replace(4,8+i*10,row,'correction','correction','hard'));
lunettesRaisonnement.forEach((row,i)=>replace(4,9+i*10,row,'raisonnement','sens','hard'));

const categories={
 0:['question','exclamation','information','énumération','liste','suspension','correction','phrases','comparaison','reconstruction'],
 4:['verbe','négation','identifier','compléter','affirmation','transformation','jamais','plus','correction','raisonnement']
};
function makeRun(world,turn,lastTopic){
 if(world!==0&&world!==4)throw Error('Monde non concerné');
 const questions=W[world].questions;
 if(questions.length!==100)throw Error('Le monde doit comporter exactement 100 questions');
 const round=((Math.trunc(Number(turn)||0)%10)+10)%10;
 const selected=[];
 for(let f=0;f<10;f++){
  const idx=world===0?f*10+(f+round)%10:((f+round)%10)*10+f;
  selected.push({idx,category:categories[world][f],difficulty:questions[idx].difficulty});
 }
 const ranks={easy:0,medium:1,hard:2};
 // Difficulté progressive : faciles d'abord, intermédiaires puis difficiles.
 // Mélange léger à difficulté égale afin que la séquence ne soit pas figée.
 const ordered=[];
 let previous=lastTopic;
 for(const rank of [0,1,2]){
  let group=selected.filter(x=>ranks[x.difficulty]===rank);
  for(let j=group.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[group[j],group[k]]=[group[k],group[j]]}
  if(group.length>1&&group[0].category===previous){
   const alt=group.findIndex(x=>x.category!==previous);
   if(alt>0)[group[0],group[alt]]=[group[alt],group[0]];
  }
  ordered.push(...group);
  if(group.length)previous=group[group.length-1].category;
 }
 if(ordered.length!==10||new Set(ordered.map(x=>x.idx)).size!==10)throw Error('Sélection pédagogique invalide');
 return {indices:ordered.map(x=>x.idx),lastTopic:ordered[9].category,categories:ordered.map(x=>x.category)};
}
window.CE2_PEDAGOGY={version:'v82.5.57',makeRun,categories};
})();