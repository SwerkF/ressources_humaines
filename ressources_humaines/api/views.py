from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)

from .models import CustomUser, Candidat, Recruteur, Candidature, Job
from .serializers import (
    UserSerializer, CandidatSerializer, RecruteurSerializer, LoginSerializer, 
    CandidatureSerializer, JobSerializer, CandidatureUpdateSerializer
)

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'


class IsRecruteurOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                getattr(request.user, 'role', None) in ['admin', 'recruteur'])


class IsCandidatOwnerOrRecruteurOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        action = getattr(view, 'action', None)
        
        if action == 'create':
            return user_role == 'candidat'
        
        if action == 'list':
            return user_role in ['admin', 'recruteur', 'candidat']
        
        return True

    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)
        
        if user_role == 'admin':
            return True
        
        if user_role == 'recruteur':
            if hasattr(obj, 'job') and obj.job.recruteur.pk == request.user.pk:
                return True
            return False
        
        if user_role == 'candidat':
            return obj.candidat.pk == request.user.pk
        
        return False


class IsRecruteurOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        action = getattr(view, 'action', None)
        
        if action == 'create':
            return user_role == 'recruteur'
        
        if action == 'list':
            return True
        
        return True

    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)
        
        if user_role == 'admin':
            return True
        
        if user_role == 'recruteur':
            return obj.recruteur.pk == request.user.pk
        
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        return False


