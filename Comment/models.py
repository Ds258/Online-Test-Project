from django.db import models
import uuid

from django.utils import timezone

from Test.models import Test
from User.models import User


# Create your models here.
class TestComment(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    content = models.TextField(blank=True, null=True)
    id_test = models.ForeignKey(Test, on_delete=models.CASCADE)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE)
    id_parent = models.ForeignKey("self", blank=True, null=True, related_name="replies", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.content


class LikeComment(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    like = models.BooleanField(default=True)
    id_comment = models.ForeignKey(TestComment, on_delete=models.CASCADE)
    id_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)


class ImageComment(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, blank=True)
    image = models.TextField(blank=True)
    id_comment = models.ForeignKey(TestComment, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
