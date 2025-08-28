from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('', include(router.urls)),
]