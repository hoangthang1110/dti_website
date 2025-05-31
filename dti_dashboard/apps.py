# dti_website/dti_dashboard/apps.py
from django.apps import AppConfig

class DtiDashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dti_dashboard'
    # Bạn KHÔNG cần method ready() nếu không có signals tùy chỉnh.
    # Nếu có method ready(), đảm bảo nó không gây lỗi.
    # Nếu bạn không chắc chắn, hãy comment hoặc xóa nó đi.
    # def ready(self):
    #     try:
    #         import dti_dashboard.signals
    #     except ImportError:
    #         pass