# Generated by Django 5.0.2 on 2024-03-26 10:26

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Test', '0012_alter_subject_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subject',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('eacd09e5-a4f3-47d0-b74d-8b68adfbecc7'), editable=False),
        ),
    ]
