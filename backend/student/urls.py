from django.urls import path
from .views import StudentDashboardView, JoinClassView, EnrolledClassesView

urlpatterns = [
    path("dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
    path("join-class/", JoinClassView.as_view(), name="join-class"),
    path("enrolled-classes/", EnrolledClassesView.as_view(), name="enrolled-classes"),
]
