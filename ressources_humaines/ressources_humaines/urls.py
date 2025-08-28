"""
URL configuration for ressources_humaines project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

def redirect_to_health(request):
    """Redirige l'URL racine vers l'endpoint health de l'API"""
    return redirect('/api/health/')

urlpatterns = [
    path('', redirect_to_health, name='root-redirect'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
