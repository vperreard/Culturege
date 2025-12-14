# /generate - Pipeline complet de génération

Lance le pipeline multi-agents complet pour créer une fiche pédagogique et des questions QCM.

## Instructions

1. Lis le fichier `.claude/agents/full-pipeline.md` pour comprendre le processus
2. Exécute chaque agent dans l'ordre :
   - 🔍 Chercheur (`.claude/agents/researcher.md`)
   - 🖼️ Curateur Images (`.claude/agents/image-curator.md`)
   - 📊 Diagrammeur (`.claude/agents/diagrammer.md`)
   - 📝 Rédacteur Fiche (`.claude/agents/fiche-writer.md`)
   - ❓ Générateur QCM (`.claude/agents/qcm-generator.md`)
3. Assemble le fichier final dans `workspace/output/`

## Sujet demandé

$ARGUMENTS

## Action

Démarre le pipeline maintenant. Affiche la progression de chaque étape.
