# dti_dashboard/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny # Giữ lại các cái này
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout

# Import CustomUser đúng cách
from .models import DTIIndex, DTIValue, CustomUser # <-- Đảm bảo là CustomUser

# Import các permission classes của DRF
from rest_framework.permissions import IsAdminUser # <-- THÊM DÒNG NÀY ĐỂ IMPORT IsAdminUser

# Import Serializer
from .serializers import DTIIndexSerializer, DTIValueSerializer, UserSerializer

# ĐỊNH NGHĨA CÁC PERMISSION TÙY CHỈNH (NẾU CHƯA CÓ)
# TỐT NHẤT NÊN ĐẶT CÁC CLASS NÀY TRONG MỘT FILE permissions.py RIÊNG BIỆT
# VÍ DỤ: dti_dashboard/permissions.py
# VÀ IMPORT CHÚNG VÀO ĐÂY SAU ĐÓ.
# TẠM THỜI ĐẶT Ở ĐÂY ĐỂ TRÁNH LỖI IMPORT NGAY LẬP TỨC.
from rest_framework.permissions import BasePermission

class IsViewerOrHigher(BasePermission):
    """
    Cho phép truy cập nếu người dùng là Admin, Data Entry, hoặc Viewer (đã đăng nhập).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class IsDataEntryOrAdmin(BasePermission):
    """
    Cho phép truy cập nếu người dùng là Admin hoặc Data Entry.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               (request.user.role in ['ADMIN', 'DATA_ENTRY'])

class IsAdminUser(BasePermission): # <-- ĐẢM BẢO CHỈ SỬ DỤNG 1 CLASS ISADMINUSER
    """
    Chỉ cho phép người dùng là Admin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role == 'ADMIN'

# --- END CÁC ĐỊNH NGHĨA PERMISSION TÙY CHỈNH ---


class DTIIndexViewSet(viewsets.ModelViewSet):
    queryset = DTIIndex.objects.all()
    serializer_class = DTIIndexSerializer
    # permission_classes = [IsAdminUser] # Bỏ dòng này và chỉ dùng get_permissions

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsViewerOrHigher()]
        # Cho các action tạo, cập nhật, xóa
        return [IsAdminUser()]


class DTIValueViewSet(viewsets.ModelViewSet):
    queryset = DTIValue.objects.all().select_related('index', 'entered_by_user')
    serializer_class = DTIValueSerializer
    # permission_classes = [IsDataEntryOrAdmin] # Bỏ dòng này và chỉ dùng get_permissions

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsViewerOrHigher()]
        # Cho các action tạo, cập nhật, xóa
        return [IsDataEntryOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(entered_by_user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_index(self, request):
        index_id = request.query_params.get('index_id')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not index_id:
            return Response({"error": "index_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.queryset.filter(index_id=index_id)

        if start_date_str:
            queryset = queryset.filter(period_date__gte=start_date_str)
        if end_date_str:
            queryset = queryset.filter(period_date__lte=end_date_str)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    # SỬA DÒNG NÀY: DÙNG CUSTOMUSER THAY VÌ USER
    queryset = CustomUser.objects.all() # <-- SỬA TẠI ĐÂY
    serializer_class = UserSerializer
    # permission_classes = [IsAdminUser] # Bỏ dòng này và chỉ dùng get_permissions

    def get_permissions(self):
        if self.action == 'create': # Cho phép đăng ký người dùng mới (nếu muốn)
            return [AllowAny()] # Hoặc bỏ dòng này nếu chỉ Admin tạo user
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

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'full_name': user.full_name
        })