# Generated by Django 5.0.2 on 2024-03-20 09:12

import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Test', '0007_alter_dotest_uuid_alter_subject_uuid_favouritetest'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name='FavouriteTest',
            new_name='FavoriteTest',
        ),
        migrations.AlterField(
            model_name='subject',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('d8d5412b-0d2b-4ec8-8fcd-b61a3a3f29e3'), editable=False),
        ),
    ]
