from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from dti_dashboard.models import User
from dti_dashboard.serializers import UserSerializer
from dti_dashboard.api.permissions import IsAdminUser

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]  # Hoặc dùng IsAdminUser nếu không muốn đăng ký công khai
        return [IsAdminUser()]

    def perform_create(self, serializer):
        password = self.request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()

    def perform_update(self, serializer):
        password = self.request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
