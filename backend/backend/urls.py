from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/accounts/", include("accounts.urls")), 
    path("api/teacher/", include("teacher.urls")),
    path("api/student/", include("student.urls")),
    path("api/classes/", include("classes.urls")),
    path("api/", include("quizzes.urls")),
]
