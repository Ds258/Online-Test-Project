# Generated by Django 5.0.2 on 2024-03-29 03:00

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Question', '0016_alter_choice_uuid_alter_question_uuid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='choice',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('bae8f5f0-1967-4c5d-9792-0f3bf9801aac'), editable=False),
        ),
        migrations.AlterField(
            model_name='question',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('6491ab1a-7723-464f-8bf7-6280cb44dab3'), editable=False),
        ),
        migrations.AlterField(
            model_name='questiontest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('8dc989a3-7656-4f89-b47f-0cd493179f7d'), editable=False),
        ),
        migrations.AlterField(
            model_name='useranswer',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('ac918225-bfc0-46ff-9f6c-f960352f3f7f'), editable=False),
        ),
    ]
