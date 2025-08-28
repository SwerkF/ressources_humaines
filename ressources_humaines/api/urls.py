from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CandidatViewSet, RecruteurViewSet,
    CandidatRegisterView, RecruteurRegisterView,
    LoginView, LogoutView, MeView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'candidats', CandidatViewSet, basename='candidat')
router.register(r'recruteurs', RecruteurViewSet, basename='recruteur')

urlpatterns = [
    path('auth/register/candidat/', CandidatRegisterView.as_view(), name='register-candidat'),
    path('auth/register/recruteur/', RecruteurRegisterView.as_view(), name='register-recruteur'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
]

urlpatterns += router.urls