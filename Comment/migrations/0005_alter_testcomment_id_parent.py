# Generated by Django 5.0.2 on 2024-03-26 10:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Comment', '0004_alter_testcomment_id_parent'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testcomment',
            name='id_parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='replies', to='Comment.testcomment'),
        ),
    ]
