from rest_framework.permissions import IsAuthenticated

# Permissions tùy chỉnh
class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class IsDataEntryOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'DATA_ENTRY']

class IsViewerOrHigher(IsAuthenticated):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'DATA_ENTRY', 'VIEWER']
