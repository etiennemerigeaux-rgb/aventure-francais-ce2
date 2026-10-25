# Audit et correctifs V82.5.63 — La Grande Aventure du français CE2

Date : 25 octobre 2026

## Périmètre et principe de publication

Cette version est enregistrée **uniquement sur la branche** `audit-correctifs-v82-5-63`.
La branche `main` (V82.5.62) est conservée jusqu'à validation fonctionnelle et pédagogique.
Les anciennes branches de sauvegarde restent accessibles. Aucune synchronisation automatique des
profils entre appareils n'est prévue : le stockage demeure local au navigateur.

## Correctifs techniques intégrés

1. **Reprise sécurisée** : `recovery.js` vérifie la version de banque, les dix indices
   uniques, les limites de progression, le score, les réponses et l'identifiant de partie.
   La sauvegarde est actualisée lors d'une réponse, d'un essai assisté et d'un changement
   de question. Le bouton « Reprendre mon aventure » utilise le même contrôle que la carte.
2. **Compatibilité** : une partie ancienne incompatible recommence au lieu de présenter
   des questions modifiées avec d'anciennes réponses. L'historique des parties terminées,
   les pièces accumulées et les récompenses sont conservés.
3. **Ancien invité** : lorsqu'aucun profil enfant n'existe encore, récupération prudente
   du profil invité et, si elle existe, de sa progression Challenge, tout en conservant les
   clés locales d'origine. L'import JSON accepte également une sauvegarde d'invité.
4. **Pièces** : l'écran du coffre affiche les pièces réellement gagnées dans la partie,
   y compris les réussites assistées (3 pièces sans aide, 1 après reprise), indépendamment
   du score sans aide.
5. **PWA** : préchargement strict des ressources indispensables ; les images
   facultatives sont téléchargées séparément afin qu'une image inaccessible ne bloque
   pas l'installation du cache.
6. **Pédagogie** : les étiquettes de démarche des questions remaniées reflètent davantage
   leurs consignes, et les anciennes questions de la Cité des dialogues sont classées,
   sans changer leurs réponses.

## Vérifications automatisées

À lancer dans le dépôt avec Node.js, sans dépendances additionnelles :

```bash
node tests/pedagogie.test.cjs
node tests/audit-application.test.cjs
```

| Point contrôlé | Résultat dans les essais automatisés |
|---|---|
| Cinq mondes, 100 questions chacun | Conforme |
| Dix questions distinctes par partie | Conforme |
| Couverture de 100 questions sur dix tirages | Conforme |
| 200 tirages par monde (1 000 parties fictives) | Conforme |
| Sauvegarde, rejet d'ancienne version, récupération de l'état | Conforme |
| Réponse correcte, erreur, reprise assistée, pièces | Conforme |
| Coffre final et absence de double comptage | Conforme |
| Banque d'évaluation séparée de 500 questions | Conforme structurellement |
| 200 évaluations simulées (25 questions, cinq par monde) | Conforme |
| Seuil d'évaluation pour débloquer le Challenge | Conforme |
| 30 histoires Challenge, trois niveaux, 1 151 missions existantes | Conforme structurellement |
| Déblocage des niveaux Challenge | Conforme |
| Scripts chargés dans le bon ordre et cache PWA déclaré | Conforme statiquement |

Les simulations testent la logique JavaScript et les banques, **pas un navigateur Android réel**.
Les bonnes réponses et explications n'ont pas toutes été relues par un enseignant.

## Tests fonctionnels restant à effectuer avant fusion dans main

- [ ] Chrome Android : créer deux profils, sélectionner un héros, changer d'enfant.
- [ ] Fermer complètement le navigateur après la 3e ou 4e question, puis reprendre sans perdre
      le choix, l'ordre, le score ni les pièces.
- [ ] Quitter le monde depuis la carte, jouer dans un autre, puis reprendre chaque partie.
- [ ] Répondre faux puis juste après aide : vérifier la voix, le score sans aide et le nombre
      de pièces du coffre.
- [ ] Finir les dix questions des cinq mondes : résultat, récompense et retour à la carte.
- [ ] Terminer une évaluation puis vérifier l'historique et le seuil d'accès au Challenge.
- [ ] Valider un Challenge à chacun des trois niveaux, reprendre une histoire interrompue.
- [ ] Exporter les profils dans un fichier JSON ; importer dans un navigateur de test sans
      écraser les enfants existants, puis vérifier l'historique Challenge.
- [ ] Installer en PWA sur Chrome Android et sur PC ; vérifier démarrage et jeu hors connexion.
- [ ] Inspecter écrans étroits (320, 360, 390 px), défilement, flèches et orientation paysage.
- [ ] Contrôler la justesse linguistique, le niveau CE2 et les explications de chaque banque
      de questions (dont les 500 questions d'évaluation séparées).

## Limites pédagogiques mises en évidence

Les règles de tirage garantissent des familles thématiques et non dix démarches intellectuelles
différentes. La banque « Lunettes magiques » comporte encore un nombre important de questions
d'identification. Les métadonnées des 500 questions d'évaluation n'indiquent pas de démarche
pédagogique détaillée. Un audit linguistique et pédagogique humain reste indispensable.

**Décision de livraison :** correctifs préparés et tests automatisés passés ;
ne pas fusionner sur `main` avant validation réelle sur les appareils.
