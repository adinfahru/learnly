from django.urls import path, include
from .views import TeacherDashboardView

urlpatterns = [
    path("dashboard/", TeacherDashboardView.as_view(), name="teacher-dashboard"),
]
