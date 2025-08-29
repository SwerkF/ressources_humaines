from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Job, Recruteur
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Crée des offres d\'emploi de test pour tester la pagination et les filtres'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=25,
            help='Nombre d\'offres à créer (défaut: 25)',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Vérifier qu'il existe au moins un recruteur
        recruteur = Recruteur.objects.first()
        if not recruteur:
            self.stdout.write(
                self.style.ERROR('Aucun recruteur trouvé. Créez d\'abord un recruteur.')
            )
            return
        
        # Données de test
        titres_jobs = [
            "Développeur Full Stack",
            "Designer UX/UI", 
            "Data Scientist",
            "DevOps Engineer",
            "Product Manager",
            "Développeur React",
            "Architecte Solutions",
            "Analyste Business",
            "Ingénieur Machine Learning",
            "Scrum Master",
            "Développeur Python",
            "Chef de Projet Digital",
            "Expert Cybersécurité",
            "Consultant SAP",
            "Développeur Mobile",
        ]
        
        descriptions_base = [
            "Nous recherchons un professionnel expérimenté pour rejoindre notre équipe dynamique.",
            "Opportunité unique de travailler sur des projets innovants dans un environnement stimulant.",
            "Poste à responsabilités dans une entreprise en forte croissance.",
            "Rejoignez une équipe passionnée et contribuez à des projets d'envergure.",
            "Excellente opportunité de développement professionnel dans le secteur technologique.",
        ]
        
        exigences_base = [
            "Minimum 3 ans d'expérience, Bac+5 en informatique, Maîtrise des technologies modernes",
            "Expérience confirmée, Anglais courant, Esprit d'équipe",
            "Formation supérieure, Compétences techniques solides, Autonomie",
            "Expertise technique, Capacité d'analyse, Communication",
            "Formation en ingénierie, Expérience en gestion de projet, Leadership",
        ]
        
        localisations = [
            "Paris", "Lyon", "Marseille", "Toulouse", "Nantes", 
            "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes"
        ]
        
        types_contrat = ["CDI", "CDD", "Stage", "Freelance", "Alternance"]
        
        created_jobs = 0
        
        for i in range(count):
            try:
                # Données aléatoires
                titre = random.choice(titres_jobs)
                if i > 0:  # Ajouter un suffixe pour éviter les doublons
                    titre += f" - {i+1}"
                
                description = random.choice(descriptions_base)
                exigences = random.choice(exigences_base) 
                localisation = random.choice(localisations)
                type_contrat = random.choice(types_contrat)
                
                # Salaires aléatoires
                salaire_min = Decimal(random.randint(25, 60)) * 1000
                salaire_max = salaire_min + Decimal(random.randint(5, 20)) * 1000
                
                # Date d'expiration aléatoire (entre 1 et 6 mois)
                date_expiration = timezone.now() + timedelta(
                    days=random.randint(30, 180)
                )
                
                # Création du job
                job = Job.objects.create(
                    recruteur=recruteur,
                    titre=titre,
                    description=description,
                    exigences=exigences,
                    type_contrat=type_contrat,
                    salaire_min=salaire_min,
                    salaire_max=salaire_max,
                    localisation=localisation,
                    date_expiration=date_expiration,
                    active=True
                )
                
                created_jobs += 1
                
                if created_jobs % 5 == 0:
                    self.stdout.write(f"Créé {created_jobs}/{count} offres...")
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Erreur lors de la création du job {i+1}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ {created_jobs} offres d\'emploi créées avec succès!'
            )
        )
        
        # Afficher des statistiques
        total_jobs = Job.objects.filter(active=True).count()
        self.stdout.write(f"📊 Total d'offres actives: {total_jobs}")
        
        # Test de l'endpoint publiques
        self.stdout.write("\n🧪 Test de l'endpoint /api/jobs/publiques/:")
        self.stdout.write("   Vous pouvez maintenant tester la pagination dans votre frontend!")
        self.stdout.write("   Exemple: GET /api/jobs/publiques/?page=1&page_size=10")
