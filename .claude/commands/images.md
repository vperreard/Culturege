# /images - Agent Curateur d'Images

Lance l'agent Curateur d'Images pour trouver et vérifier des illustrations.

## Instructions

1. Lis le fichier `.claude/agents/image-curator.md`
2. Charge le fichier research le plus récent de `workspace/research/`
3. Recherche des images pour chaque élément suggéré
4. **VÉRIFIE CHAQUE URL** avec `curl -I`
5. Sauvegarde dans `workspace/images/`

## Arguments (optionnel)

$ARGUMENTS

Si vide, utilise le dernier fichier research disponible.

## Action

Exécute la curation d'images maintenant. N'oublie pas de vérifier les URLs !
