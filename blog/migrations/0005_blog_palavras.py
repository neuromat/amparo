# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2021-04-22 11:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0001_initial'),
        ('blog', '0004_lecturefile'),
    ]

    operations = [
        migrations.AddField(
            model_name='blog',
            name='palavras',
            field=models.ManyToManyField(to='search.PalavraChave'),
        ),
    ]
