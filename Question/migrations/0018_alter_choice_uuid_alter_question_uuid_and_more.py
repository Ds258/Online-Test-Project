# Generated by Django 5.0.3 on 2024-04-01 04:13

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Question', '0017_alter_choice_uuid_alter_question_uuid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='choice',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('089f5e78-7ef3-418e-bdce-8afbf5dfb8a2'), editable=False),
        ),
        migrations.AlterField(
            model_name='question',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('ecdaa2d7-52b2-4c4b-b476-81d3eaa72126'), editable=False),
        ),
        migrations.AlterField(
            model_name='questiontest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('ba75953f-109f-4847-86d0-8cfb05082045'), editable=False),
        ),
        migrations.AlterField(
            model_name='useranswer',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('3602e1d9-c7d6-48f9-a19b-cf41a31028d7'), editable=False),
        ),
    ]
