from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from accounts.permissions import IsTeacher
from django.utils import timezone

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'teacher':
            return Quiz.objects.filter(creator=self.request.user)
        else:  # student
            return Quiz.objects.filter(
                classes__students=self.request.user,
                is_published=True
            ).distinct()
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        try:
            quiz = self.get_object()
            print(f"Starting quiz {quiz.id} for user {request.user}")  # Debug log
            
            # Cek apakah user adalah student
            if request.user.role != 'student':
                return Response(
                    {"message": "Only students can start quizzes"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # Cek apakah student terdaftar di kelas yang memiliki quiz ini
            if not quiz.classes.filter(students=request.user).exists():
                return Response(
                    {"message": "You are not enrolled in this quiz's class"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validasi waktu quiz
            now = timezone.now()
            if quiz.start_date and quiz.start_date > now:
                return Response(
                    {"message": f"Quiz will start at {quiz.start_date}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if quiz.end_date and quiz.end_date < now:
                return Response(
                    {"message": f"Quiz ended at {quiz.end_date}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cek attempt yang sudah ada
            existing_attempt = QuizAttempt.objects.filter(
                quiz=quiz,
                student=request.user,
                completed_at__isnull=True
            ).first()
            
            if existing_attempt:
                return Response({
                    'id': existing_attempt.id,
                    'started_at': existing_attempt.started_at
                })
            
            # Buat attempt baru
            attempt = QuizAttempt.objects.create(
                quiz=quiz,
                student=request.user,
                started_at=now
            )
            
            return Response({
                'id': attempt.id,
                'started_at': attempt.started_at
            })
            
        except Exception as e:
            print(f"Error in start quiz: {str(e)}")  # Debug log
            return Response(
                {"message": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == 'student':
            if not instance.is_published:
                return Response(
                    {"message": "This quiz is not published yet"},
                    status=status.HTTP_403_FORBIDDEN
                )
            if instance.end_date and instance.end_date < timezone.now():
                return Response(
                    {"message": "This quiz has ended"},
                    status=status.HTTP_403_FORBIDDEN
                )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        classes = self.request.data.get('classes', [])
        valid_classes = Class.objects.filter(
            id__in=classes,
            teacher=self.request.user
        )
        if len(classes) != valid_classes.count():
            raise serializers.ValidationError(
                "You can only create quizzes for your own classes"
            )
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        quiz = self.get_object()
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if start_date:
            quiz.start_date = start_date
        if end_date:
            quiz.end_date = end_date

        quiz.is_published = True
        quiz.save()
        
        return Response({'status': 'Quiz published'})

class QuizAttemptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        if self.request.user.role == 'teacher':
            return QuizAttempt.objects.filter(quiz__creator=self.request.user)
        return QuizAttempt.objects.filter(student=self.request.user)

    @action(detail=True, methods=['post'])
    def complete_session(self, request, pk=None):
        try:
            attempt = self.get_object()
            session_id = request.data.get('session_id')
            
            if not session_id:
                return Response(
                    {"message": "Session ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validasi attempt
            if attempt.student != request.user:
                return Response(
                    {"message": "Not authorized to complete this session"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validasi session
            session = attempt.quiz.sessions.filter(id=session_id).first()
            if not session:
                return Response(
                    {"message": "Session not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Record session completion
            SessionCompletion.objects.create(
                attempt=attempt,
                session=session,
                completed_at=timezone.now()
            )

            # Check if all sessions are completed
            total_sessions = attempt.quiz.sessions.count()
            completed_sessions = attempt.session_completions.count()
            
            if completed_sessions >= total_sessions:
                attempt.completed_at = timezone.now()
                attempt.save()

            return Response({
                "message": "Session completed successfully",
                "is_quiz_completed": completed_sessions >= total_sessions
            })

        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class QuizSessionViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSessionSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return QuizSession.objects.filter(quiz__creator=self.request.user)

    def create(self, request, *args, **kwargs):
        # Add validation for quiz ownership
        quiz_id = request.data.get('quiz')
        if not Quiz.objects.filter(id=quiz_id, creator=request.user).exists():
            return Response(
                {"detail": "Quiz not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return Question.objects.filter(session__quiz__creator=self.request.user)

    def create(self, request, *args, **kwargs):
        # Validate session ownership
        session_id = request.data.get('session')
        try:
            session = QuizSession.objects.get(
                id=session_id,
                quiz__creator=request.user
            )
        except QuizSession.DoesNotExist:
            return Response(
                {"detail": "Session not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )

        return super().create(request, *args, **kwargs)


