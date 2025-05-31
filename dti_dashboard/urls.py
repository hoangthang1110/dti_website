# dti_website/dti_dashboard/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Đảm bảo UserViewSet có ở đây
from .views import DTIIndexViewSet, DTIValueViewSet, UserViewSet # <-- UserViewSet phải được import

router = DefaultRouter()
router.register(r'dti-indices', DTIIndexViewSet)
router.register(r'dti-values', DTIValueViewSet)
router.register(r'users', UserViewSet) # <-- Đảm bảo rằng UserViewSet đã được đăng ký

urlpatterns = [
    path('', include(router.urls)),
]