from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from api.models import CustomUser

class Command(BaseCommand):
    help = 'Permet de créer les groupes de rôles'

    def handle(self, *args, **kwargs):
        roles = ['admin', 'recruteur', 'candidat']
        for role in roles:
            group, created = Group.objects.get_or_create(name=role)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Groupe {role} créé"))
            else:
                self.stdout.write(f"Groupe {role} existe déjà")