from rest_framework import serializers
from accounts.models import CustomUser
from .models import Class
import random
import string
from accounts.serializers import CustomUserSerializer

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'role')

class ClassSerializer(serializers.ModelSerializer):
    teacher = CustomUserSerializer(read_only=True)
    class Meta:
        model = Class
        fields = ('id', 'name', 'subject', 'code', 'teacher', 'students', 'created_at')
        read_only_fields = ('code', 'teacher')

    def create(self, validated_data):
        # Generate random 6-character code
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        validated_data['code'] = code
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)