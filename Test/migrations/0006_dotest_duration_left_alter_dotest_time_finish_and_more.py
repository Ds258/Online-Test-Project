# Generated by Django 5.0.2 on 2024-03-14 09:06

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Test', '0005_dotest_time_expire_alter_dotest_uuid_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='dotest',
            name='duration_left',
            field=models.DurationField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='dotest',
            name='time_finish',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='dotest',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('666250ad-3e98-44e3-be87-e9eb81148665'), editable=False),
        ),
        migrations.AlterField(
            model_name='subject',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('cbef5fb7-a2a0-4be8-a4fa-eeaf612cee30'), editable=False),
        ),
    ]