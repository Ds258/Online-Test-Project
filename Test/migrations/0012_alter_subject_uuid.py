# Generated by Django 5.0.2 on 2024-03-26 10:26

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Test', '0011_alter_subject_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subject',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('2b1c77c2-c53a-48f0-aca3-2650ca006cfc'), editable=False),
        ),
    ]
