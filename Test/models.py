from datetime import datetime

from django.db import models
import uuid
from django.utils import timezone

from User.models import Profile, User


# Create your models here.
class Subject(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4(), editable=False)
    type = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.type


class Test(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.TextField(blank=False, default=None)
    description = models.TextField(blank=True)
    numbers_of_questions = models.IntegerField(blank=True)
    duration = models.DurationField(default=3600)
    id_subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    id_user_create = models.ForeignKey(User, on_delete=models.CASCADE, related_name='_create')
    is_practice = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    user = models.ManyToManyField(User, through='DoTest')

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_name(self):
        return self.name

    def getUUID(self):
        return self.uuid

    # def get_number_question(self):
    # return self.numbers_of_questions
    # from Question.models import QuestionTest

    # return QuestionTest.objects.filter(id_test=self).count()

    def getIsPractice(self):
        return self.is_practice

    def getDuration(self):
        return self.duration


class DoTest(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    id_test = models.ForeignKey(Test, on_delete=models.CASCADE)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE)
    time_start = models.DateTimeField(auto_now_add=True, null=True)
    time_finish = models.DateTimeField(blank=True, null=True)
    time_expire = models.DateTimeField(blank=True, null=True)
    duration_left = models.DurationField(blank=True, null=True)
    score = models.FloatField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def getTimeStart(self):
        return self.time_start

    def getUUID(self):
        return self.uuid


class FavoriteTest(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    id_test = models.ForeignKey(Test, on_delete=models.CASCADE)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)


