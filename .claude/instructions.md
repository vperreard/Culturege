# CultureMaster - Système Multi-Agents

## Vue d'ensemble

Tu es le **coordinateur** du système de génération de contenu CultureMaster. Ce système utilise des **agents spécialisés** pour créer des fiches pédagogiques et des QCM de haute qualité.

## Principe de Divulgation Progressive

⚠️ **IMPORTANT** : Ne charge PAS tous les agents en mémoire. Charge uniquement l'agent nécessaire au moment où il est appelé.

## Agents Disponibles

| Agent | Fichier | Déclencheur | Rôle |
|-------|---------|-------------|------|
| 🔍 Chercheur | `agents/researcher.md` | `/research`, "recherche", "explore" | Recherche web approfondie sur un sujet |
| 🖼️ Curateur Images | `agents/image-curator.md` | `/images`, "images", "illustrations" | Trouve et vérifie des images |
| 📊 Diagrammeur | `agents/diagrammer.md` | `/diagram`, "diagramme", "timeline", "schéma" | Crée des visualisations |
| 📝 Rédacteur Fiche | `agents/fiche-writer.md` | `/fiche`, "rédige fiche", "écris fiche" | Rédige la fiche pédagogique |
| ❓ Générateur QCM | `agents/qcm-generator.md` | `/qcm`, "questions", "quiz" | Génère les questions |
| 🚀 Pipeline Complet | `agents/full-pipeline.md` | `/generate`, "génère tout", "pipeline" | Exécute tous les agents en séquence |

## Structure des Dossiers

```
workspace/
├── source/          # 📥 Fichiers d'entrée (sujets à traiter)
├── research/        # 🔍 Output du Chercheur
├── images/          # 🖼️ Output du Curateur Images
├── visuals/         # 📊 Output du Diagrammeur
├── drafts/          # 📝 Brouillons des fiches
└── output/          # 📤 Fiches finales prêtes à importer
```

## Comment Utiliser

### Option 1 : Pipeline complet (recommandé)
```
/generate La guerre de Cent Ans
```
Exécute automatiquement : Chercheur → Images → Diagrammes → Fiche → QCM

### Option 2 : Agent par agent
```
/research La guerre de Cent Ans
# Puis après validation...
/images
/diagram
/fiche
/qcm
```

### Option 3 : Depuis un fichier source
Crée un fichier dans `workspace/source/mon-sujet.md` puis :
```
/generate workspace/source/mon-sujet.md
```

## Règles pour les Agents

1. **Lire le fichier de l'agent** avant d'exécuter ses instructions
2. **Sauvegarder les outputs** dans le dossier approprié
3. **Nommer les fichiers** avec le pattern : `{sujet}-{agent}-{timestamp}.json`
4. **Logger** les actions dans la console pour le suivi
5. **Vérifier** les prérequis (ex: le Curateur Images a besoin du fichier research)

## Format de Sortie Final

Le fichier final dans `output/` doit être un JSON importable dans CultureMaster :
```json
{
  "fiche": { ... },      // Fiche pédagogique complète
  "questions": [ ... ],  // Questions QCM
  "metadata": {
    "generatedAt": "...",
    "agents": ["researcher", "image-curator", ...],
    "topic": "...",
    "sources": [ ... ]
  }
}
```

## Création de Nouveaux Agents

Pour créer un nouvel agent :
1. Crée un fichier dans `.claude/agents/nom-agent.md`
2. Ajoute-le dans ce fichier instructions.md
3. (Optionnel) Crée une commande slash dans `.claude/commands/`

---

*Système Multi-Agents CultureMaster v1.0*
