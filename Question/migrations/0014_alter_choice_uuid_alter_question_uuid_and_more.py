# Generated by Django 5.0.2 on 2024-03-26 10:26

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Question', '0013_alter_choice_uuid_alter_question_uuid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='choice',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('637fce7b-39d1-4fdf-b92f-d82c82ff5b7e'), editable=False),
        ),
        migrations.AlterField(
            model_name='question',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('7bcd0a54-5a4e-4d40-98cc-10a57e2e9dde'), editable=False),
        ),
        migrations.AlterField(
            model_name='questiontest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('67f82e18-232f-4030-b2c1-94f553e716c6'), editable=False),
        ),
        migrations.AlterField(
            model_name='useranswer',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('f5422608-7aa8-4def-bdac-5784b2e2075f'), editable=False),
        ),
    ]
