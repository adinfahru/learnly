# Generated by Django 5.1.3 on 2024-12-05 18:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('teacher', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='class',
            old_name='description',
            new_name='subject',
        ),
    ]
