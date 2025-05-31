# dti_website/dti_dashboard/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser # Import AbstractUser

# 1. Custom User Model (Mở rộng từ AbstractUser)
class CustomUser(AbstractUser):
    # Các trường tùy chỉnh thêm vào
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DATA_ENTRY', 'Data Entry'),
        ('VIEWER', 'Viewer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='VIEWER')
    full_name = models.CharField(max_length=255, blank=True, null=True)

    # Nếu bạn muốn thêm các trường khác, hãy thêm vào đây, ví dụ:
    # phone_number = models.CharField(max_length=15, blank=True, null=True)
    # department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.username

# 2. DTIIndex Model (Chỉ số chuyển đổi số)
class DTIIndex(models.Model):
    DATA_TYPE_CHOICES = (
        ('INTEGER', 'Số nguyên'),
        ('DECIMAL', 'Số thập phân'),
        ('PERCENT', 'Phần trăm'),
    )

    name = models.CharField(max_length=255, unique=True, verbose_name="Tên chỉ số")
    code = models.CharField(max_length=50, unique=True, verbose_name="Mã chỉ số")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    unit = models.CharField(max_length=50, verbose_name="Đơn vị tính")
    data_type = models.CharField(max_length=10, choices=DATA_TYPE_CHOICES, default='DECIMAL', verbose_name="Loại dữ liệu")
    target_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Ngưỡng mục tiêu")
    is_active = models.BooleanField(default=True, verbose_name="Hoạt động")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        verbose_name = "Chỉ số DTI"
        verbose_name_plural = "Chỉ số DTI"
        ordering = ['name'] # Sắp xếp theo tên mặc định

    def __str__(self):
        return self.name

# 3. DTIValue Model (Giá trị của chỉ số tại một thời điểm)
class DTIValue(models.Model):
    index = models.ForeignKey(DTIIndex, on_delete=models.CASCADE, related_name='values', verbose_name="Chỉ số")
    value = models.DecimalField(max_digits=15, decimal_places=5, verbose_name="Giá trị")
    period_date = models.DateField(verbose_name="Ngày kỳ báo cáo")
    # THÊM DÒNG NÀY ĐỂ LƯU NGƯỜI NHẬP LIỆU
    entered_by_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='dti_values_entered', verbose_name="Người nhập")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        verbose_name = "Giá trị DTI"
        verbose_name_plural = "Giá trị DTI"
        unique_together = ('index', 'period_date')
        ordering = ['-period_date', 'index__name']

    def __str__(self):
        return f"{self.index.name} - {self.value} ({self.period_date})"