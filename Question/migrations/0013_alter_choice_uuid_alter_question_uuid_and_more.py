# Generated by Django 5.0.2 on 2024-03-26 10:26

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Question', '0012_alter_choice_uuid_alter_question_uuid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='choice',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('b947acd1-bce2-4aad-b6ef-d7e2a6f62b04'), editable=False),
        ),
        migrations.AlterField(
            model_name='question',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('a8ec7f8d-0920-4783-bc2c-3b228cd29962'), editable=False),
        ),
        migrations.AlterField(
            model_name='questiontest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('b98db5d8-8f14-4352-96b1-f25b73452a28'), editable=False),
        ),
        migrations.AlterField(
            model_name='useranswer',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('bde1402c-ae92-49ed-8a87-4e2e6e65903e'), editable=False),
        ),
    ]
