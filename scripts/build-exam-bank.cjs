'use strict';
/* Banque INÉDITE de 500 QCM pour l'évaluation CE2.
   Génération déterministe, séparée du réservoir d'entraînement.
   Cinq compétences par monde ; 40 faciles, 40 intermédiaires, 20 difficiles,
   sauf le dialogue où chaque compétence est équilibrée (8/8/4).
   Source de référence : programme de français cycle 2, BO 31/10/2024. */
function buildExamBank(){
 const out=[], names=['Clara','Malo','Zoé','Amir','Lila','Noé','Jade','Sami','Maya','Hugo'];
 const stems=['dessin','prépar','observ','écout','visit','port','cherch','répar','film','colori'];
 const objs=['une affiche','son cartable','les oiseaux','une histoire','un musée','un colis','sa boussole','un jouet','un spectacle','un paysage'];
 const ctx=names.map((name,i)=>({name,stem:stems[i],object:objs[i],
  inf:stems[i]+'er',pre:stems[i]+'e',past:stems[i]+'ait',future:stems[i]+'era',
  plural:stems[i]+'ent',nous:stems[i]+'ons'}));
 const offset=world=>out.filter(q=>q.world===world).length;
 function add(world,text,options,correct,explanation,difficulty,topic){
   if(!['easy','medium','hard'].includes(difficulty)||!text||!explanation)throw Error('Question incomplète '+world);
   if(options.length!==4||new Set(options).size!==4||!options.includes(correct))throw Error('Choix incorrects : '+text);
   const n=offset(world)+1, shift=(n*7+world)%4, order=options.slice(shift).concat(options.slice(0,shift));
   out.push({id:'exam-ce2-20261024-w'+(world+1)+'-'+String(n).padStart(3,'0'),
    world,q:text,options:order,answer:order.indexOf(correct),explanation,difficulty,...(topic?{topic}:{})});
 }
 function difficult(j){return j<4?'easy':j<8?'medium':'hard'}
 for(const c of ctx){
  // Monde 1 : utiliser la ponctuation en situation, sans recycler les phrases des entraînements.
  const forms=[
   ['Au tableau, on lit : « Où '+c.name+' trouve-t-elle '+c.object+'__ » Quel signe termine cette question ?', ['?','!','.',':'],'?','Une question écrite se termine par un point d’interrogation.'],
   ['« Quelle magnifique découverte__ » s’exclame '+c.name+'. Complète son exclamation.', ['!','?',',','.'],'!','Le point d’exclamation traduit ici la surprise et l’émotion.'],
   [c.name+' a fini '+c.object+'__. Quel signe termine normalement cette affirmation ?', ['.','?',',':','…'],'.','Une phrase qui donne une information se termine normalement par un point.'],
   [c.name+' emporte une lampe__ une corde et une carte. Quel signe sépare les éléments de cette énumération ?', [',','.',':','?'],',','La virgule sépare les éléments successifs d’une énumération.'],
   ['Sur la table, '+c.name+' pose trois choses__ un livre, une trousse et une règle. Quel signe annonce la liste ?', [':',',','?','!'],':','Les deux-points introduisent la liste des objets annoncés.'],
   [c.name+' ouvre lentement la boîte et découvre__ Quel signe laisse le récit en suspens ?', ['…','.','?','!'],'…','Les points de suspension créent une attente en laissant la phrase inachevée.'],
   [c.name+' ouvre la fenêtre__ Puis la pièce devient lumineuse. Quel signe sépare les deux phrases ?', ['.',',',':','!'],'.','Un point sépare deux phrases distinctes. La phrase suivante commence par une majuscule.'],
   ['Est-ce que '+c.name+' a retrouvé '+c.object+'__ Quel signe clôt la phrase ?', ['?','.',',','…'],'?','La tournure « Est-ce que » introduit une question : on écrit ?.'],
   [c.name+' annonce : « Nous avons tout retrouvé ! » Quel signe introduit ses paroles juste avant les guillemets ?', [':',',','.','?'],':','Les deux-points peuvent annoncer les paroles rapportées entre guillemets.'],
   ['Dans « '+c.name+'__ approche ! », quel signe sert à séparer le prénom de l’ordre adressé à cette personne ?', [',',':','.','?'],',','La virgule détache ici le prénom de la personne à qui l’on parle.']
  ];
  forms.forEach(([q,o,a,e],j)=>add(0,q,o,a,e,difficult(j)));
  // Monde 3 : repérer le temps et reconnaître les formes conjuguées.
  const t=[
   ['« Avant-hier, '+c.name+' '+c.past+' '+c.object+'. » L’action a lieu à quel moment ?', ['Passé','Présent','Futur','Impossible à déterminer'],'Passé','« Avant-hier » situe cette action dans le passé.'],
   ['« À cet instant, '+c.name+' '+c.pre+' '+c.object+'. » Quel moment est indiqué ?', ['Présent','Passé','Futur','Un temps indéfini'],'Présent','« À cet instant » indique une action en cours au présent.'],
   ['« Après-demain, '+c.name+' '+c.future+' '+c.object+'. » L’action se déroule quand ?', ['Futur','Présent','Passé','Sans repère temporel'],'Futur','« Après-demain » situe l’action dans le futur.'],
   ['Dans « La veille, '+c.name+' '+c.past+' '+c.object+'. », quel groupe de mots indique le moment ?', ['La veille',c.name,c.past,c.object],'La veille','« La veille » indique un moment précédant un autre événement du récit.'],
   ['Quelle forme complète la phrase à l’imparfait : « Jadis, '+c.name+' __ '+c.object+'. » ?', [c.past,c.pre,c.future,c.inf],c.past,'À l’imparfait, « '+c.past+' » raconte une action située dans le passé.'],
   ['Complète au futur : « Dans deux jours, '+c.name+' __ '+c.object+'. »', [c.future,c.pre,c.past,c.inf],c.future,'La forme « '+c.future+' » est au futur : elle évoque une action à venir.'],
   ['Pour dire ce que '+c.name+' fait en ce moment, quelle forme faut-il choisir ?', [c.pre,c.past,c.future,c.inf],c.pre,'« '+c.pre+' » est la forme du verbe au présent avec '+c.name+'.'],
   ['Parmi ces expressions, laquelle indique clairement que l’action est passée ?', ['Le mois précédent','Le mois suivant','Dans une heure','En ce moment'],'Le mois précédent','« Le mois précédent » indique un moment antérieur : le passé.'],
   ['Sans indice comme « demain », quelle forme verbale est au futur : '+c.name+' __ '+c.object+' ?', [c.future,c.past,c.pre,c.inf],c.future,'La terminaison -era de « '+c.future+' » indique le futur avec ce sujet.'],
   ['Sans l’aide d’un mot de temps, quelle forme est à l’imparfait : '+c.name+' __ '+c.object+' ?', [c.past,c.pre,c.future,c.inf],c.past,'À la troisième personne du singulier, « '+c.past+' » est à l’imparfait.']
  ];
  t.forEach(([q,o,a,e],j)=>add(2,q,o,a,e,difficult(j)));
  // Monde 4 : sujets, infinitifs, formes et accords.
  const v=[
   ['Dans « '+c.name+' '+c.pre+' '+c.object+'. », quel mot est le verbe conjugué ?', [c.pre,c.name,c.object,'le point'],c.pre,'« '+c.pre+' » est le verbe conjugué : on peut modifier son temps.'],
   ['Dans « '+c.name+' '+c.pre+' '+c.object+'. », qui est le sujet du verbe ?', [c.name,c.pre,c.object,'aucun sujet'],c.name,'Le sujet « '+c.name+' » indique de qui l’on parle et commande l’accord du verbe.'],
   ['Quel est l’infinitif de « '+c.pre+' » ?', [c.inf,c.past,c.future,c.plural],c.inf,'L’infinitif « '+c.inf+' » est la forme du dictionnaire.'],
   ['« '+c.name+' '+c.pre+' '+c.object+'. » Quelle forme obtient-on si l’action se déroulait autrefois ?', [c.past,c.future,c.pre,c.inf],c.past,'« '+c.past+' » est à l’imparfait : le verbe change quand le temps change.'],
   ['Complète au futur avec le verbe '+c.inf+' : « Bientôt, '+c.name+' __ '+c.object+'. »', [c.future,c.pre,c.past,c.inf],c.future,'Le futur de « '+c.inf+' » avec '+c.name+' est « '+c.future+' ».'],
   ['Avec quel verbe conjugue-t-on correctement à l’imparfait : « Quand il était petit, '+c.name+' __ '+c.object+'. » ?', [c.past,c.pre,c.future,c.inf],c.past,'On utilise la forme « '+c.past+' » à l’imparfait.'],
   ['« Les enfants __ '+c.object+'. » Quelle forme au présent s’accorde avec ce sujet pluriel ?', [c.plural,c.pre,c.past,c.nous],c.plural,'Avec « les enfants » (ils), la forme du présent se termine ici par -ent.'],
   ['« Nous __ '+c.object+'. » Quelle forme au présent convient ?', [c.nous,c.plural,c.pre,c.past],c.nous,'Avec « nous », les verbes réguliers du premier groupe prennent ici la terminaison -ons.'],
   ['Pour passer de « '+c.name+' '+c.pre+' » à « Elles __ », quelle forme du verbe choisir ?', [c.plural,c.nous,c.pre,c.future],c.plural,'Le sujet « elles » commande le pluriel : « '+c.plural+' ».'],
   ['Quelle phrase accorde correctement le verbe « '+c.inf+' » avec « Nous » au présent ?', ['Nous '+c.nous+' '+c.object+'.','Nous '+c.pre+' '+c.object+'.','Nous '+c.plural+' '+c.object+'.','Nous '+c.past+' '+c.object+'.'],'Nous '+c.nous+' '+c.object+'.','« Nous » appelle la terminaison -ons dans « nous '+c.nous+' ».']
  ];
  v.forEach(([q,o,a,e],j)=>add(3,q,o,a,e,difficult(j)));
  // Monde 5 : construire et comprendre plusieurs formes de négation.
  const affirmative=c.name+' '+c.pre+' '+c.object+'.', negative=c.name+' ne '+c.pre+' pas '+c.object+'.';
  const neg=[
   ['Dans « '+negative+' », quels sont les deux mots de la négation ?', ['ne et pas','le et '+c.name,'ne et '+c.pre,c.pre+' et pas'],'ne et pas','La négation « ne…pas » entoure ici le verbe conjugué.'],
   ['Quelle phrase est à la forme négative ?', [negative,affirmative,c.name+' '+c.future+' '+c.object+'.',c.name+' '+c.past+' '+c.object+'.'],negative,'« Ne » et « pas » permettent d’exprimer la forme négative.'],
   ['Quelle phrase affirmative correspond à « '+negative+' » ?', [affirmative,negative,c.name+' ne '+c.pre+' jamais '+c.object+'.',c.name+' ne '+c.pre+' plus '+c.object+'.'],affirmative,'On retire les deux éléments « ne » et « pas » sans changer le temps du verbe.'],
   ['Transforme la phrase « '+affirmative+' » à la forme négative.',[negative,c.name+' '+c.pre+' pas '+c.object+'.',c.name+' ne '+c.pre+' '+c.object+'.',c.name+' '+c.future+' '+c.object+'.'],negative,'Dans une phrase écrite, la négation complète est « ne…pas ».'],
   ['Dans « '+c.name+' n’écoute pas la radio », pourquoi utilise-t-on « n’ » ?', ['Devant une voyelle','Devant un nom','Devant un pluriel','Devant un point'],'Devant une voyelle','« Ne » s’élide devant la voyelle initiale du verbe « écoute ».'],
   ['« '+c.name+' ne '+c.pre+' jamais '+c.object+'. » Quel mot signifie « à aucun moment » ?', ['jamais','ne',c.pre,'pas'],'jamais','« Ne…jamais » signifie que l’action ne se produit à aucun moment.'],
   ['« '+c.name+' ne '+c.pre+' plus '+c.object+'. » Que signifie cette négation ?', ['L’action a cessé','L’action commence','L’action est obligatoire','L’action se déroule demain'],'L’action a cessé','« Ne…plus » indique qu’une action a cessé.'],
   ['« '+c.name+' ne trouve rien dans le tiroir. » Quels mots constituent la négation ?', ['ne et rien','ne et trouve','trouve et rien','dans et le'],'ne et rien','La négation « ne…rien » indique qu’aucune chose n’est trouvée.'],
   ['Pour dire que '+c.name+' ne fait plus cette action, quelle phrase choisir ?', [c.name+' ne '+c.pre+' plus '+c.object+'.',negative,affirmative,c.name+' '+c.pre+' toujours '+c.object+'.'],c.name+' ne '+c.pre+' plus '+c.object+'.','« Ne…plus » signale que l’action ne se produit plus, alors qu’elle se produisait auparavant.'],
   ['Quelle phrase respecte l’accord et la négation avec « Les enfants » ?', ['Les enfants ne '+c.plural+' pas '+c.object+'.','Les enfants ne '+c.pre+' pas '+c.object+'.','Les enfants '+c.plural+' pas '+c.object+'.','Les enfants ne '+c.plural+' '+c.object+'.'],'Les enfants ne '+c.plural+' pas '+c.object+'.','« Les enfants » est un sujet pluriel : « '+c.plural+' ». La négation contient « ne » et « pas ».']
  ];
  neg.forEach(([q,o,a,e],j)=>add(4,q,o,a,e,difficult(j)));
 }
 // Monde 2 : cinq compétences, 20 situations inédites par compétence.
 const speaker=['Louna','Oscar','Inaya','Timéo','Sarah','Émile','Fatou','Gabin','Amélie','Yanis','Iris','Nolan','Alice','Nina','Eden','Mathis','Camille','Léonie','Raphaël','Chloé'];
 const others=['Mila','Adam','Lou','Liam','Enzo','Aya','Maël','Hana','Noah','Léo','Zoé','Sacha','Paul','Jade','Tom','Clara','Sami','Romy','Inès','Hugo'];
 const say=['demande','répond','murmure','précise','annonce','explique','s’exclame','chuchote','ajoute','propose','réplique','s’inquiète','affirme','raconte','rassure','proteste','déclare','souffle','avertit','s’étonne'];
 const utter=[
 'Où se trouve le chemin ?','Je connais la réponse.','Approche sans faire de bruit !','Le départ est à huit heures.','Le spectacle commence !',
 'Cette carte indique la rivière.','Nous avons réussi !','Ne réveille pas le chat.','La boîte est vide.','Prenons le sentier bleu !',
 'Je ne suis pas d’accord !','Avons-nous oublié la lampe ?','C’est bien la bonne adresse.','Hier, nous avons visité la gare.','Tu peux y arriver.',
 'Je préfère attendre ici.','Notre rendez-vous est demain.','Je crois entendre un bruit.','Attention à la marche !','Quelle incroyable surprise !'
 ];
 const reply=['Regarde derrière le portail.','Merci pour ton aide.','Je marche doucement.','J’arriverai avant la sonnerie.','Je vais chercher un billet.',
 'Le pont est plus loin.','Quelle bonne nouvelle !','D’accord, je serai silencieux.','Vérifions sous la table.','Suivons les panneaux.',
 'Écoutons aussi les autres.','Oui, j’ai vérifié mon sac.','Alors nous pouvons partir.','Raconte-moi la suite.','Je vais réessayer.',
 'Je préfère rester encore un peu.','Nous y serons à temps.','Moi aussi, je l’ai entendu.','Je regarderai où je pose les pieds.','C’est une belle découverte.'
 ];
 for(let i=0;i<20;i++){
  const n=speaker[i],o=others[i],u=utter[i],r=reply[i],v=say[i];
  const diff=i<8?'easy':i<16?'medium':'hard';
  const contextual=n+' '+v+' : « '+u+' »';
  // Verbes de parole.
  let verbQ=i<16?'Dans « '+contextual+' », quel est le verbe de parole ?':
    'Dans cette réplique : '+contextual+' Quel mot indique l’action de parler ?';
  add(1,verbQ,[v,'marche','cherche','regarde'],v,'« '+v+' » introduit les paroles de '+n+' et précise sa manière de s’exprimer.',diff,'verbes');
  // Tirets de dialogue.
  const dashText='— '+u+' — '+r;
  const dashQ=i<8?'Quel signe place-t-on devant une nouvelle réplique de '+n+' ?':
    i<16?'Dans ce dialogue : « '+dashText+' », combien de tirets annoncent des répliques ?':
    'Dans « '+dashText+' », quel signe indique le changement de personnage ?';
  add(1,dashQ,i<8?['—',':','«','?']:i<16?['Deux','Un','Trois','Aucun']:['Le tiret de dialogue','La virgule','Le point','Les deux-points'],
    i<8?'—':i<16?'Deux':'Le tiret de dialogue','Le tiret de dialogue se place devant une réplique et aide à repérer chaque prise de parole.',diff,'tirets');
  // Deux-points.
  const colonQ=i<8?'Complète : '+n+' '+v+'__ « '+u+' » Quel signe annonce les paroles ?':
    i<16?'Dans la phrase « '+contextual+' », à quoi servent les deux-points ?':
    'Quelle phrase utilise les deux-points pour annoncer correctement les paroles de '+n+' ?';
  const colonCorrect=n+' '+v+' : « '+u+' »';
  add(1,colonQ,i<8?[':',',',';','.']:i<16?['À annoncer les paroles','À terminer une question','À séparer des syllabes','À remplacer les guillemets']:
   [colonCorrect,n+' : '+v+' « '+u+' »',n+' '+v+' « : '+u+' »',n+' '+v+' « '+u+' : »'],
   i<8?':':i<16?'À annoncer les paroles':colonCorrect,'Les deux-points se placent après le verbe de parole pour annoncer les paroles citées.',diff,'deux-points');
  // Guillemets.
  const quoteQ=i<8?'Dans « '+contextual+' », quel guillemet ouvre les paroles ?':
    i<16?'Dans la phrase '+contextual+' Quel signe marque la fin des paroles de '+n+' ?':
    'Quelle proposition entoure correctement les paroles prononcées par '+n+' ?';
  const proper=n+' '+v+' : « '+u+' »';
  add(1,quoteQ,i<8?['«','»','—',':']:i<16?['»','«',':','—']:
   [proper,n+' '+v+' : » '+u+' «',n+' '+v+' : « '+u+' «',n+' '+v+' : '+u+' »'],
   i<8?'«':i<16?'»':proper,'Les guillemets ouvrants « et fermants » encadrent exactement les paroles rapportées.',diff,'guillemets');
  // Lecture du dialogue : qui parle, quelle réplique, changement de locuteur.
  const talk='— '+u+' dit '+n+'. — '+r+' répond '+o+'.';
  const diaQ=i<8?'Dans le dialogue suivant, qui parle en premier ? '+talk:
    i<16?'Dans cet échange, quelle réplique est prononcée par '+o+' ? '+talk:
    'Dans cet échange, qui répond à '+n+' ? '+talk;
  add(1,diaQ,i<8?[n,o,'Le narrateur','Les deux ensemble']:
    i<16?[r,u,'La phrase du narrateur','Aucune des deux répliques']:
    [o,n,'Le narrateur','Personne'],
    i<8?n:i<16?r:o,'Chaque tiret indique une réplique ; on repère le personnage à l’aide du verbe de parole.',diff,'dialogue');
 }
 const per=[0,1,2,3,4].map(w=>out.filter(q=>q.world===w));
 if(per.some(a=>a.length!==100))throw Error('Une banque ne contient pas 100 questions');
 if(new Set(out.map(q=>q.q.trim().toLowerCase())).size!==500)throw Error('Certaines questions sont identiques');
 return out;
}
if(typeof module!=='undefined')module.exports={buildExamBank};
