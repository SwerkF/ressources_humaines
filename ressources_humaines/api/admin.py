from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Candidat, Recruteur


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'role', 'first_name', 'last_name', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(Candidat)
class CandidatAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'poste_actuel', 'entreprise_actuelle', 'date_joined')
    list_filter = ('date_naissance', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'poste_actuel', 'entreprise_actuelle')
    readonly_fields = ('role', 'date_joined', 'last_login')


@admin.register(Recruteur)
class RecruteurAdmin(admin.ModelAdmin):
    list_display = ('email', 'nom_entreprise', 'siret', 'nom_gerant', 'localisation', 'date_joined')
    list_filter = ('localisation', 'date_joined')
    search_fields = ('email', 'nom_entreprise', 'siret', 'nom_gerant', 'email_professionnel')
    readonly_fields = ('role', 'date_joined', 'last_login')
