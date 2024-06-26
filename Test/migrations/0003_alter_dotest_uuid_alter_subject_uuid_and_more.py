# Generated by Django 5.0.2 on 2024-03-11 03:42

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Test', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dotest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('7a7ff961-b672-4425-a4e8-25117137ef7f'), editable=False),
        ),
        migrations.AlterField(
            model_name='subject',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('633cc6f8-4718-4949-9ef8-465972e6dff4'), editable=False),
        ),
        migrations.AlterField(
            model_name='test',
            name='numbers_of_questions',
            field=models.IntegerField(blank=True),
        ),
    ]
