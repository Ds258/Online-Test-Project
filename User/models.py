from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
import uuid


# Create your models here.
class User(AbstractUser):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class Profile(models.Model):
    REQUIRED_FIELDS = ('user',)

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    gender = models.CharField(max_length=50, choices=Gender.choices, blank=True)
    phone_number = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)
    school = models.CharField(max_length=50, blank=True)
    is_student = models.BooleanField(default=True)
    is_teacher = models.BooleanField(default=False)
    id_user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.id_user.username

    def get_uuid(self):
        return self.uuid

    def get_gender(self):
        return self.gender

    def set_gender(self, gender):
        self.gender = gender
        self.save()

    def get_phone_number(self):
        return self.phone_number

    def set_phone_number(self, phone_number):
        self.phone_number = phone_number
        self.save()

    def get_address(self):
        return self.address

    def set_address(self, address):
        self.address = address
        self.save()

    def get_dob(self):
        return self.dob

    def set_dob(self, dob):
        self.dob = dob
        self.save()

    def get_school(self):
        return self.school

    def set_school(self, school):
        self.school = school
        self.save()

    def get_created_at(self):
        return self.created_at

    def get_updated_at(self):
        return self.updated_at
