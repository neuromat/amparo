# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from embed_video.fields import EmbedVideoField

from django.db import models
from django.db.models import permalink
from django.utils.translation import ugettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields


class Category(models.Model):
    """
    Classe para cadastro de categorias de um Blog

    '__unicode__'		Retorna o título.
    'get_absolute_url'  Define uma URL para cada categoria.
    """
    title = models.CharField(_('Title'), max_length=255)
    slug = models.SlugField(_('Slug'), max_length=100, unique=True)

    def __unicode__(self):
        return '%s' % self.title

    @permalink
    def get_absolute_url(self):
        return 'view_blog_category', None, {'slug': self.slug}

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        ordering = ('title', )


class Blog(TranslatableModel):
    """
    Classe para cadastro de um post no Blog

    '__unicode__'		Retorna o título.
    'get_absolute_url'  Define uma URL para cada post do blog.
    """
    # The translated fields:
    translations = TranslatedFields(
        title=models.CharField(_('Title'), max_length=255),
        body=models.TextField(_('Body'), blank=True),
        local=models.CharField(_('Local'), max_length=255, blank=True),
        date_time=models.DateTimeField(_('Date/Time'), blank=True, null=True),
        video=EmbedVideoField(_('Video'), blank=True, null=True),
        url=models.URLField(_('URL'), blank=True, null=True),
    )
    # Regular fields
    speaker = models.CharField(_('Speaker'), max_length=255)
    resume_speaker = models.TextField(_('Resume of speaker'), blank=True)
    moderator = models.CharField(_('Moderator'), max_length=255, blank=True)
    category = models.ForeignKey(Category, verbose_name=_('Category'), blank=True, null=True)
    slug = models.SlugField(_('Slug'), max_length=100, unique=True)
    image = models.FileField(_('Image'), upload_to='banner/%Y/%m/%d', blank=True, null=True)
    publish = models.BooleanField(_('Publish'), default=True)
    posted = models.DateField(_('Posted'), auto_now_add=True)

    def __unicode__(self):
        return '%s' % self.title

    @permalink
    def get_absolute_url(self):
        return 'view_blog_post', None, {'slug': self.slug}

    class Meta:
        ordering = ('-posted', 'translations__title')
        permissions = (
            ("view_private_posts", "Can view private posts"),
        )
