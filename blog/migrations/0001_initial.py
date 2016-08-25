# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-08-25 15:40
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import embed_video.fields
import parler.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Blog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('speaker', models.CharField(max_length=255, verbose_name='Speaker')),
                ('moderator', models.CharField(blank=True, max_length=255, verbose_name='Moderator')),
                ('slug', models.SlugField(max_length=100, unique=True, verbose_name='Slug')),
                ('image', models.FileField(blank=True, null=True, upload_to='banner/%Y/%m/%d', verbose_name='Image')),
                ('publish', models.BooleanField(default=True, verbose_name='Publish')),
                ('banner', models.BooleanField(default=False, verbose_name='Banner')),
                ('posted', models.DateField(auto_now_add=True, verbose_name='Posted')),
            ],
            options={
                'ordering': ('-posted', 'translations__title'),
                'permissions': (('view_private_posts', 'Can view private posts'),),
            },
            bases=(parler.models.TranslatableModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='BlogTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_index=True, max_length=15, verbose_name='Language')),
                ('title', models.CharField(max_length=255, verbose_name='Title')),
                ('body', models.TextField(blank=True, verbose_name='Body')),
                ('date_time', models.DateTimeField(blank=True, null=True, verbose_name='Date/Time')),
                ('resume_speaker', models.TextField(blank=True, verbose_name='Resume of speaker')),
                ('resume_summary', models.TextField(blank=True, verbose_name='Summary of the resume')),
                ('master', models.ForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE,
                                             related_name='translations', to='blog.Blog')),
            ],
            options={
                'managed': True,
                'db_table': 'blog_blog_translation',
                'db_tablespace': '',
                'default_permissions': (),
                'verbose_name': 'blog Translation',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Title')),
                ('slug', models.SlugField(max_length=100, unique=True, verbose_name='Slug')),
            ],
            options={
                'ordering': ('title',),
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='LectureVideo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video', embed_video.fields.EmbedVideoField(blank=True, null=True, verbose_name='Video')),
                ('blog_post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='blog.Blog')),
            ],
            options={
                'verbose_name': 'Video',
                'verbose_name_plural': 'Videos',
            },
        ),
        migrations.AddField(
            model_name='blog',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE,
                                    to='blog.Category', verbose_name='Category'),
        ),
        migrations.AlterUniqueTogether(
            name='blogtranslation',
            unique_together=set([('language_code', 'master')]),
        ),
    ]
