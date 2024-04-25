# Generated by Django 5.0.2 on 2024-03-26 10:26

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Comment', '0002_likecomment_delete_commentreply'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='testcomment',
            name='id_parent',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='likecomment',
            name='id_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
    ]