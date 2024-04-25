from rest_framework import serializers
from .models import Test, Subject, DoTest, FavoriteTest


class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['id', 'name', 'description', 'numbers_of_questions', 'duration', 'id_subject', 'is_active', 'is_practice', 'created_at', 'updated_at']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'type']


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoTest
        fields = ['id', 'id_test', 'time_start', 'score']


class FavorSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteTest
        fields = ['id_test', 'is_active']
