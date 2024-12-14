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
        quiz = Quiz.objects.create(**validated_data)
        quiz.classes.set(classes)
        return quiz

    def get_total_questions(self, obj):
        return sum(session.questions.count() for session in obj.sessions.all())

    def get_total_duration(self, obj):
        return sum(session.duration for session in obj.sessions.all())


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student', 'started_at', 'completed_at', 'score']
        read_only_fields = ['started_at', 'completed_at', 'score']