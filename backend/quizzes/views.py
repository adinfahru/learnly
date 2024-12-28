from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from accounts.permissions import IsTeacher
from django.utils import timezone
from django.db import transaction

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
    
    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            # Validasi kelas
            classes = request.data.get('classes', [])
            valid_classes = Class.objects.filter(
                id__in=classes,
                teacher=request.user
            )
            
            if len(classes) != valid_classes.count():
                raise serializers.ValidationError(
                    "You can only create quizzes for your own classes"
                )

            # Persiapkan data dasar quiz
            quiz_data = request.data.copy()
            sessions_data = quiz_data.pop('sessions_data', None)
            
            # Buat quiz terpisah untuk setiap kelas
            quizzes = []
            for class_obj in valid_classes:
                # Buat salinan data untuk setiap quiz
                current_quiz_data = quiz_data.copy()
                current_quiz_data['classes'] = [class_obj.id]
                
                # Buat serializer untuk quiz ini
                serializer = self.get_serializer(data=current_quiz_data)
                serializer.is_valid(raise_exception=True)
                
                # Simpan quiz
                quiz = serializer.save()
                
                # Duplikasi sessions dan questions jika ada
                if sessions_data:
                    self._duplicate_sessions(quiz, sessions_data)
                
                quizzes.append(quiz)

            # Return data quiz pertama
            response_serializer = self.get_serializer(quizzes[0])
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def _duplicate_sessions(self, quiz, sessions_data):
        for session_data in sessions_data:
            # Buat session baru
            session = QuizSession.objects.create(
                quiz=quiz,
                name=session_data['name'],
                duration=session_data['duration'],
                order=session_data.get('order', 0)
            )
            
            # Duplikasi questions jika ada
            if 'questions' in session_data:
                for q_data in session_data['questions']:
                    question = Question.objects.create(
                        session=session,
                        text=q_data['text'],
                        order=q_data.get('order', 0)
                    )
                    
                    # Duplikasi options
                    if 'options' in q_data:
                        for opt_data in q_data['options']:
                            Option.objects.create(
                                question=question,
                                text=opt_data['text'],
                                is_correct=opt_data.get('is_correct', False),
                                order=opt_data.get('order', 0)
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

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        try:
            quiz = self.get_object()

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

            # Cek apakah sudah menyelesaikan quiz
            completed_attempt = QuizAttempt.objects.filter(
                quiz=quiz,
                student=request.user,
                completed_at__isnull=False
            ).first()

            if completed_attempt:
                return Response(
                    {"message": "You have already completed this quiz."}, 
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

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        quiz = self.get_object()
        
        # Validasi apakah quiz milik teacher yang request
        if quiz.creator != request.user:
            return Response(
                {"message": "You can only publish your own quizzes"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if start_date:
            quiz.start_date = start_date
        if end_date:
            quiz.end_date = end_date

        quiz.is_published = True
        quiz.save()
        
        return Response({'status': 'Quiz published'})

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """
        Get all submissions for a specific quiz.
        """
        try:
            quiz = self.get_object()
            
            # Verifikasi permissions
            if request.user.role == 'teacher' and quiz.creator != request.user:
                return Response(
                    {"message": "You don't have permission to view these submissions"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            elif request.user.role == 'student' and not quiz.classes.filter(students=request.user).exists():
                return Response(
                    {"message": "You don't have access to this quiz"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # Ambil semua attempts yang sudah selesai
            attempts = QuizAttempt.objects.filter(
                quiz=quiz,
                completed_at__isnull=False
            ).select_related('student')

            # Gunakan serializer khusus untuk submissions
            serializer = QuizSubmissionSerializer(attempts, many=True)
            
            return Response({
                'quiz_title': quiz.title,
                'total_submissions': attempts.count(),
                'submissions': serializer.data
            })

        except Exception as e:
            return Response(
                {"message": f"Error retrieving submissions: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get statistics for a specific quiz.
        """
        try:
            quiz = self.get_object()
            
            # Verifikasi permissions
            if request.user.role == 'teacher' and quiz.creator != request.user:
                return Response(
                    {"message": "You don't have permission to view these statistics"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # Ambil semua attempts yang sudah selesai
            completed_attempts = QuizAttempt.objects.filter(
                quiz=quiz,
                completed_at__isnull=False
            )

            # Hitung statistik
            total_attempts = completed_attempts.count()
            if total_attempts > 0:
                average_score = sum(attempt.score or 0 for attempt in completed_attempts) / total_attempts
                highest_score = max((attempt.score or 0) for attempt in completed_attempts)
                lowest_score = min((attempt.score or 0) for attempt in completed_attempts)
            else:
                average_score = 0
                highest_score = 0
                lowest_score = 0

            return Response({
                'total_attempts': total_attempts,
                'average_score': round(average_score, 2),
                'highest_score': highest_score,
                'lowest_score': lowest_score,
                'total_students': quiz.classes.all().aggregate(
                    total=models.Sum('student_count')
                )['total'] or 0
            })

        except Exception as e:
            return Response(
                {"message": f"Error retrieving statistics: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class QuizAttemptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling quiz attempts.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        """
        Filter quiz attempts based on the user's role.
        """
        if self.request.user.role == 'teacher':
            return QuizAttempt.objects.filter(quiz__creator=self.request.user)
        return QuizAttempt.objects.filter(student=self.request.user)

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """
        Submit an answer for a question in a quiz session.
        """
        try:
            attempt = self.get_object()
            session_id = request.data.get('session_id')
            question_id = request.data.get('question_id')
            option_id = request.data.get('option_id')

            # Validate required fields
            if not all([session_id, question_id, option_id]):
                return Response({
                    "message": "Missing required fields",
                    "received_data": request.data
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate attempt ownership
            if attempt.student != request.user:
                return Response(
                    {"message": "Not authorized"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get or create session attempt
            session_attempt, created = SessionAttempt.objects.get_or_create(
                quiz_attempt=attempt,
                session_id=session_id
            )

            # Create or update answer
            answer, created = Answer.objects.update_or_create(
                session_attempt=session_attempt,
                question_id=question_id,
                defaults={
                    'selected_option_id': option_id,
                    'is_correct': Option.objects.get(id=option_id).is_correct
                }
            )

            return Response({
                "status": "success",
                "is_correct": answer.is_correct
            })

        except Exception as e:
            return Response({
                "message": str(e),
                "received_data": request.data
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete_session(self, request, pk=None):
        """
        Mark a quiz session as complete and calculate the session score.
        """
        try:
            attempt = self.get_object()
            session_id = request.data.get('session_id')

            if not session_id:
                return Response({
                    "message": "Session ID is required",
                    "received_data": request.data
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate attempt ownership
            if attempt.student != request.user:
                return Response(
                    {"message": "Not authorized"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get current session attempt
            session_attempt = SessionAttempt.objects.get(
                quiz_attempt=attempt,
                session_id=session_id
            )

            # Calculate session score
            total_questions = session_attempt.answers.count()
            correct_answers = session_attempt.answers.filter(is_correct=True).count()
            session_score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

            # Update session attempt with score and completion time
            session_attempt.score = session_score
            session_attempt.completed_at = timezone.now()
            session_attempt.save()

            # Check if all sessions are completed
            total_sessions = attempt.quiz.sessions.count()
            completed_sessions = attempt.session_attempts.filter(completed_at__isnull=False).count()
            is_quiz_completed = total_sessions == completed_sessions

            if is_quiz_completed:
                # Calculate final score from all sessions
                total_score = sum(sa.score or 0 for sa in attempt.session_attempts.all())
                final_score = total_score / total_sessions if total_sessions > 0 else 0

                # Update attempt with final score and completion time
                attempt.score = final_score
                attempt.completed_at = timezone.now()
                attempt.save()

                return Response({
                    "status": "success",
                    "is_quiz_completed": True,
                    "final_score": final_score,
                    "session_score": session_score,
                    "total_questions": total_questions,
                    "correct_answers": correct_answers
                })

            return Response({
                "status": "success",
                "is_quiz_completed": False,
                "session_score": session_score,
                "total_questions": total_questions,
                "correct_answers": correct_answers
            })

        except SessionAttempt.DoesNotExist:
            return Response({
                "message": "Session attempt not found",
                "received_data": request.data
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "message": str(e),
                "received_data": request.data
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def student_attempt_details(self, request, pk=None):
        """
        Get detailed information about a student's quiz attempt.
        """
        try:
            attempt = self.get_object()

            # Check if the requester is the teacher of the quiz
            if request.user.role == 'teacher' and attempt.quiz.creator != request.user:
                return Response(
                    {"message": "You are not authorized to view this attempt."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Include session attempts and answers in the response
            session_attempts = attempt.session_attempts.all()
            session_data = []

            for session_attempt in session_attempts:
                answers = session_attempt.answers.all()
                answers_data = [
                    {
                        "question": answer.question.text,
                        "selected_option": answer.selected_option.text,
                        "is_correct": answer.is_correct
                    }
                    for answer in answers
                ]

                session_data.append({
                    "session": session_attempt.session.name,
                    "score": session_attempt.score,
                    "completed_at": session_attempt.completed_at,
                    "answers": answers_data
                })

            return Response({
                "student": attempt.student.username,
                "quiz": attempt.quiz.title,
                "final_score": attempt.score,
                "completed_at": attempt.completed_at,
                "session_attempts": session_data
            }, status=status.HTTP_200_OK)

        except QuizAttempt.DoesNotExist:
            return Response({"message": "Attempt not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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