# Generated by Django 5.0.2 on 2024-03-26 08:23

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Question', '0010_alter_choice_uuid_alter_question_uuid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='choice',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('ef53b8df-e27c-418d-87f2-1f8844319368'), editable=False),
        ),
        migrations.AlterField(
            model_name='question',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('304cdcaa-79d8-46b2-955f-3437379d200a'), editable=False),
        ),
        migrations.AlterField(
            model_name='questiontest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('1d9a721f-c785-496c-bac3-53a252082792'), editable=False),
        ),
        migrations.AlterField(
            model_name='useranswer',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('9e039852-d080-40ca-af59-4fd87c15621e'), editable=False),
        ),
    ]
