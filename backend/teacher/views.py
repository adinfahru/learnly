from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsTeacher
from .serializers import TeacherSerializer
from rest_framework import viewsets
from .models import Class
from .serializers import ClassSerializer
from rest_framework.response import Response

class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]
    
    def get(self, request):
        return Response({"message": "Teacher Dashboard"})

class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Class.objects.filter(teacher=self.request.user)