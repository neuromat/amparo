# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2021-04-22 11:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PalavraChave',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('palavra', models.CharField(max_length=100)),
            ],
        ),
    ]
