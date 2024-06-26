# Generated by Django 5.0.2 on 2024-03-11 09:30

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Test', '0003_alter_dotest_uuid_alter_subject_uuid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dotest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('1adec8e6-a8b5-4056-a5d4-9e7f4292737f'), editable=False),
        ),
        migrations.AlterField(
            model_name='subject',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('bb6c077b-4ccc-4445-b89b-1541ef137dae'), editable=False),
        ),
    ]
