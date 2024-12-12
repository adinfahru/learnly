from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsTeacher
from .serializers import TeacherSerializer

class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]
    
    def get(self, request):
        return Response({"message": "Teacher Dashboard"})