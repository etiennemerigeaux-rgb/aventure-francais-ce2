# Révision pédagogique CE2 — V82.5.54

## Sources de référence
- Programme de français du cycle 2 publié au BO du 31 octobre 2024, applicable depuis la rentrée 2025.
  https://www.education.gouv.fr/bo/2024/Hebdo41/MENE2415135A
- Ressources Éduscol d'accompagnement, mises à jour en juillet 2026.
  https://eduscol.education.gouv.fr/4740/ressources-d-accompagnement-du-programme-de-francais-au-cycle-2
- Repères CE2 de septembre 2025 : identification du verbe, du sujet, conjugaison, orthographe grammaticale, compréhension.
  https://eduscol.education.fr/document/66858/download

## Périmètre
L'application reste un jeu **ciblé** sur cinq domaines : ponctuation, dialogues, repères temporels, verbes et négation. Elle n'est pas présentée comme couvrant à elle seule l'ensemble du programme de français CE2 (lecture, rédaction, vocabulaire, orthographe lexicale, classes grammaticales, accords dans le groupe nominal et conjugaison de tous les verbes du programme).

## Corrections
1. **Dialogue** : 20 formulations d'incises réécrites en discours direct grammatical, guillemets imbriqués corrigés, 20 situations d'entraînement plus exigeantes ajoutées en remplaçant autant de questions existantes ; positions et identifiants conservés pour les anciens progrès.
2. **Distracteurs temporels** : 30 QCM d'entraînement disposent de propositions temporelles comparables au lieu de réponses redondantes du type « Le prénom de la personne ». La consigne précise de rechercher l'expression dans la phrase.
3. **Évaluations indépendantes** : 500 nouveaux QCM (100 par monde, aucune question exactement identique au réservoir d'entraînement), produits de façon reproductible par `scripts/build-exam-bank.cjs`. Pour chaque monde : 40 questions faciles, 40 intermédiaires et 20 plus exigeantes. Les cinq compétences de dialogue restent équilibrées. L'évaluation actuelle sur 25 questions conserve ses règles et la notation sur 20.
4. **Progression des mondes** : chaque cycle de 100 questions entraîne d'abord sur les notions faciles, puis intermédiaires, puis difficiles, sans réutiliser un identifiant pendant le cycle. La Cité des dialogues conserve deux questions de chacune des cinq compétences par partie. Il s'agit d'une gradation des sessions, **pas encore d'un moteur adaptatif fondé sur les erreurs**.
5. **Challenge** : 30 textes, au moins deux missions disponibles pour chacune des cinq compétences par texte, 1 151 missions au total. Les explications des signes de ponctuation et des guillemets précisent désormais leur fonction. Les plages de longueur affichées sont corrigées : Explorateur 55–65 mots, Expert 90–105 mots, Maître 120–145 mots.
6. **Tests** : `tests/pedagogy.test.cjs` et tests historiques contrôlent l'intégrité des questions, les réponses, l'absence de recouvrement entre entraînement et évaluation, le tirage sans répétition, la progression et l'équilibre du Challenge.

## Respect des sauvegardes
- Aucun identifiant de monde ni identifiant de question d'entraînement n'a changé.
- Aucun profil, coffre, récompense, résultat historique ni fichier de sauvegarde n'a été effacé.
- Une **évaluation déjà commencée** continue à utiliser les questions mémorisées dans sa session ; les **nouvelles évaluations** utilisent la nouvelle banque.

## Limites à examiner pédagogiquement
Les 500 nouvelles questions sont rédigées sur des scénarios générés et validées par des tests de structure, mais une relecture humaine par un enseignant CE2 reste conseillée. Les cinq mondes demeurent centrés sur les mêmes compétences et ne constituent pas un programme de français exhaustif. Une évaluation formative à choix multiples ne remplace pas une évaluation de l'écriture autonome et de la lecture à voix haute.

## Complément V82.5.55 — Diversité du raisonnement (24 octobre 2026)

Retour d'essai : dans « Machine du temps » et « Détective des verbes », dix questions différentes pouvaient rester dix fois le même raisonnement (présent/futur, sujet/verbe). Une banque plus vaste sans contrôle de variété ne résolvait pas ce problème.

- Ces **deux mondes** comportent désormais dix familles de questions (deux définitions, deux identifications, deux applications, deux corrections, une comparaison, un raisonnement) pour chaque groupe de dix, sans répéter un type de raisonnement deux fois de suite.
- Les **100 questions de chaque monde ont été entièrement réécrites** avec contextes plus riches, tout en conservant les **mêmes IDs et indices** dans le tableau : les anciennes progressions et récompenses restent reliées aux mêmes mondes.
- La difficulté progresse par groupes : 3 aventures de consolidation, 4 intermédiaires, 3 exigeantes. **Cette progression n'est pas encore adaptative** : une révision en fonction des erreurs réelles devra être établie après des essais pédagogiques.
- « La Cité des dialogues » ajoute **20 questions fondées sur une définition ou un rôle grammatical**, réparties à raison de deux par aventure. Elle conserve ses cinq compétences et deux questions par compétence.
- Tests : `tests/question-diversity.test.cjs` simule **1 200 aventures** dans les deux mondes restructurés, ainsi que dix aventures Dialogue, avec vérification des doublons, de la composition pédagogique, des sauvegardes et du niveau de difficulté.
- Le système existant de **réessai et d'explications après erreur** est maintenu. Les trois autres mondes ne reçoivent pas encore ce contrôleur complet dans cette version ; ils seront analysés séparément au fil des essais.
