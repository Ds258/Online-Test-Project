from django.db import models
import uuid
from django.utils import timezone
from Test.models import Test, Subject, DoTest
from User.models import Profile, User


# Create your models here.
class Question(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4(), editable=False)
    name = models.TextField(blank=False)
    rtf = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    id_subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    test = models.ManyToManyField(Test, through='QuestionTest')

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_name(self):
        return self.name


class QuestionHint(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    content = models.TextField(blank=True)
    rtf = models.TextField(blank=True)
    image = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    id_question = models.ForeignKey(Question, on_delete=models.CASCADE, default=None)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.content


class QuestionSolution(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    content = models.TextField(blank=True)
    rtf = models.TextField(blank=True)
    image = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    id_question = models.ForeignKey(Question, on_delete=models.CASCADE, default=None)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.content


class Choice(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4(), editable=False)
    content = models.TextField(blank=False)
    rtf = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_true = models.BooleanField(default=False)
    id_question = models.ForeignKey(Question, on_delete=models.CASCADE, default=None)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.content

    def get_is_true(self):
        return self.is_true

    def set_is_true(self, is_true):
        self.is_true = is_true


class QuestionTest(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4(), editable=False)
    id_question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='question')
    id_test = models.ForeignKey(Test, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.id_test.get_name() + " - " + self.id_question.get_name()
        # return str(self.id_question)

    def get_question(self):
        return self.id_question.get_name()

    def recount_test_question_number(self):
        self.id_test.numbers_of_questions = QuestionTest.objects.filter(id_test=self.id_test).count()
        self.id_test.save()

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
        self.recount_test_question_number()


class UserAnswer(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4(), editable=False)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE, default=None)
    id_do_test = models.ForeignKey(DoTest, on_delete=models.CASCADE, default=None)
    id_choice = models.ForeignKey(Choice, on_delete=models.CASCADE, default=None)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
