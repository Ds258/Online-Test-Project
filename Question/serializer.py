from rest_framework import serializers
from .models import Question, Choice, QuestionTest, QuestionHint, UserAnswer, QuestionSolution


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'name', 'rtf', 'id_subject', 'is_active', 'created_at']


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'content', 'rtf', 'id_question', 'is_true']
        

class HintSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionHint
        fields = ['id', 'content', 'rtf', 'image', 'id_question']


class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionSolution
        fields = ['id', 'content', 'rtf', 'image', 'id_question']


class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = ['id_choice']

