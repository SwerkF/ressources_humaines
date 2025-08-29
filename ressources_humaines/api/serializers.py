from rest_framework import serializers
from django.core.validators import RegexValidator, FileExtensionValidator
from .models import CustomUser, Candidat, Recruteur, Candidature, Job
import re
import logging

logger = logging.getLogger(__name__)

class PasswordMixin:
    password = serializers.CharField(write_only=True, required=False)

    def handle_password(self, instance, password):
        if password:
            instance.set_password(password)
            instance.save()
        return instance

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Ce champ est requis.'})
        instance = super().create(validated_data)
        return self.handle_password(instance, password)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        return self.handle_password(instance, password)


class UserSerializer(PasswordMixin, serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'password', 'role']


class CandidatSerializer(PasswordMixin, serializers.ModelSerializer):
    class Meta:
        model = Candidat
        fields = [
            'id', 'email', 'password', 'role',
            'first_name', 'last_name',
            'date_naissance', 'poste_actuel', 'entreprise_actuelle', 'linkedin',
        ]
        read_only_fields = ['role']

    def create(self, validated_data):
        validated_data['role'] = 'candidat'
        return super().create(validated_data)


class RecruteurSerializer(PasswordMixin, serializers.ModelSerializer):
    siret = serializers.CharField(
        validators=[RegexValidator(
            regex=r'^\d{14}$',
            message='Le SIRET doit contenir exactement 14 chiffres.'
        )]
    )
    
    logo = serializers.ImageField(
        required=False,
        validators=[FileExtensionValidator(
            allowed_extensions=['jpg', 'jpeg', 'png', 'gif'],
            message='Seuls les fichiers JPG, JPEG, PNG et GIF sont autorisés pour le logo.'
        )]
    )
    
    class Meta:
        model = Recruteur
        fields = [
            'id', 'email', 'password', 'role',
            'nom_entreprise', 'siret', 'nom_gerant', 'email_professionnel',
            'localisation', 'logo', 'site_web',
        ]
        read_only_fields = ['role']
        extra_kwargs = {
            'nom_gerant': {'required': True},
            'localisation': {'required': True},
        }

    def validate_email_professionnel(self, value):
        if Recruteur.objects.filter(email_professionnel=value).exists():
            raise serializers.ValidationError("Cet email professionnel est déjà utilisé.")
        return value

    def validate_siret(self, value):
        # Nettoyer le SIRET en retirant tous les espaces et caractères non numériques
        cleaned_siret = re.sub(r'[^\d]', '', value)
        logger.debug(f"🧹 [RecruteurSerializer] SIRET nettoyé: '{value}' -> '{cleaned_siret}'")
        
        if len(cleaned_siret) != 14:
            raise serializers.ValidationError(f"Le SIRET doit contenir exactement 14 chiffres (reçu: {len(cleaned_siret)} chiffres).")
        
        if Recruteur.objects.filter(siret=cleaned_siret).exists():
            raise serializers.ValidationError("Ce SIRET est déjà utilisé.")
        
        return cleaned_siret

    def validate_logo(self, value):
        if value and value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError('Le fichier logo ne doit pas dépasser 5MB.')
        return value

    def create(self, validated_data):
        logger.info(f"🔧 [RecruteurSerializer] Début de la création du recruteur")
        logger.debug(f"📊 [RecruteurSerializer] Données validées: {list(validated_data.keys())}")
        
        try:
            validated_data['role'] = 'recruteur'
            logger.debug(f"✅ [RecruteurSerializer] Rôle défini: recruteur")
            
            user = super().create(validated_data)
            logger.info(f"💾 [RecruteurSerializer] Recruteur créé avec succès - ID: {user.id}, Email: {user.email}")
            
            return user
        except Exception as e:
            logger.error(f"💥 [RecruteurSerializer] Erreur lors de la création: {type(e).__name__}: {str(e)}")
            logger.error(f"📍 [RecruteurSerializer] Traceback:", exc_info=True)
            raise


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class JobSerializer(serializers.ModelSerializer):
    recruteur_nom = serializers.CharField(source='recruteur.nom_entreprise', read_only=True)
    recruteur_logo = serializers.ImageField(source='recruteur.logo', read_only=True)
    nombre_candidatures = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'recruteur', 'recruteur_nom', 'titre', 'description', 'exigences', 'experience',
            'type_contrat', 'salaire_min', 'salaire_max', 'localisation', 'keywords','recruteur_logo',
            'date_creation', 'date_expiration', 'active', 'nombre_candidatures'
        ]
        read_only_fields = ['recruteur', 'date_creation']

    def get_nombre_candidatures(self, obj):
        return obj.candidatures.count()

    def create(self, validated_data):
        return super().create(validated_data)


class CandidatureSerializer(serializers.ModelSerializer):
    candidat_nom = serializers.CharField(source='candidat.first_name', read_only=True)
    candidat_prenom = serializers.CharField(source='candidat.last_name', read_only=True)
    candidat_email = serializers.CharField(source='candidat.email', read_only=True)
    job_titre = serializers.CharField(source='job.titre', read_only=True)
    entreprise = serializers.CharField(source='job.recruteur.nom_entreprise', read_only=True)
    
    cv = serializers.FileField(
        validators=[FileExtensionValidator(
            allowed_extensions=['pdf'],
            message='Seuls les fichiers PDF sont autorisés pour le CV.'
        )]
    )
    
    lettre_motivation = serializers.FileField(
        required=False,
        validators=[FileExtensionValidator(
            allowed_extensions=['pdf'],
            message='Seuls les fichiers PDF sont autorisés pour la lettre de motivation.'
        )]
    )

    class Meta:
        model = Candidature
        fields = [
            'id', 'candidat', 'candidat_nom', 'candidat_prenom', 'candidat_email',
            'job', 'job_titre', 'entreprise', 'cv', 'lettre_motivation', 
            'statut', 'date_candidature', 'date_modification'
        ]
        read_only_fields = ['candidat', 'date_candidature', 'date_modification']

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user_role = getattr(request.user, 'role', None)
            
            if user_role == 'candidat':
                allowed_fields = {'cv', 'lettre_motivation'}
                validated_data = {k: v for k, v in validated_data.items() if k in allowed_fields}
            
            elif user_role == 'recruteur':
                allowed_fields = {'statut'}
                validated_data = {k: v for k, v in validated_data.items() if k in allowed_fields}
        
        return super().update(instance, validated_data)

    def validate_cv(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Le fichier CV ne doit pas dépasser 5MB.')
        return value

    def validate_lettre_motivation(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('La lettre de motivation ne doit pas dépasser 5MB.')
        return value

    def validate(self, data):
        if self.instance is None:
            candidat = self.context['request'].user if self.context.get('request') else None
            job = data.get('job')
            if candidat and job:
                if Candidature.objects.filter(candidat=candidat, job=job).exists():
                    raise serializers.ValidationError(
                        "Vous avez déjà postulé pour ce job."
                    )
        return data


class CandidatureUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = ['statut']