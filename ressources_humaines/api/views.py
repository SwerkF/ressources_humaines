from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'OK',
        'message': 'API Ressources Humaines fonctionne correctement',
        'service': 'ressources-humaines-api',
        'version': '1.0.0',
        'endpoints_available': [
            '/api/health/',
            '/admin/'
        ]
    }, status=status.HTTP_200_OK)
