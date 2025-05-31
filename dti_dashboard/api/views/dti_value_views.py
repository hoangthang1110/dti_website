from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from dti_dashboard.models import DTIValue
from dti_dashboard.serializers import DTIValueSerializer
from dti_dashboard.api.permissions import IsDataEntryOrAdmin, IsViewerOrHigher

class DTIValueViewSet(viewsets.ModelViewSet):
    queryset = DTIValue.objects.all().select_related('index', 'entered_by_user')
    serializer_class = DTIValueSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_index']:
            return [IsViewerOrHigher()]
        return [IsDataEntryOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(entered_by_user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_index(self, request):
        index_id = request.query_params.get('index_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not index_id:
            return Response({"error": "index_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.queryset.filter(index_id=index_id)

        if start_date:
            queryset = queryset.filter(period_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(period_date__lte=end_date)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
