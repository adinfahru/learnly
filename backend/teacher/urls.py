from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherDashboardView, ClassViewSet

router = DefaultRouter()
router.register(r'classes', ClassViewSet, basename='class')

urlpatterns = [
    path("dashboard/", TeacherDashboardView.as_view(), name="teacher-dashboard"),
    path('', include(router.urls)),
]