class IsAdminOrSelf(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        action = getattr(view, 'action', None)
        if action in ('list', 'create'):
            return getattr(request.user, 'role', None) == 'admin'
        return True

    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', None) == 'admin':
            return True
        return getattr(obj, 'pk', None) == getattr(request.user, 'pk', None)


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class CandidatViewSet(viewsets.ModelViewSet):
    serializer_class = CandidatSerializer
    permission_classes = [IsAdminOrSelf]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Candidat.objects.none()
        if getattr(user, 'role', None) == 'admin':
            return Candidat.objects.all()
        if getattr(user, 'role', None) == 'candidat':
            return Candidat.objects.filter(pk=user.pk)
        return Candidat.objects.none()

    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], url_path='me',
            permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        if getattr(user, 'role', None) != 'candidat':
            return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
        instance = Candidat.objects.filter(pk=user.pk).first()
        if not instance:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(self.get_serializer(instance).data)
        if request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(instance, data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecruteurViewSet(viewsets.ModelViewSet):
    serializer_class = RecruteurSerializer
    permission_classes = [IsAdminOrSelf]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Recruteur.objects.none()
        if getattr(user, 'role', None) == 'admin':
            return Recruteur.objects.all()
        if getattr(user, 'role', None) == 'recruteur':
            return Recruteur.objects.filter(pk=user.pk)
        return Recruteur.objects.none()

    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], url_path='me',
            permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        if getattr(user, 'role', None) != 'recruteur':
            return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
        instance = Recruteur.objects.filter(pk=user.pk).first()
        if not instance:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(self.get_serializer(instance).data)
        if request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(instance, data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CandidatRegisterView(generics.CreateAPIView):
    queryset = Candidat.objects.all()
    serializer_class = CandidatSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            ser = self.get_serializer(data=request.data)
            ser.is_valid(raise_exception=True)
            user = ser.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key, 
                'user': CandidatSerializer(user).data,
                'message': 'Candidat créé avec succès'
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({
                'detail': 'Un utilisateur avec cet email existe déjà.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'detail': 'Erreur lors de la création du compte.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecruteurRegisterView(generics.CreateAPIView):
    queryset = Recruteur.objects.all()
    serializer_class = RecruteurSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        logger.info(f"🚀 [RecruteurRegisterView] Tentative d'inscription recruteur")
        logger.debug(f"📋 [RecruteurRegisterView] Données reçues: {list(request.data.keys())}")
        logger.debug(f"📋 [RecruteurRegisterView] Content-Type: {request.content_type}")
        
        try:
            # Log des données reçues (sans les informations sensibles)
            safe_data = {k: v for k, v in request.data.items() if k not in ['password']}
            logger.debug(f"📊 [RecruteurRegisterView] Données (sans mot de passe): {safe_data}")
            
            ser = self.get_serializer(data=request.data)
            logger.debug(f"🔍 [RecruteurRegisterView] Sérialiseur créé")
            
            if not ser.is_valid():
                logger.error(f"❌ [RecruteurRegisterView] Erreurs de validation: {ser.errors}")
                return Response({
                    'detail': 'Données de formulaire invalides',
                    'errors': ser.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"✅ [RecruteurRegisterView] Validation réussie")
            
            user = ser.save()
            logger.info(f"💾 [RecruteurRegisterView] Utilisateur créé avec ID: {user.id}")
            
            token, created = Token.objects.get_or_create(user=user)
            if created:
                logger.info(f"🔑 [RecruteurRegisterView] Nouveau token créé")
            else:
                logger.info(f"🔑 [RecruteurRegisterView] Token existant réutilisé")
            
            logger.info(f"🎉 [RecruteurRegisterView] Inscription réussie pour: {user.email}")
            
            return Response({
                'token': token.key, 
                'user': RecruteurSerializer(user).data,
                'message': 'Recruteur créé avec succès'
            }, status=status.HTTP_201_CREATED)
            
        except IntegrityError as e:
            logger.error(f"🚫 [RecruteurRegisterView] Erreur d'intégrité: {str(e)}")
            return Response({
                'detail': 'Un utilisateur avec cet email ou SIRET existe déjà.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except ValidationError as e:
            logger.error(f"🚫 [RecruteurRegisterView] Erreur de validation Django: {str(e)}")
            return Response({
                'detail': f'Erreur de validation: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"💥 [RecruteurRegisterView] Erreur inattendue: {type(e).__name__}: {str(e)}")
            logger.error(f"📍 [RecruteurRegisterView] Traceback:", exc_info=True)
            return Response({
                'detail': f'Erreur lors de la création du compte: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.info(f"🔐 [LoginView] Tentative de connexion reçue")
        logger.debug(f"📋 [LoginView] Données reçues: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        logger.info(f"🔍 [LoginView] Authentification pour: {email}")

        user = authenticate(request, username=email, password=password)
        if not user:
            logger.warning(f"❌ [LoginView] Échec d'authentification pour: {email}")
            return Response({'detail': 'Identifiants invalides.'}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"✅ [LoginView] Authentification réussie pour: {email} (rôle: {user.role})")
        token, created = Token.objects.get_or_create(user=user)
        if created:
            logger.info(f"🔑 [LoginView] Nouveau token créé pour: {email}")
        else:
            logger.info(f"🔑 [LoginView] Token existant utilisé pour: {email}")
            
        data = {'token': token.key, 'role': user.role, 'id': user.id}
        logger.info(f"📤 [LoginView] Réponse envoyée: {{'token': '***', 'role': '{user.role}', 'id': {user.id}}}")
        return Response(data, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        user = self.request.user
        if user.role == 'candidat':
            return CandidatSerializer
        elif user.role == 'recruteur':
            return RecruteurSerializer
        return UserSerializer

    def get_object(self):
        user = self.request.user
        if user.role == 'candidat':
            return Candidat.objects.filter(pk=user.pk).first()
        elif user.role == 'recruteur':
            return Recruteur.objects.filter(pk=user.pk).first()
        return user

    def get(self, request):
        """
        Récupère les informations du profil de l'utilisateur connecté
        """
        obj = self.get_object()
        if not obj:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """
        Met à jour complètement le profil de l'utilisateur connecté
        """
        obj = self.get_object()
        if not obj:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """
        Met à jour partiellement le profil de l'utilisateur connecté
        """
        obj = self.get_object()
        if not obj:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        Supprime le profil de l'utilisateur connecté
        """
        obj = self.get_object()
        if not obj:
            return Response({'detail': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CandidatureViewSet(viewsets.ModelViewSet):
    serializer_class = CandidatureSerializer
    permission_classes = [IsCandidatOwnerOrRecruteurOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Candidature.objects.none()
        
        user_role = getattr(user, 'role', None)
        
        if user_role == 'admin':
            return Candidature.objects.all()
        
        if user_role == 'recruteur':
            return Candidature.objects.filter(job__recruteur__pk=user.pk)
        
        if user_role == 'candidat':
            return Candidature.objects.filter(candidat__pk=user.pk)
        
        return Candidature.objects.none()

    def get_serializer_class(self):
        if (self.action in ['update', 'partial_update'] and 
            getattr(self.request.user, 'role', None) == 'recruteur'):
            return CandidatureUpdateSerializer
        return CandidatureSerializer

    def perform_create(self, serializer):
        candidat = Candidat.objects.get(pk=self.request.user.pk)
        serializer.save(candidat=candidat)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user_role = getattr(request.user, 'role', None)
        
        if user_role == 'candidat':
            if 'statut' in request.data:
                return Response(
                    {'detail': 'Les candidats ne peuvent pas modifier le statut de leur candidature.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user_role == 'recruteur':
            if not hasattr(instance, 'job') or instance.job.recruteur.pk != request.user.pk:
                return Response(
                    {'detail': 'Vous ne pouvez modifier que les candidatures de vos jobs.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user_role = getattr(request.user, 'role', None)
        
        if user_role == 'admin' or (user_role == 'candidat' and instance.candidat.pk == request.user.pk):
            return super().destroy(request, *args, **kwargs)
        
        return Response(
            {'detail': 'Vous n\'avez pas la permission de supprimer cette candidature.'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_candidatures(self, request):
        user = request.user
        if getattr(user, 'role', None) != 'candidat':
            return Response(
                {'detail': 'Seuls les candidats peuvent accéder à cet endpoint.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        candidatures = Candidature.objects.filter(candidat__pk=user.pk)
        serializer = self.get_serializer(candidatures, many=True)
        return Response(serializer.data)


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsRecruteurOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        user_role = getattr(user, 'role', None) if user.is_authenticated else None
        
        if user_role == 'admin':
            return Job.objects.all()
        
        if user_role == 'recruteur':
            return Job.objects.filter(recruteur__pk=user.pk)
        
        return Job.objects.filter(active=True)

    def perform_create(self, serializer):
        recruteur = Recruteur.objects.get(pk=self.request.user.pk)
        serializer.save(recruteur=recruteur)

    @action(detail=True, methods=['get'], permission_classes=[IsRecruteurOrAdmin])
    def candidatures(self, request, pk=None):
        job = self.get_object()
        user_role = getattr(request.user, 'role', None)
        
        if user_role == 'recruteur' and job.recruteur.pk != request.user.pk:
            return Response(
                {'detail': 'Vous ne pouvez voir que les candidatures de vos propres jobs.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        candidatures = job.candidatures.all()
        serializer = CandidatureSerializer(candidatures, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def publiques(self, request):
        """
        Récupère toutes les offres d'emploi publiques (actives) avec pagination
        """
        queryset = Job.objects.filter(active=True).order_by('-date_creation')
        
        # Appliquer la pagination DRF
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        # Fallback si pas de pagination configurée
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)