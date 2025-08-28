from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import CustomUser, Candidat, Recruteur
import re

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
    
    class Meta:
        model = Recruteur
        fields = [
            'id', 'email', 'password', 'role',
            'nom_entreprise', 'siret', 'nom_gerant', 'email_professionnel',
            'localisation', 'logo', 'site_web',
        ]
        read_only_fields = ['role']

    def validate_email_professionnel(self, value):
        if Recruteur.objects.filter(email_professionnel=value).exists():
            raise serializers.ValidationError("Cet email professionnel est déjà utilisé.")
        return value

    def validate_siret(self, value):
        if Recruteur.objects.filter(siret=value).exists():
            raise serializers.ValidationError("Ce SIRET est déjà utilisé.")
        return value

    def create(self, validated_data):
        validated_data['role'] = 'recruteur'
        return super().create(validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)