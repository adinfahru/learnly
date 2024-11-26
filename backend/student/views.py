from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStudent
from .serializers import StudentSerializer

class StudentDashboardView(APIView):
    permission_classes = [IsStudent]
    
    def get(self, request):
        return Response({"message": "Student Dashboard"})
