/* Pilot pédagogique V82.5.70 : deux séries de 10 missions, sans modifier les index existants. */
(function(){
'use strict';
const PILOT={
  "version": 2,
  "tag": "pilote-pirates-coherence-2026",
  "level1": {
    "intro": [
      {
        "title": "Bienvenue dans Expert !",
        "body": "Tu vas chercher des indices dans une histoire, puis répondre à une question. Tu peux utiliser plusieurs surligneurs."
      },
      {
        "title": "Un indice à la fois",
        "body": "Lis la petite consigne. Colorie les mots ou les signes demandés. Tu peux changer de couleur sans effacer les autres."
      },
      {
        "title": "À toi de comprendre !",
        "body": "Quand tes indices sont corrects, une question apparaît. Lis les quatre réponses et choisis la meilleure. Tu peux demander un indice."
      }
    ]
  },
  "level2": {
    "intro": [
      {
        "title": "Bienvenue dans Maître des mots !",
        "body": "Ici, tu vérifies des informations et tu répares des phrases grâce aux preuves trouvées dans l’histoire."
      },
      {
        "title": "Retrouve les preuves",
        "body": "Lis la première consigne. Colorie les mots ou les signes demandés avec les bons surligneurs."
      },
      {
        "title": "Réfléchis avant de répondre",
        "body": "Compare les preuves avec la question. Choisis la phrase qui respecte l’histoire. Une aide est disponible si tu en as besoin."
      }
    ]
  },
  "stories": {
    "C2-01": [
      {
        "id": "P2-01-01",
        "level": 1,
        "mode": "pilot",
        "kind": "ponctuation",
        "range": [
          15,
          24
        ],
        "evidence": [
          [
            16,
            1
          ],
          [
            23,
            0
          ]
        ],
        "task": "Colorie « dit » en orange, puis « ! » en jaune.",
        "question": "Comment Lina montre-t-elle sa découverte ?",
        "options": [
          "Elle pose une question.",
          "Elle montre la croix avec enthousiasme.",
          "Elle refuse de parler.",
          "Elle raconte un souvenir."
        ],
        "correct": 1,
        "explanation": "Le verbe « dit » annonce ses paroles. Le point d’exclamation montre son enthousiasme.",
        "help": "Regarde le signe à la fin des paroles de Lina.",
        "title": "Mission 1 · Ponctuation",
        "proofQuotes": [
          "Lina dit : « Regarde cette croix rouge ! »"
        ]
      },
      {
        "id": "P2-01-02",
        "level": 1,
        "mode": "pilot",
        "kind": "temps",
        "range": [
          34,
          45
        ],
        "evidence": [
          [
            34,
            2
          ],
          [
            38,
            3
          ],
          [
            39,
            3
          ]
        ],
        "task": "Colorie « Hier » en bleu, puis « a caché » en violet.",
        "question": "Quand le pirate a-t-il caché le coffre ?",
        "options": [
          "La veille, avant que Lina ne trouve la carte.",
          "Demain, après la visite du musée.",
          "Au moment où Lina montre la carte à Tom.",
          "Le jour où Lina raconte l’histoire à sa classe."
        ],
        "correct": 0,
        "explanation": "« Hier » signifie que le pirate a caché le coffre la veille. C’est une action passée.",
        "help": "Cherche le mot qui indique un jour avant aujourd’hui.",
        "title": "Mission 2 · Temps",
        "proofQuotes": [
          "Hier, un pirate a caché un coffre sous le sable."
        ]
      },
      {
        "id": "P2-01-03",
        "level": 1,
        "mode": "pilot",
        "kind": "negation",
        "range": [
          46,
          52
        ],
        "evidence": [
          [
            47,
            4
          ],
          [
            49,
            4
          ],
          [
            48,
            3
          ]
        ],
        "task": "Colorie « ne » et « pas » en vert, puis « trouve » en violet.",
        "question": "Lina a-t-elle trouvé la clé à ce moment-là ?",
        "options": [
          "Oui, elle tient la clé.",
          "Non, elle ne l’a pas trouvée.",
          "Tom lui a donné la clé.",
          "La clé est dans la bouteille."
        ],
        "correct": 1,
        "explanation": "« Ne… pas » change le sens du verbe : Lina ne trouve pas la clé.",
        "help": "Observe les deux mots verts autour du verbe.",
        "title": "Mission 3 · Négation",
        "proofQuotes": [
          "Lina ne trouve pas la clé."
        ]
      },
      {
        "id": "P2-01-04",
        "level": 1,
        "mode": "pilot",
        "kind": "dialogue",
        "range": [
          95,
          117
        ],
        "evidence": [
          [
            96,
            1
          ],
          [
            108,
            1
          ],
          [
            105,
            0
          ]
        ],
        "task": "Colorie « demande » et « répond » en orange, puis « ? » en jaune.",
        "question": "Qui répond à la question de Tom ?",
        "options": [
          "Le pirate.",
          "Le gardien.",
          "Lina.",
          "Le narrateur."
        ],
        "correct": 2,
        "explanation": "Tom demande pourquoi les pirates gardaient des livres. Lina lui répond.",
        "help": "Le verbe « répond » se trouve juste après la question de Tom.",
        "title": "Mission 4 · Dialogue",
        "proofQuotes": [
          "Tom demande : « Pourquoi les pirates gardaient-ils des livres ? »",
          "Lina répond : « Ils voulaient retrouver leur chemin ! »"
        ]
      },
      {
        "id": "P2-01-05",
        "level": 1,
        "mode": "pilot",
        "kind": "verbe",
        "range": [
          64,
          70
        ],
        "evidence": [
          [
            67,
            3
          ]
        ],
        "task": "Colorie « ouvrent » en violet.",
        "question": "Si Lina ouvre le coffre toute seule, quelle phrase convient ?",
        "options": [
          "Lina ouvrent le coffre.",
          "Lina ouvrir le coffre.",
          "Lina ouvre le coffre.",
          "Lina ont ouvert le coffre."
        ],
        "correct": 2,
        "explanation": "Quand le sujet devient « Lina », le verbe au présent devient « ouvre ».",
        "help": "Il n’y a plus qu’une personne : Lina.",
        "title": "Mission 5 · Verbes",
        "proofQuotes": [
          "Les deux amis ouvrent le coffre."
        ]
      },
      {
        "id": "P2-01-06",
        "level": 1,
        "mode": "pilot",
        "kind": "ponctuation",
        "range": [
          95,
          106
        ],
        "evidence": [
          [
            96,
            1
          ],
          [
            97,
            0
          ],
          [
            105,
            0
          ]
        ],
        "task": "Colorie « demande » en orange, puis « : » et « ? » en jaune.",
        "question": "Pourquoi y a-t-il « : » puis « ? » ?",
        "options": [
          "Les deux signes indiquent la fin de l’histoire.",
          "« : » annonce les paroles et « ? » termine une question.",
          "« : » remplace le verbe et « ? » remplace Tom.",
          "Ces signes veulent dire la même chose."
        ],
        "correct": 1,
        "explanation": "Les deux-points annoncent les paroles de Tom. Le point d’interrogation termine sa question.",
        "help": "Le premier signe annonce les paroles. Le second termine une question.",
        "title": "Mission 6 · Ponctuation",
        "proofQuotes": [
          "Tom demande : « Pourquoi les pirates gardaient-ils des livres ? »"
        ]
      },
      {
        "id": "P2-01-07",
        "level": 1,
        "mode": "pilot",
        "kind": "temps",
        "range": [
          34,
          63
        ],
        "evidence": [
          [
            34,
            2
          ],
          [
            53,
            2
          ]
        ],
        "task": "Colorie « Hier » et « Soudain » en bleu.",
        "question": "Que se passe-t-il après les recherches de Lina ?",
        "options": [
          "Le pirate cache un autre coffre.",
          "Tom trouve la clé sous une pierre.",
          "Lina retourne à l’école.",
          "Les amis ferment le coffre."
        ],
        "correct": 1,
        "explanation": "« Soudain » annonce un nouvel événement : Tom soulève une pierre et découvre la clé.",
        "help": "Relis la phrase qui commence par « Soudain ».",
        "title": "Mission 7 · Temps",
        "proofQuotes": [
          "Soudain, Tom soulève une pierre et découvre la clé !"
        ]
      },
      {
        "id": "P2-01-08",
        "level": 1,
        "mode": "pilot",
        "kind": "negation",
        "range": [
          46,
          70
        ],
        "evidence": [
          [
            47,
            4
          ],
          [
            49,
            4
          ],
          [
            56,
            3
          ],
          [
            67,
            3
          ]
        ],
        "task": "Colorie « ne » et « pas » en vert, puis « soulève » et « ouvrent » en violet.",
        "question": "Pourquoi les deux amis peuvent-ils ensuite ouvrir le coffre ?",
        "options": [
          "Lina a perdu la carte.",
          "Tom découvre la clé en soulevant une pierre.",
          "Le pirate revient sur la plage.",
          "Le coffre était déjà ouvert."
        ],
        "correct": 1,
        "explanation": "Lina ne trouve pas la clé. Tom soulève une pierre et trouve la clé. Grâce à cette clé, ils peuvent ouvrir le coffre.",
        "help": "Cherche ce que Tom trouve après avoir soulevé la pierre.",
        "title": "Mission 8 · Négation",
        "proofQuotes": [
          "Soudain, Tom soulève une pierre et découvre la clé !",
          "Les deux amis ouvrent le coffre."
        ]
      },
      {
        "id": "P2-01-09",
        "level": 1,
        "mode": "pilot",
        "kind": "dialogue",
        "range": [
          84,
          117
        ],
        "evidence": [
          [
            90,
            3
          ],
          [
            108,
            1
          ]
        ],
        "task": "Colorie « contient » en violet, puis « répond » en orange.",
        "question": "Pourquoi les pirates gardaient-ils des livres ?",
        "options": [
          "Pour retrouver leur chemin grâce aux cartes marines.",
          "Pour réparer leurs bateaux.",
          "Pour apprendre à construire un coffre.",
          "Pour offrir leurs livres à Lina."
        ],
        "correct": 0,
        "explanation": "Tom ouvre un livre et découvre des cartes marines. Lina explique que les pirates voulaient retrouver leur chemin.",
        "help": "Regarde ce que Tom découvre dans le livre. À quoi servent ces cartes ?",
        "title": "Mission 9 · Dialogue",
        "proofQuotes": [
          "Tom ouvre un livre : il contient des cartes marines.",
          "Lina répond : « Ils voulaient retrouver leur chemin ! »"
        ]
      },
      {
        "id": "P2-01-10",
        "level": 1,
        "mode": "pilot",
        "kind": "verbe",
        "range": [
          64,
          83
        ],
        "evidence": [
          [
            67,
            3
          ],
          [
            77,
            3
          ]
        ],
        "task": "Colorie « ouvrent » et « contient » en violet.",
        "question": "Qui fait quoi dans ce passage ?",
        "options": [
          "Les amis ouvrent le coffre ; il contient des livres et une boussole.",
          "Tom ouvre seul le coffre et Lina emporte la boussole.",
          "Lina cache les livres pendant que Tom part.",
          "Les pirates ouvrent le coffre devant les deux amis."
        ],
        "correct": 0,
        "explanation": "Les deux amis ouvrent le coffre, puis ils découvrent des livres et une boussole à l’intérieur.",
        "help": "Trouve le sujet de « ouvrent », puis celui de « contient ».",
        "title": "Mission 10 · Verbes",
        "proofQuotes": [
          "Les deux amis ouvrent le coffre.",
          "À leur grande surprise, il contient des livres et une boussole."
        ]
      }
    ],
    "C3-01": [
      {
        "id": "P3-01-01",
        "level": 2,
        "mode": "pilot",
        "kind": "dialogue",
        "range": [
          95,
          117
        ],
        "evidence": [
          [
            96,
            1
          ],
          [
            108,
            1
          ],
          [
            105,
            0
          ]
        ],
        "task": "Colorie « demande » et « répond » en orange, puis « ? » en jaune.",
        "question": "Un message dit : « Lina pose la question et Tom répond. » Est-il exact ?",
        "options": [
          "Oui, Lina pose la question.",
          "Non. Tom pose la question et Lina répond.",
          "Non. Le gardien pose la question.",
          "Oui, les deux personnages répondent."
        ],
        "correct": 1,
        "explanation": "Le texte indique « Tom demande », puis « Lina répond ». Le message inverse leurs rôles.",
        "help": "Regarde le nom placé avant « demande » et « répond ».",
        "title": "Mission 1 · Dialogue",
        "proofQuotes": [
          "Tom demande : « Pourquoi les pirates gardaient-ils des livres ? »",
          "Lina répond : « Ils voulaient retrouver leur chemin ! »"
        ]
      },
      {
        "id": "P3-01-02",
        "level": 2,
        "mode": "pilot",
        "kind": "temps",
        "range": [
          118,
          150
        ],
        "evidence": [
          [
            118,
            2
          ],
          [
            141,
            2
          ],
          [
            122,
            3
          ],
          [
            144,
            3
          ]
        ],
        "task": "Colorie « Aujourd’hui » et « Demain » en bleu, puis « rapportent » et « racontera » en violet.",
        "question": "Quel ordre des événements respecte l’histoire ?",
        "options": [
          "Lina raconte d’abord ; ensuite les amis rapportent le trésor.",
          "Les amis rapportent le trésor au musée ; demain Lina racontera l’aventure.",
          "Tout se passe hier.",
          "Les enfants ne vont jamais au musée."
        ],
        "correct": 1,
        "explanation": "Aujourd’hui, les amis rapportent le trésor au musée. Demain, Lina racontera leur aventure.",
        "help": "Observe quel événement se passe aujourd’hui et lequel arrive demain.",
        "title": "Mission 2 · Temps",
        "proofQuotes": [
          "Aujourd’hui, les enfants rapportent le trésor au musée du port.",
          "Demain, Lina racontera cette aventure à sa classe."
        ]
      },
      {
        "id": "P3-01-03",
        "level": 2,
        "mode": "pilot",
        "kind": "negation",
        "range": [
          151,
          162
        ],
        "evidence": [
          [
            152,
            4
          ],
          [
            153,
            4
          ]
        ],
        "task": "Colorie « n’oubliera » et « jamais » en vert.",
        "question": "Quelle phrase garde exactement le même sens ?",
        "options": [
          "Elle oubliera bientôt le bruit des vagues.",
          "Elle ne pense plus aux vagues.",
          "Elle se souviendra toujours du bruit des vagues.",
          "Elle n’a jamais entendu les vagues."
        ],
        "correct": 2,
        "explanation": "« N’oubliera jamais » signifie qu’elle gardera toujours ce souvenir.",
        "help": "Si on n’oublie jamais quelque chose, on s’en souvient toujours.",
        "title": "Mission 3 · Négation",
        "proofQuotes": [
          "Elle n’oubliera jamais le bruit des vagues autour du vieux coffre."
        ]
      },
      {
        "id": "P3-01-04",
        "level": 2,
        "mode": "pilot",
        "kind": "temps",
        "range": [
          141,
          150
        ],
        "evidence": [
          [
            141,
            2
          ],
          [
            144,
            3
          ]
        ],
        "task": "Colorie « Demain » en bleu et « racontera » en violet.",
        "question": "Si Lina raconte l’aventure aujourd’hui, quelle phrase convient ?",
        "options": [
          "Aujourd’hui, Lina raconte cette aventure à sa classe.",
          "Aujourd’hui, Lina racontera cette aventure à sa classe.",
          "Hier, Lina raconte cette aventure à sa classe.",
          "Demain, Lina racontait cette aventure à sa classe."
        ],
        "correct": 0,
        "explanation": "Avec « aujourd’hui », on peut employer le présent « raconte » pour une action qui se déroule maintenant.",
        "help": "On remplace « Demain » par « Aujourd’hui ». Cherche aussi la forme du verbe.",
        "title": "Mission 4 · Temps",
        "proofQuotes": [
          "Demain, Lina racontera cette aventure à sa classe."
        ]
      },
      {
        "id": "P3-01-05",
        "level": 2,
        "mode": "pilot",
        "kind": "dialogue",
        "range": [
          107,
          117
        ],
        "evidence": [
          [
            108,
            1
          ],
          [
            110,
            1
          ],
          [
            117,
            1
          ],
          [
            116,
            0
          ]
        ],
        "task": "Colorie « répond » et les guillemets en orange, puis « ! » en jaune.",
        "question": "Quelle phrase présente correctement la réponse de Lina à Tom ?",
        "options": [
          "Lina répond ? « Ils voulaient retrouver leur chemin ! »",
          "Lina répond : Ils voulaient retrouver leur chemin ! »",
          "Lina répond : « Ils voulaient retrouver leur chemin ! »",
          "Lina répond ! « Ils voulaient retrouver leur chemin."
        ],
        "correct": 2,
        "explanation": "Les deux-points annoncent la réponse, les guillemets l’encadrent et le point d’exclamation marque le ton.",
        "help": "Vérifie les deux-points, les deux guillemets et le point d’exclamation.",
        "title": "Mission 5 · Dialogue",
        "proofQuotes": [
          "Lina répond : « Ils voulaient retrouver leur chemin ! »"
        ]
      },
      {
        "id": "P3-01-06",
        "level": 2,
        "mode": "pilot",
        "kind": "ponctuation",
        "range": [
          15,
          24
        ],
        "evidence": [
          [
            16,
            1
          ],
          [
            17,
            0
          ],
          [
            23,
            0
          ]
        ],
        "task": "Colorie « dit » en orange, puis « : » et « ! » en jaune.",
        "question": "Quelle phrase garde les bons signes quand Lina montre la croix rouge ?",
        "options": [
          "Lina dit ? « Regarde cette croix rouge ! »",
          "Lina dit : « Regarde cette croix rouge ! »",
          "Lina dit : « Regarde cette croix rouge ? »",
          "Lina dit ! Regarde cette croix rouge !"
        ],
        "correct": 1,
        "explanation": "« : » annonce ce que dit Lina. « ! » montre son enthousiasme. Les guillemets encadrent ses paroles.",
        "help": "Regarde les deux-points après « dit », puis le point d’exclamation.",
        "title": "Mission 6 · Ponctuation",
        "proofQuotes": [
          "Lina dit : « Regarde cette croix rouge ! »"
        ]
      },
      {
        "id": "P3-01-07",
        "level": 2,
        "mode": "pilot",
        "kind": "verbe",
        "range": [
          118,
          140
        ],
        "evidence": [
          [
            135,
            3
          ]
        ],
        "task": "Colorie « promet » en violet.",
        "question": "Si plusieurs gardiens protègent la carte, quelle phrase est correcte ?",
        "options": [
          "Les gardiens promet de protéger la carte.",
          "Les gardiens promettent de protéger la carte.",
          "Les gardiens promettra de protéger la carte.",
          "Les gardiens promettons de protéger la carte."
        ],
        "correct": 1,
        "explanation": "Avec « Les gardiens », le verbe se met au pluriel : « promettent ».",
        "help": "Le sujet « Les gardiens » désigne plusieurs personnes. Le verbe doit aussi changer.",
        "title": "Mission 7 · Verbes",
        "proofQuotes": [
          "Le gardien les remercie et promet de protéger la carte."
        ]
      },
      {
        "id": "P3-01-08",
        "level": 2,
        "mode": "pilot",
        "kind": "negation",
        "range": [
          151,
          162
        ],
        "evidence": [
          [
            152,
            4
          ],
          [
            153,
            4
          ]
        ],
        "task": "Colorie « n’oubliera » et « jamais » en vert.",
        "question": "Un copiste écrit : « Lina oubliera le bruit des vagues. » Quelle correction conserve le sens de l’histoire ?",
        "options": [
          "Lina gardera toujours en mémoire le bruit des vagues.",
          "Lina ne connaîtra jamais le bruit des vagues.",
          "Lina n’entendra plus jamais les vagues.",
          "Lina oubliera rapidement le bruit des vagues."
        ],
        "correct": 0,
        "explanation": "Le récit dit qu’elle n’oubliera jamais. Elle gardera donc ce souvenir.",
        "help": "Il faut garder l’idée d’un souvenir qui ne disparaît pas.",
        "title": "Mission 8 · Négation",
        "proofQuotes": [
          "Elle n’oubliera jamais le bruit des vagues autour du vieux coffre."
        ]
      },
      {
        "id": "P3-01-09",
        "level": 2,
        "mode": "pilot",
        "kind": "verbe",
        "range": [
          46,
          63
        ],
        "evidence": [
          [
            47,
            4
          ],
          [
            49,
            4
          ],
          [
            48,
            3
          ],
          [
            60,
            3
          ]
        ],
        "task": "Colorie « ne » et « pas » en vert, puis « trouve » et « découvre » en violet.",
        "question": "Un pirate affirme : « Lina a trouvé la clé avant Tom. » Est-ce vrai ?",
        "options": [
          "Oui, car Lina trouve la clé sous une pierre.",
          "Non, car Lina ne trouve pas la clé et Tom la découvre après.",
          "Non, car Tom trouve une deuxième carte à la place.",
          "Oui, car Lina donne la clé au pirate."
        ],
        "correct": 1,
        "explanation": "Le texte dit que Lina ne trouve pas la clé. Tom la découvre plus tard sous une pierre.",
        "help": "Compare les verbes « trouve » et « découvre », et regarde la négation.",
        "title": "Mission 9 · Verbes",
        "proofQuotes": [
          "Lina ne trouve pas la clé.",
          "Soudain, Tom soulève une pierre et découvre la clé !"
        ]
      },
      {
        "id": "P3-01-10",
        "level": 2,
        "mode": "pilot",
        "kind": "ponctuation",
        "range": [
          95,
          117
        ],
        "evidence": [
          [
            97,
            0
          ],
          [
            105,
            0
          ],
          [
            109,
            0
          ],
          [
            116,
            0
          ]
        ],
        "task": "Colorie les deux « : », le « ? » et le « ! » en jaune.",
        "question": "Quelle phrase explique correctement les signes utilisés ?",
        "options": [
          "Les deux « : » terminent les questions.",
          "« ? » termine la question de Tom et « ! » termine la réponse de Lina.",
          "Le point d’exclamation montre que Tom pose une question.",
          "Les guillemets servent à écrire les verbes au futur."
        ],
        "correct": 1,
        "explanation": "La question de Tom se termine par « ? ». La réponse de Lina se termine par « ! ».",
        "help": "Regarde le signe final dans chaque réplique.",
        "title": "Mission 10 · Ponctuation",
        "proofQuotes": [
          "Tom demande : « Pourquoi les pirates gardaient-ils des livres ? »",
          "Lina répond : « Ils voulaient retrouver leur chemin ! »"
        ]
      }
    ]
  }
};
const stories=window.CE2_CHALLENGES||[];
for(const [id,list] of Object.entries(PILOT.stories)){
 const story=stories.find(s=>s.id===id);
 if(!story)continue;
 for(const m of list){
   if(!Array.isArray(m.evidence)||!m.evidence.length||m.evidence.some(([i,c])=>!Number.isInteger(i)||i<m.range[0]||i>m.range[1]||i>=story.tokens.length||!Number.isInteger(c)||c<0||c>4))throw Error('Indice pilote invalide : '+m.id);
   if(new Set(m.evidence.map(e=>e[0])).size!==m.evidence.length||m.options.length!==4||new Set(m.options).size!==4||m.correct<0||m.correct>3)throw Error('Choix pilote invalide : '+m.id);
   m.answer=m.evidence.map(e=>e[0]);m.words=m.answer.map(i=>story.tokens[i]);
   if(!story.missions.some(existing=>existing.id===m.id))story.missions.push(m);
 }
}
window.CE2_CHALLENGE_PILOT=PILOT;
})();
