from rest_framework import permissions

class IsTeacherOrStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['teacher', 'student']

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'teacher':
            return obj.teacher == request.user
        return request.user in obj.students.all()