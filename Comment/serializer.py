from rest_framework import serializers

from Comment.models import TestComment, ImageComment


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='id_user.username')

    class Meta:
        model = TestComment
        fields = ['id', 'content', 'created_at', 'username', 'id_parent']


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageComment
        fields = ['id', 'name', 'image', 'id_comment']
