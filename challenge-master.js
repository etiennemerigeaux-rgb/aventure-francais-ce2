/* V82.5.72 : activités manipulables de Maître des mots, pilote Pirates. 
   Les dix missions existantes conservent leur position et leur identité pour les sauvegardes. */
(function(){
'use strict';
const activities=[
  {
    "title": "Remets le dialogue dans l’ordre",
    "kind": "order",
    "intro": "Tom a posé une question. Replace les trois actions dans l’ordre de l’histoire.",
    "items": [
      "Lina répond à Tom.",
      "Tom ouvre un livre de cartes marines.",
      "Tom demande pourquoi les pirates gardaient des livres."
    ],
    "solution": [
      1,
      2,
      0
    ],
    "help": "Tom regarde d’abord le livre. Ensuite il pose sa question.",
    "explanation": "Tom ouvre le livre, puis il demande pourquoi les pirates le gardaient. Enfin, Lina lui répond."
  },
  {
    "title": "Retrouve l’ordre des événements",
    "kind": "order",
    "intro": "Remets ces trois événements dans l’ordre.",
    "items": [
      "Demain, Lina raconte son aventure à sa classe.",
      "Le gardien remercie les enfants.",
      "Les enfants rapportent le trésor au musée."
    ],
    "solution": [
      2,
      1,
      0
    ],
    "help": "Les enfants arrivent au musée avant que le gardien les remercie. Lina parlera demain.",
    "explanation": "Les enfants apportent le trésor au musée. Le gardien les remercie. Le lendemain, Lina racontera l’histoire."
  },
  {
    "title": "Répare le sens de la phrase",
    "kind": "fill",
    "intro": "Le message a perdu deux mots. Complète-le pour garder le sens de l’histoire.",
    "slots": [
      {
        "before": "Lina ",
        "after": " le bruit des vagues.",
        "options": [
          "oubliera",
          "n’oubliera",
          "a oublié"
        ],
        "correct": 1
      },
      {
        "before": "Elle s’en souviendra ",
        "after": ".",
        "options": [
          "parfois",
          "hier",
          "toujours"
        ],
        "correct": 2
      }
    ],
    "help": "Dans l’histoire, Lina « n’oubliera jamais » le bruit des vagues.",
    "explanation": "« N’oubliera jamais » veut dire qu’elle gardera toujours ce souvenir."
  },
  {
    "title": "Répare deux phrases sur le temps",
    "kind": "fill",
    "intro": "Les verbes de ces deux phrases ne vont pas avec les mots de temps. Corrige-les.",
    "slots": [
      {
        "before": "Aujourd’hui, Lina ",
        "after": " son aventure à sa classe.",
        "options": [
          "racontera",
          "raconte",
          "racontait"
        ],
        "correct": 1
      },
      {
        "before": "Demain, Lina ",
        "after": " son aventure à sa classe.",
        "options": [
          "raconte",
          "racontait",
          "racontera"
        ],
        "correct": 2
      }
    ],
    "help": "« Aujourd’hui » va avec le présent. « Demain » va avec le futur.",
    "explanation": "Avec « aujourd’hui », on peut écrire « raconte ». Avec « demain », on écrit « racontera »."
  },
  {
    "title": "Reconstruis la réponse de Lina",
    "kind": "order",
    "intro": "Les morceaux de la réponse sont mélangés. Replace-les pour reconstruire le dialogue.",
    "items": [
      "« Ils voulaient retrouver leur chemin ! »",
      "Lina répond",
      ":"
    ],
    "solution": [
      1,
      2,
      0
    ],
    "help": "Commence par les mots « Lina répond ». Les deux-points annoncent les paroles.",
    "explanation": "On écrit : Lina répond : « Ils voulaient retrouver leur chemin ! »"
  },
  {
    "title": "Reconstruis la phrase de Lina",
    "kind": "order",
    "intro": "Remets ces morceaux dans l’ordre pour raconter la découverte.",
    "items": [
      "« Regarde cette croix rouge ! »",
      ":",
      "Lina dit"
    ],
    "solution": [
      2,
      1,
      0
    ],
    "help": "On commence par « Lina dit ». Les deux-points annoncent ses paroles.",
    "explanation": "On écrit : Lina dit : « Regarde cette croix rouge ! »"
  },
  {
    "title": "Corrige les verbes",
    "kind": "fill",
    "intro": "Deux erreurs se sont glissées dans le récit. Choisis la bonne forme de chaque verbe.",
    "slots": [
      {
        "before": "Les enfants ",
        "after": " le trésor au musée.",
        "options": [
          "rapporte",
          "rapportent",
          "rapportera"
        ],
        "correct": 1
      },
      {
        "before": "Le gardien ",
        "after": " de protéger la carte.",
        "options": [
          "promettent",
          "promettons",
          "promet"
        ],
        "correct": 2
      }
    ],
    "help": "« Les enfants » est au pluriel. « Le gardien » désigne une seule personne.",
    "explanation": "Les enfants rapportent le trésor. Le gardien promet de protéger la carte."
  },
  {
    "title": "Retrouve le vrai souvenir",
    "kind": "fill",
    "intro": "Un pirate a changé deux mots. Répare les phrases pour garder le sens de l’histoire.",
    "slots": [
      {
        "before": "Lina ",
        "after": " le bruit des vagues.",
        "options": [
          "oubliera vite",
          "n’oubliera jamais",
          "n’a jamais entendu"
        ],
        "correct": 1
      },
      {
        "before": "Elle gardera ce souvenir ",
        "after": ".",
        "options": [
          "toujours",
          "jusqu’à demain",
          "seulement ce soir"
        ],
        "correct": 0
      }
    ],
    "help": "L’histoire dit que Lina « n’oubliera jamais » le bruit des vagues.",
    "explanation": "Lina n’oubliera jamais les vagues : elle gardera toujours ce souvenir."
  },
  {
    "title": "Démasque les deux erreurs",
    "kind": "fill",
    "intro": "Ce message raconte deux choses fausses. Choisis les mots qui réparent le récit.",
    "slots": [
      {
        "before": "Lina ",
        "after": " la clé.",
        "options": [
          "trouve",
          "ne trouve pas",
          "donne"
        ],
        "correct": 1
      },
      {
        "before": "Tom ",
        "after": " la clé sous une pierre.",
        "options": [
          "cache",
          "perd",
          "découvre"
        ],
        "correct": 2
      }
    ],
    "help": "Lina cherche la clé mais ne la trouve pas. C’est Tom qui la découvre.",
    "explanation": "Lina ne trouve pas la clé. Tom la découvre ensuite sous une pierre."
  },
  {
    "title": "Rétablis l’histoire entière",
    "kind": "final",
    "intro": "Dernière mission ! Répare le récit en trois petites étapes. Prends ton temps.",
    "sections": [
      {
        "kind": "order",
        "intro": "1 sur 3 · Remets les événements dans l’ordre.",
        "items": [
          "Tom trouve la clé.",
          "Les deux amis ouvrent le coffre.",
          "Lina ne trouve pas la clé."
        ],
        "solution": [
          2,
          0,
          1
        ],
        "help": "Lina cherche d’abord. Tom trouve ensuite la clé, puis le coffre s’ouvre."
      },
      {
        "kind": "fill",
        "intro": "2 sur 3 · Répare deux phrases.",
        "slots": [
          {
            "before": "Tom ",
            "after": " : « Pourquoi les pirates gardaient-ils des livres ? »",
            "options": [
              "répond",
              "demande",
              "crie"
            ],
            "correct": 1
          },
          {
            "before": "Lina ",
            "after": " : « Ils voulaient retrouver leur chemin ! »",
            "options": [
              "demande",
              "cherche",
              "répond"
            ],
            "correct": 2
          }
        ],
        "help": "Tom pose une question. Lina lui donne une réponse."
      },
      {
        "kind": "match",
        "intro": "3 sur 3 · Associe chaque signe à son rôle.",
        "left": [
          "Les deux-points « : »",
          "Le point d’interrogation « ? »",
          "Le point d’exclamation « ! »"
        ],
        "right": [
          "Termine la question de Tom.",
          "Annonce les paroles.",
          "Termine la réponse de Lina."
        ],
        "solution": [
          1,
          0,
          2
        ],
        "help": "« : » annonce les paroles, « ? » termine une question et « ! » termine une phrase expressive."
      }
    ],
    "help": "Relis les événements, puis la question de Tom et la réponse de Lina.",
    "explanation": "Lina ne trouve pas la clé. Tom la découvre, puis ils ouvrent le coffre. Tom demande pourquoi les pirates avaient des livres, Lina répond. La ponctuation montre qui parle et comment."
  }
];
const story=(window.CE2_CHALLENGES||[]).find(s=>s.id==='C3-01');
if(!story||!window.CE2_CHALLENGE_PILOT)throw Error('Pilote Maître : les données des pirates sont absentes.');
const missions=story.missions.filter(m=>m.mode==='pilot');
if(missions.length!==10)throw Error('Pilote Maître : il faut dix missions.');
missions.forEach((m,i)=>{
 if(m.id!=='P3-01-'+String(i+1).padStart(2,'0'))throw Error('Ordre des missions Maître modifié.');
 m.activity=activities[i];
 m.question=activities[i].title;
 m.help=activities[i].help;
 m.explanation=activities[i].explanation;
});
window.CE2_CHALLENGE_MASTER=Object.freeze({version:1,activities});
})();