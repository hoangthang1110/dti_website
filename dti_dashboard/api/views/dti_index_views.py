from rest_framework import viewsets
from dti_dashboard.models import DTIIndex
from dti_dashboard.serializers import DTIIndexSerializer
from dti_dashboard.api.permissions import IsAdminUser, IsViewerOrHigher

class DTIIndexViewSet(viewsets.ModelViewSet):
    queryset = DTIIndex.objects.all()
    serializer_class = DTIIndexSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsViewerOrHigher()]
        return [IsAdminUser()]
