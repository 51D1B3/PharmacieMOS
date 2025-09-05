#!/bin/bash

# Script de sauvegarde automatique MongoDB
# Usage: ./backup.sh [database_name] [backup_path]

set -e

# Configuration par défaut
DB_NAME=${1:-PhacieDB}
BACKUP_PATH=${2:-/backups}
MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017}
RETENTION_DAYS=${RETENTION_DAYS:-30}
COMPRESS=${COMPRESS:-true}

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_PATH"

# Nom du fichier de sauvegarde avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_PATH/${DB_NAME}_${TIMESTAMP}"

echo "🔄 Début de la sauvegarde de la base de données $DB_NAME..."

# Fonction de nettoyage en cas d'erreur
cleanup() {
    echo "❌ Erreur lors de la sauvegarde"
    if [ -f "${BACKUP_FILE}.gz" ]; then
        rm -f "${BACKUP_FILE}.gz"
    fi
    if [ -f "${BACKUP_FILE}" ]; then
        rm -f "${BACKUP_FILE}"
    fi
    exit 1
}

# Capturer les erreurs
trap cleanup ERR

# Effectuer la sauvegarde
if [ "$COMPRESS" = "true" ]; then
    echo "📦 Sauvegarde avec compression..."
    mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --archive="${BACKUP_FILE}.gz" --gzip
    BACKUP_FILE="${BACKUP_FILE}.gz"
else
    echo "📦 Sauvegarde sans compression..."
    mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --out="${BACKUP_FILE}"
fi

# Vérifier que la sauvegarde a réussi
if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde réussie: $BACKUP_FILE"
    
    # Calculer la taille du fichier
    if [ "$COMPRESS" = "true" ]; then
        SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    else
        SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
    fi
    
    echo "📊 Taille de la sauvegarde: $SIZE"
    
    # Créer un fichier de métadonnées
    METADATA_FILE="${BACKUP_FILE}.meta"
    cat > "$METADATA_FILE" << EOF
{
    "database": "$DB_NAME",
    "timestamp": "$(date -Iseconds)",
    "size": "$SIZE",
    "compressed": $COMPRESS,
    "mongodb_uri": "$MONGODB_URI",
    "version": "$(mongodump --version | head -n1)"
}
EOF
    
    echo "📝 Métadonnées sauvegardées: $METADATA_FILE"
    
else
    echo "❌ Échec de la sauvegarde"
    exit 1
fi

# Nettoyer les anciennes sauvegardes
echo "🧹 Nettoyage des anciennes sauvegardes (plus de $RETENTION_DAYS jours)..."
find "$BACKUP_PATH" -name "${DB_NAME}_*.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_PATH" -name "${DB_NAME}_*.meta" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Compter les sauvegardes restantes
REMAINING_BACKUPS=$(find "$BACKUP_PATH" -name "${DB_NAME}_*.gz" | wc -l)
echo "📊 Nombre de sauvegardes conservées: $REMAINING_BACKUPS"

# Fonction de restauration (optionnelle)
create_restore_script() {
    RESTORE_SCRIPT="$BACKUP_PATH/restore_${DB_NAME}_${TIMESTAMP}.sh"
    cat > "$RESTORE_SCRIPT" << EOF
#!/bin/bash
# Script de restauration pour $BACKUP_FILE
# Usage: ./restore_${DB_NAME}_${TIMESTAMP}.sh [target_database]

TARGET_DB=\${1:-${DB_NAME}_restored}

echo "🔄 Restauration de la base de données..."
echo "Source: $BACKUP_FILE"
echo "Cible: \$TARGET_DB"

if [ "$COMPRESS" = "true" ]; then
    mongorestore --uri="$MONGODB_URI" --nsFrom="${DB_NAME}.*" --nsTo="\$TARGET_DB.*" --archive="$BACKUP_FILE" --gzip
else
    mongorestore --uri="$MONGODB_URI" --nsFrom="${DB_NAME}.*" --nsTo="\$TARGET_DB.*" --dir="$BACKUP_FILE"
fi

if [ \$? -eq 0 ]; then
    echo "✅ Restauration réussie vers \$TARGET_DB"
else
    echo "❌ Échec de la restauration"
    exit 1
fi
EOF
    
    chmod +x "$RESTORE_SCRIPT"
    echo "📝 Script de restauration créé: $RESTORE_SCRIPT"
}

create_restore_script

echo "🎉 Sauvegarde terminée avec succès!"
echo "📁 Répertoire de sauvegarde: $BACKUP_PATH"
echo "⏰ Prochaine sauvegarde programmée selon la configuration cron"
