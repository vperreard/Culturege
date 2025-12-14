# 🚀 Agent Pipeline Complet (Full Pipeline)

## Mission
Orchestrer l'exécution séquentielle de tous les agents pour générer un contenu complet (fiche + QCM + images vérifiées) en une seule commande.

## Utilisation

```
/generate La guerre de Cent Ans
/generate workspace/source/mon-sujet.md
/generate "Les cépages de Bourgogne" --category=oenologie --difficulty=2 --questions=15
```

## Paramètres Optionnels

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| `--category` | auto-détecté | histoire, sciences, geographie, arts, politique, oenologie, sport, nature |
| `--difficulty` | 2 | 1 (facile), 2 (moyen), 3 (difficile) |
| `--questions` | 10 | Nombre de questions QCM à générer |
| `--skip-images` | false | Sauter la curation d'images |
| `--skip-diagrams` | false | Sauter la création de diagrammes |

## Pipeline d'Exécution

```
┌─────────────────────────────────────────────────────────────┐
│                    🚀 PIPELINE COMPLET                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📥 INPUT: "La guerre de Cent Ans"                          │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────────────────────┐                    │
│  │  ÉTAPE 1: 🔍 CHERCHEUR              │                    │
│  │  Durée estimée: 30-60s              │                    │
│  │  Output: research/{sujet}-research.json                  │
│  └──────────────┬──────────────────────┘                    │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────┐                    │
│  │  ÉTAPE 2: 🖼️ CURATEUR IMAGES        │                    │
│  │  Durée estimée: 20-40s              │                    │
│  │  Output: images/{sujet}-images.json │                    │
│  │  (skip si --skip-images)            │                    │
│  └──────────────┬──────────────────────┘                    │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────┐                    │
│  │  ÉTAPE 3: 📊 DIAGRAMMEUR            │                    │
│  │  Durée estimée: 15-30s              │                    │
│  │  Output: visuals/{sujet}-visuals.json                    │
│  │  (skip si --skip-diagrams)          │                    │
│  └──────────────┬──────────────────────┘                    │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────┐                    │
│  │  ÉTAPE 4: 📝 RÉDACTEUR FICHE        │                    │
│  │  Durée estimée: 20-40s              │                    │
│  │  Output: drafts/{sujet}-fiche.json  │                    │
│  └──────────────┬──────────────────────┘                    │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────┐                    │
│  │  ÉTAPE 5: ❓ GÉNÉRATEUR QCM         │                    │
│  │  Durée estimée: 15-30s              │                    │
│  │  Output: drafts/{sujet}-qcm.json    │                    │
│  └──────────────┬──────────────────────┘                    │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────┐                    │
│  │  ÉTAPE 6: 📦 ASSEMBLAGE FINAL       │                    │
│  │  Combine fiche + questions          │                    │
│  │  Output: output/{sujet}-final.json  │                    │
│  └──────────────┬──────────────────────┘                    │
│                 │                                            │
│                 ▼                                            │
│  📤 OUTPUT: Fichier prêt à importer dans CultureMaster      │
│                                                              │
│  ⏱️ Durée totale estimée: 2-4 minutes                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Process Détaillé

### Pré-exécution
1. Parser les arguments (sujet, options)
2. Générer un slug pour le sujet (ex: "guerre-cent-ans")
3. Créer un timestamp pour les fichiers
4. Vérifier que les dossiers workspace existent

### Exécution

```
📍 Démarrage du pipeline pour: "La guerre de Cent Ans"
   Slug: guerre-cent-ans
   Timestamp: 20241214-153042
   Options: category=histoire, difficulty=2, questions=10

═══════════════════════════════════════════════════════════════

🔍 ÉTAPE 1/6 : Agent Chercheur
   ├─ Lecture de: .claude/agents/researcher.md
   ├─ Exécution des recherches web...
   ├─ Structuration des données...
   └─ ✅ Sauvegardé: workspace/research/guerre-cent-ans-research-20241214.json
   ⏱️ Durée: 45s

───────────────────────────────────────────────────────────────

🖼️ ÉTAPE 2/6 : Agent Curateur Images
   ├─ Lecture de: .claude/agents/image-curator.md
   ├─ Recherche d'images...
   ├─ Vérification des URLs (curl)...
   │   ├─ img-001: ✅ 200
   │   ├─ img-002: ✅ 200
   │   ├─ img-003: ❌ 404 → alternative trouvée ✅
   │   └─ img-004: ✅ 200
   └─ ✅ Sauvegardé: workspace/images/guerre-cent-ans-images-20241214.json
   ⏱️ Durée: 32s

───────────────────────────────────────────────────────────────

