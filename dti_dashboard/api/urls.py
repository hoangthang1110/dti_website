from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dti_index_views import DTIIndexViewSet
from .views.dti_value_views import DTIValueViewSet
from .views.user_views import UserViewSet
from .views.auth_views import CustomAuthToken

router = DefaultRouter()
router.register(r'dti-indices', DTIIndexViewSet)
router.register(r'dti-values', DTIValueViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
]
