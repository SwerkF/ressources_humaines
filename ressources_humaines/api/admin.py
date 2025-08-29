from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Candidat, Recruteur, Candidature, Job, CVAnalysis


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


@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    list_display = ('candidat', 'job', 'statut', 'date_candidature', 'has_cv', 'has_lettre_motivation')
    list_filter = ('statut', 'date_candidature', 'job__type_contrat')
    search_fields = ('candidat__email', 'candidat__first_name', 'candidat__last_name', 'job__titre')
    readonly_fields = ('date_candidature', 'date_modification')
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('candidat', 'job', 'statut')
        }),
        ('Fichiers', {
            'fields': ('cv', 'lettre_motivation')
        }),
        ('Dates', {
            'fields': ('date_candidature', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    def has_cv(self, obj):
        return bool(obj.cv)
    has_cv.boolean = True
    has_cv.short_description = 'CV'
    
    def has_lettre_motivation(self, obj):
        return bool(obj.lettre_motivation)
    has_lettre_motivation.boolean = True
    has_lettre_motivation.short_description = 'Lettre de motivation'


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('titre', 'recruteur', 'type_contrat', 'localisation', 'date_creation', 'date_expiration', 'active', 'nombre_candidatures')
    list_filter = ('type_contrat', 'active', 'date_creation', 'recruteur__nom_entreprise')
    search_fields = ('titre', 'description', 'recruteur__nom_entreprise', 'localisation')
    readonly_fields = ('date_creation',)
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('recruteur', 'titre', 'description', 'exigences')
        }),
        ('Détails du poste', {
            'fields': ('type_contrat', 'salaire_min', 'salaire_max', 'localisation')
        }),
        ('Dates et statut', {
            'fields': ('date_creation', 'date_expiration', 'active')
        }),
    )
    
    def nombre_candidatures(self, obj):
        return obj.candidatures.count()
    nombre_candidatures.short_description = 'Nb candidatures'


@admin.register(CVAnalysis)
class CVAnalysisAdmin(admin.ModelAdmin):
    list_display = ('candidature', 'overall_score', 'skill_score', 'experience_score', 'education_score', 'analysis_date')
    list_filter = ('analysis_date', 'overall_score')
    search_fields = ('candidature__candidat__email', 'candidature__job__titre')
    readonly_fields = ('candidature', 'analysis_date', 'processing_time', 'skills', 'experience', 'education')
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('candidature', 'analysis_date')
        }),
        ('Scores', {
            'fields': ('overall_score', 'skill_score', 'experience_score', 'education_score')
        }),
        ('Données extraites', {
            'fields': ('skills', 'experience', 'education'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('processing_time',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Les analyses sont créées automatiquement
    
    def has_delete_permission(self, request, obj=None):
        return False  # Empêcher la suppression des analyses
