from rest_framework import serializers
from .models import Quiz, QuizSession, Question, Option, Answer, SessionAttempt, QuizAttempt
from classes.models import Class

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct', 'order']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)
    session = serializers.PrimaryKeyRelatedField(queryset=QuizSession.objects.all())

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'options', 'session']

    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        return question

class QuizSessionSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)  # Set read_only=True
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all())

    class Meta:
        model = QuizSession
        fields = ['id', 'name', 'duration', 'order', 'questions', 'quiz']
        read_only_fields = ['id']

    def create(self, validated_data):
        return QuizSession.objects.create(**validated_data)

class QuizSerializer(serializers.ModelSerializer):
    sessions = QuizSessionSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()

    creator = serializers.HiddenField(default=serializers.CurrentUserDefault())
    classes = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Class.objects.all(),
        required=False
    )

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'creator', 'classes',
            'is_published', 'randomize_questions', 'show_result',
            'show_answers', 'start_date', 'end_date', 'sessions',
            'total_questions', 'total_duration'
        ]
        read_only_fields = ['creator', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        classes = validated_data.pop('classes', [])
        quizzes = []
        
        # Buat quiz terpisah untuk setiap kelas
        for class_obj in classes:
            quiz_data = validated_data.copy()
            quiz = Quiz.objects.create(**quiz_data)
            quiz.classes.add(class_obj)
            quizzes.append(quiz)
            
        # Return quiz pertama sebagai response
        return quizzes[0] if quizzes else Quiz.objects.create(**validated_data)

    def get_total_questions(self, obj):
        return sum(session.questions.count() for session in obj.sessions.all())

    def get_total_duration(self, obj):
        return sum(session.duration for session in obj.sessions.all())

class AnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()
    selected_option = OptionSerializer()
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'selected_option', 'is_correct']

class SessionAttemptSerializer(serializers.ModelSerializer):
    session = QuizSessionSerializer()
    answers = AnswerSerializer(many=True)
    
    class Meta:
        model = SessionAttempt
        fields = [
            'id',
            'session',
            'started_at',
            'completed_at',
            'score',
            'answers'
        ]

class QuizAttemptSerializer(serializers.ModelSerializer):
    session_attempts = SessionAttemptSerializer(many=True)
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 
            'quiz', 
            'student', 
            'student_name', 
            'student_email', 
            'started_at', 
            'completed_at', 
            'score', 
            'session_attempts'
        ]
    
    def get_student_name(self, obj):
        # Mendapatkan nama lengkap student
        return f"{obj.student.first_name} {obj.student.last_name}".strip()
    
    def get_student_email(self, obj):
        # Mendapatkan email student
        return obj.student.email


class QuizSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    submission_date = serializers.DateTimeField(source='completed_at')
    class_id = serializers.SerializerMethodField()  # Menggunakan class_id

    class Meta:
        model = QuizAttempt
        fields = [
            'id',
            'quiz',
            'student_name',
            'student_email',
            'score',
            'submission_date',
            'class_id'  # Mengubah dari class_code ke class_id
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}".strip()
    
    def get_student_email(self, obj):
        return obj.student.email

    def get_class_id(self, obj):
        # Mendapatkan ID kelas yang terhubung dengan quiz
        classes = obj.quiz.classes.filter(students=obj.student)
        if classes.exists():
            return classes.first().id  # Ambil ID kelas pertama jika ada
        return None

    
class QuizDetailWithSubmissionsSerializer(serializers.ModelSerializer):
    submissions = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'description',
            'is_published',
            'submissions'
        ]

    def get_submissions(self, obj):
        # Ambil class_id dari context serializer
        class_id = self.context.get('class_id', None)
        if class_id:
            # Filter attempts berdasarkan siswa yang terdaftar di kelas dengan id tertentu
            return QuizSubmissionSerializer(
                obj.attempts.filter(student__enrolled_classes__id=class_id),
                many=True
            ).data
        # Jika tidak ada class_id, kembalikan semua submissions
        return QuizSubmissionSerializer(obj.attempts.all(), many=True).data

