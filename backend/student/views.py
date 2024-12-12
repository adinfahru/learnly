from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsStudent
from .serializers import StudentSerializer
from rest_framework import status
from classes.models import Class

class StudentDashboardView(APIView):
    permission_classes = [IsStudent]
    
    def get(self, request):
        return Response({"message": "Student Dashboard"})

class JoinClassView(APIView):
    permission_classes = [IsStudent]

    def post(self, request):
        code = request.data.get('code')
        try:
            class_obj = Class.objects.get(code=code)
            if request.user in class_obj.students.all():
                return Response({"message": "Already enrolled in this class"}, status=status.HTTP_400_BAD_REQUEST)
            class_obj.students.add(request.user)
            return Response({"message": "Successfully joined the class"})
        except Class.DoesNotExist:
            return Response({"message": "Invalid class code"}, status=status.HTTP_404_NOT_FOUND)

class EnrolledClassesView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        classes = request.user.enrolled_classes.all()
        from classes.serializers import ClassSerializer
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)
