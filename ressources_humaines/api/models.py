from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

class CustomUserManager(UserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superuser doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superuser doit avoir is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('recruteur', 'Recruteur'),
        ('candidat', 'Candidat'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] 

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


class Candidat(CustomUser):
    date_naissance = models.DateField(null=True, blank=True)
    poste_actuel = models.CharField(max_length=255, null=True, blank=True)
    entreprise_actuelle = models.CharField(max_length=255, null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.role = 'candidat'
        return super().save(*args, **kwargs)


class Recruteur(CustomUser):
    nom_entreprise = models.CharField(max_length=255)
    siret = models.CharField(max_length=14, unique=True)
    nom_gerant = models.CharField(max_length=255, null=True, blank=True)
    email_professionnel = models.EmailField(unique=True)
    localisation = models.CharField(max_length=255, null=True, blank=True)
    logo = models.URLField(null=True, blank=True)
    site_web = models.URLField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.role = 'recruteur'
        return super().save(*args, **kwargs)


class Job(models.Model):
    recruteur = models.ForeignKey(
        Recruteur,
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    titre = models.CharField(max_length=255)
    description = models.TextField()
    exigences = models.TextField(
        help_text='Compétences et qualifications requises'
    )
    experience = models.CharField(max_length=100, blank=True, null=True)
    type_contrat = models.CharField(
        max_length=50,
        choices=[
            ('CDI', 'CDI'),
            ('CDD', 'CDD'),
            ('Stage', 'Stage'),
            ('Freelance', 'Freelance'),
            ('Alternance', 'Alternance'),
        ]
    )
    salaire_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Salaire minimum en euros'
    )
    salaire_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Salaire maximum en euros'
    )
    localisation = models.CharField(max_length=255)
    keywords = models.JSONField(default=list, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_expiration = models.DateTimeField(
        help_text='Date limite pour postuler'
    )
    active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.titre} - {self.recruteur.nom_entreprise}"


class Candidature(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En Attente'),
        ('acceptee', 'Acceptée'),
        ('refusee', 'Refusée'),
    ]
    
    candidat = models.ForeignKey(
        Candidat,
        on_delete=models.CASCADE,
        related_name='candidatures'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='candidatures'
    )
    cv = models.FileField(
        upload_to='candidatures/cv/',
        help_text='Fichier CV (PDF)'
    )
    lettre_motivation = models.FileField(
        upload_to='candidatures/lettres/',
        help_text='Lettre de motivation (PDF)',
        blank=True,
        null=True
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )
    date_candidature = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_candidature']
        unique_together = ['candidat', 'job']
    
    def __str__(self):
        return f"{self.candidat.email} - {self.job.titre} - {self.get_statut_display()}"