📊 ÉTAPE 3/6 : Agent Diagrammeur
   ├─ Lecture de: .claude/agents/diagrammer.md
   ├─ Création timeline...
   ├─ Création comparaison...
   ├─ Création diagramme...
   └─ ✅ Sauvegardé: workspace/visuals/guerre-cent-ans-visuals-20241214.json
   ⏱️ Durée: 22s

───────────────────────────────────────────────────────────────

📝 ÉTAPE 4/6 : Agent Rédacteur Fiche
   ├─ Lecture de: .claude/agents/fiche-writer.md
   ├─ Chargement research + images + visuals...
   ├─ Planification des sections...
   ├─ Rédaction...
   └─ ✅ Sauvegardé: workspace/drafts/guerre-cent-ans-fiche-20241214.json
   ⏱️ Durée: 38s

───────────────────────────────────────────────────────────────

❓ ÉTAPE 5/6 : Agent Générateur QCM
   ├─ Lecture de: .claude/agents/qcm-generator.md
   ├─ Analyse du contenu...
   ├─ Génération de 10 questions...
   └─ ✅ Sauvegardé: workspace/drafts/guerre-cent-ans-qcm-20241214.json
   ⏱️ Durée: 25s

───────────────────────────────────────────────────────────────

📦 ÉTAPE 6/6 : Assemblage Final
   ├─ Fusion fiche + questions...
   ├─ Ajout métadonnées...
   ├─ Validation JSON...
   └─ ✅ Sauvegardé: workspace/output/guerre-cent-ans-final-20241214.json
   ⏱️ Durée: 2s

═══════════════════════════════════════════════════════════════

✅ PIPELINE TERMINÉ !

📊 Résumé:
   ├─ Sujet: La guerre de Cent Ans
   ├─ Catégorie: Histoire > Moyen Âge
   ├─ Durée totale: 2m 44s
   ├─ Fichiers générés: 6
   └─ Fichier final: workspace/output/guerre-cent-ans-final-20241214.json

📄 Contenu généré:
   ├─ Fiche: 10 sections, 18 min de lecture
   ├─ Questions: 10 (3 faciles, 5 moyennes, 2 difficiles)
   ├─ Images: 6 vérifiées ✅
   ├─ Visualisations: 4 (1 timeline, 1 comparison, 2 diagrams)
   └─ Sources: 8 références

🔗 Pour importer dans CultureMaster:
   1. Ouvrez l'app CultureMaster
   2. Allez dans Paramètres > Importer
   3. Sélectionnez: workspace/output/guerre-cent-ans-final-20241214.json

   Ou copiez le contenu dans le fichier src/data/
```

### Post-exécution : Assemblage Final

Le fichier final combine tout :

```json
{
  "fiche": {
    "id": "f-guerre-cent-ans-20241214",
    "categoryId": "histoire",
    "subcategoryId": "moyen-age",
    "title": "La Guerre de Cent Ans",
    "subtitle": "1337-1453 : Le conflit qui a façonné la France",
    // ... toute la fiche
  },

  "questions": [
    // ... toutes les questions QCM
  ],

  "metadata": {
    "generatedAt": "2024-12-14T15:30:42Z",
    "generatedBy": "CultureMaster Multi-Agent Pipeline v1.0",
    "topic": "La guerre de Cent Ans",
    "slug": "guerre-cent-ans",
    "pipeline": {
      "duration": 164,
      "agents": ["researcher", "image-curator", "diagrammer", "fiche-writer", "qcm-generator"],
      "files": {
        "research": "workspace/research/guerre-cent-ans-research-20241214.json",
        "images": "workspace/images/guerre-cent-ans-images-20241214.json",
        "visuals": "workspace/visuals/guerre-cent-ans-visuals-20241214.json",
        "fiche": "workspace/drafts/guerre-cent-ans-fiche-20241214.json",
        "qcm": "workspace/drafts/guerre-cent-ans-qcm-20241214.json"
      }
    },
    "statistics": {
      "sections": 10,
      "questions": 10,
      "images": 6,
      "visuals": 4,
      "sources": 8,
      "readingTime": 18
    },
    "sources": [
      // Liste des sources utilisées
    ]
  }
}
```

## Gestion des Erreurs

Si une étape échoue :
1. Logger l'erreur avec détails
2. Tenter une fois de réexécuter l'étape
3. Si échec persistant, continuer avec les étapes suivantes si possible
4. Signaler les étapes manquantes dans le fichier final

```
⚠️ Erreur à l'étape 2 (Curateur Images):
   Erreur: Network timeout
   Tentative 2/2...
   ❌ Échec persistant
   → Continuation sans images (--skip-images implicite)
```

## Critères de Succès

- [ ] Toutes les étapes exécutées (ou skippées explicitement)
- [ ] Fichier final valide et complet
- [ ] Au moins la fiche et les QCM générés
- [ ] Métadonnées complètes
- [ ] Temps total < 5 minutes
