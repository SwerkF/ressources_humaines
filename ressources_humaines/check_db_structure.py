#!/usr/bin/env python
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ressources_humaines.settings')
django.setup()

from django.db import connection

def check_table_structure():
    """Vérifie la structure de la table api_cvanalysis"""
    
    with connection.cursor() as cursor:
        # Vérifier si la table existe
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='api_cvanalysis'
        """)
        
        if not cursor.fetchone():
            print("❌ Table api_cvanalysis n'existe pas!")
            return
        
        # Obtenir la structure de la table
        cursor.execute("PRAGMA table_info(api_cvanalysis)")
        columns = cursor.fetchall()
        
        print("📋 Structure de la table api_cvanalysis:")
        print("-" * 50)
        
        for col in columns:
            col_id, name, type_name, not_null, default_value, pk = col
            not_null_str = "NOT NULL" if not_null else "NULL"
            default_str = f"DEFAULT {default_value}" if default_value else ""
            pk_str = "PRIMARY KEY" if pk else ""
            
            print(f"{name:<20} {type_name:<15} {not_null_str:<10} {default_str:<15} {pk_str}")
        
        print("-" * 50)
        
        # Vérifier les contraintes NOT NULL
        not_null_columns = [col[1] for col in columns if col[3]]  # col[3] = not_null
        print(f"\n🔒 Colonnes NOT NULL: {', '.join(not_null_columns)}")

if __name__ == "__main__":
    check_table_structure()
