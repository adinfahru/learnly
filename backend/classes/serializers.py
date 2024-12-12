from rest_framework import serializers
from .models import Class
import random
import string
from accounts.serializers import CustomUserSerializer

class ClassSerializer(serializers.ModelSerializer):
    teacher = CustomUserSerializer(read_only=True)
    students = CustomUserSerializer(many=True, read_only=True)
    class Meta:
        model = Class
        fields = ('id', 'name', 'subject', 'code', 'teacher', 'students', 'created_at')
        read_only_fields = ('code', 'teacher')

    def create(self, validated_data):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        validated_data['code'] = code
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)