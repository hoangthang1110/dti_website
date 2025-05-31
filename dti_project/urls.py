# dti_project/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from django.views.decorators.csrf import csrf_exempt # <--- THÊM DÒNG NÀY


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('dti_dashboard.urls')),
    # Áp dụng csrf_exempt trực tiếp cho obtain_auth_token view
    path('api-token-auth/', csrf_exempt(obtain_auth_token)), # <--- SỬA DÒNG NÀY
    # Hoặc nếu bạn đã đổi tên API token thành /api/token/
    # path('api/token/', csrf_exempt(obtain_auth_token)),
]