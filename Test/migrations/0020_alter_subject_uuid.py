# Generated by Django 5.0.3 on 2024-04-15 07:24

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Test', '0019_alter_subject_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subject',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('72264de9-0846-4dec-8df5-8a848c3ffc81'), editable=False),
        ),
    ]
