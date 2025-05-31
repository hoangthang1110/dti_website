# dti_dashboard/serializers.py
from rest_framework import serializers
from .models import DTIIndex, DTIValue, CustomUser # <-- Đảm bảo là CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser # <-- Đảm bảo là CustomUser
        fields = ['id', 'username', 'email', 'full_name', 'role', 'is_active']
        read_only_fields = ['is_active']

class DTIIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = DTIIndex
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class DTIValueSerializer(serializers.ModelSerializer):
    index_name = serializers.CharField(source='index.name', read_only=True)
    index_code = serializers.CharField(source='index.code', read_only=True)
    # entered_by_username = serializers.CharField(source='entered_by_user.username', read_only=True) # <-- SẼ CẦN SỬA SAU NÀY
    # TẠM THỜI BỎ ENTERED_BY_USER VÀ ENTERED_BY_USERNAME NẾU CHƯA THÊM VÀO MODEL
    class Meta:
        model = DTIValue
        fields = ['id', 'index', 'index_name', 'index_code', 'value', 'period_date', 'created_at']
        # BỎ ENTERED_BY_USER VÀ ENTERED_BY_USERNAME NẾU CHƯA THÊM VÀO MODEL
        # fields = ['id', 'index', 'index_name', 'index_code', 'value', 'period_date', 'entered_by_user', 'entered_by_username', 'created_at']
        read_only_fields = ('created_at',)