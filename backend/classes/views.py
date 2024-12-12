from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Class
from accounts.models import CustomUser
from .serializers import ClassSerializer
from .permissions import IsTeacherOrStudent

class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrStudent]

    def get_queryset(self):
        if self.request.user.role == 'teacher':
            return Class.objects.filter(teacher=self.request.user)
        return Class.objects.filter(students=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionError("Only teachers can create classes")
        serializer.save(teacher=self.request.user)

    def update(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({"message": "Only teachers can update classes"}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({"message": "Only teachers can delete classes"}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        if request.user.role != 'student':
            return Response({"message": "Only students can join classes"}, status=403)
        class_obj = self.get_object()
        class_obj.students.add(request.user)
        return Response({"message": "Successfully joined the class"})

    @action(detail=True, methods=['post'])
    def remove_student(self, request, pk=None):
        if request.user.role != 'teacher':
            return Response(
                {"message": "Only teachers can remove students"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            class_obj = self.get_object()
            student_id = request.data.get('student_id')
            
            if not student_id:
                return Response(
                    {"message": "Student ID is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            student = CustomUser.objects.get(id=student_id)
            if student not in class_obj.students.all():
                return Response(
                    {"message": "Student is not in this class"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            class_obj.students.remove(student)
            return Response({"message": "Student removed successfully"})
        except CustomUser.DoesNotExist:
            return Response(
                {"message": "Student not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def leave_class(self, request, pk=None):
        if request.user.role != 'student':
            return Response(
                {"message": "Only students can leave class"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            class_obj = self.get_object()
            if request.user not in class_obj.students.all():
                return Response(
                    {"message": "You are not in this class"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            class_obj.students.remove(request.user)
            return Response({"message": "Successfully left the class"})
        except Exception as e:
            return Response(
                {"message": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )