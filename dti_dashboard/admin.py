# dti_dashboard/admin.py
from django.contrib import admin
from .models import DTIIndex, DTIValue, User # Nhập các model của bạn

@admin.register(DTIIndex)
class DTIIndexAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'unit', 'data_type', 'target_value', 'is_active')
    list_filter = ('is_active', 'data_type')
    search_fields = ('name', 'code', 'description')
    ordering = ('name',)

@admin.register(DTIValue)
class DTIValueAdmin(admin.ModelAdmin):
    list_display = ('index', 'value', 'period_date', 'entered_by_user', 'created_at')
    list_filter = ('index', 'period_date')
    search_fields = ('index__name', 'value')
    date_hierarchy = 'period_date' # Cho phép điều hướng theo ngày
    ordering = ('-period_date', 'index__name') # Sắp xếp giảm dần theo ngày, sau đó tăng dần theo tên chỉ số

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'full_name', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'full_name')
    ordering = ('username',)
    # Bạn có thể tùy chỉnh thêm form nhập liệu nếu cần, ví dụ:
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Thông tin cá nhân', {'fields': ('full_name', 'email', 'role')}),
        ('Quyền hạn', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Ngày quan trọng', {'fields': ('last_login', 'date_joined')}),
    )