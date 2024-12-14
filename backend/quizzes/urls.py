from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from .views import QuizViewSet, QuizSessionViewSet, QuestionViewSet, QuizAttemptViewSet

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'sessions', QuizSessionViewSet, basename='session')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'attempts', QuizAttemptViewSet, basename='attempt')

urlpatterns = [
    path('', include(router.urls)),
]
