# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import datetime
from embed_video.fields import EmbedVideoField

from django.db import models
from django.db.models import permalink
from django.utils.translation import ugettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields


class Category(models.Model):
    """
    An instance of this class is a category of the Blog

    '__unicode__'		Returns the title.
    'get_absolute_url'  Sets a URL to the category.
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
    An instance of this class is a post of the Blog

    '__unicode__'		Returns the title.
    'get_absolute_url'  Sets a URL to the post.
    'save'              Only one banner active.
    """
    # The translated fields:
    translations = TranslatedFields(
        title=models.CharField(_('Title'), max_length=255),
        body=models.TextField(_('Body'), blank=True),
        date_time=models.DateTimeField(_('Date/Time'), blank=True, null=True),
        resume_speaker=models.TextField(_('Resume of speaker'), blank=True),
        affiliation=models.CharField(_('Institutional affiliation'), max_length=255, blank=True),
    )
    # Regular fields
    speaker = models.CharField(_('Speaker'), max_length=255)
    moderator = models.CharField(_('Moderator'), max_length=255, blank=True)
    category = models.ForeignKey(Category, verbose_name=_('Category'), blank=True, null=True)
    slug = models.SlugField(_('Slug'), max_length=100, unique=True)
    image = models.FileField(_('Image'), upload_to='banner/%Y/%m/%d', blank=True, null=True)
    link_to_iptv = models.URLField(_('IPTV'), blank=True, null=True)
    link_to_google = models.URLField(_('Google'), blank=True, null=True)
    publish = models.BooleanField(_('Publish'), default=True)
    banner = models.BooleanField(_('Banner'), default=False)
    posted = models.DateField(_('Posted'), auto_now_add=True)

    def __unicode__(self):
        return '%s' % self.title

    def to_be_held(self):
        if self.date_time.date() >= datetime.date.today():
            return True
        return False

    def show_video(self):
        tz_info = self.date_time.tzinfo
        if self.date_time <= datetime.datetime.now(tz_info):
            return True
        return False

    def save(self, *args, **kwargs):
        if self.banner and self.publish:
            try:
                posts = Blog.objects.all()
                latest_banner = posts.get(banner=True, publish=True)
                if latest_banner:
                    latest_banner.banner = False
                    latest_banner.save()
            except Blog.DoesNotExist:
                pass
        elif self.banner and not self.publish:
            try:
                posts = Blog.objects.all()
                latest_banner = posts.get(banner=True, publish=False)
                if latest_banner:
                    latest_banner.banner = False
                    latest_banner.save()
            except Blog.DoesNotExist:
                pass
        super(Blog, self).save(*args, **kwargs)

    class Meta:
        ordering = ('-posted', 'translations__title')
        permissions = (
            ("view_private_posts", "Can view private posts"),
        )


class LectureVideo(models.Model):
    blog_post = models.ForeignKey(Blog, related_name="videos",)
    video = EmbedVideoField(_('Video'), blank=True, null=True)

    class Meta:
        verbose_name = _('Video')
        verbose_name_plural = _('Videos')