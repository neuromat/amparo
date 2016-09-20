from __future__ import unicode_literals

from django.db import models
from django.db.models import permalink
from django.utils.translation import ugettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields


class Page(TranslatableModel):
    """
    Class for the registration of the static pages

    '__unicode__'		Returns the title.
    'get_absolute_url'  Sets a URL for each page.
    """
    # The translated fields:
    translations = TranslatedFields(
        title=models.CharField(_('Title'), max_length=255),
        summary=models.TextField(_('Summary'), blank=True),
        body=models.TextField(_('Body'))
    )
    # Regular fields
    slug = models.SlugField(_('Slug'), max_length=100, unique=True)
    home_page = models.BooleanField(_('Home page?'), default=False,
                                     help_text=_('Enable this field if this is the home page'))
    enabled = models.BooleanField(_('Enabled?'), default=False,
                                  help_text=_('Pages that are not enabled will not be listed in menu.'))
    link_title = models.CharField(_('Link title'), max_length=100, blank=True)
    submenu = models.BooleanField(_('Submenu'), default=False, help_text=_('Enable this field if you want this link as '
                                                                           'a submenu of the main page link'))
    link_order = models.IntegerField(_('Position on the menu'), blank=True, null=True)
    glyphicon = models.CharField(max_length=100, blank=True,
                                 help_text=_('Put here the icon you want to use, e.g. glyphicon glyphicon-search'))
    posted = models.DateField(_('Posted'), auto_now_add=True)

    def __unicode__(self):
        return '%s' % self.title

    @permalink
    def get_absolute_url(self):
        return 'view_page', None, {'slug': self.slug}

    def save(self, *args, **kwargs):
        if self.home_page:
            try:
                pages = Page.objects.all()
                page_default = pages.get(home_page=True)
                if page_default:
                    page_default.home_page = False
                    page_default.save()
            except Page.DoesNotExist:
                pass
        super(Page, self).save(*args, **kwargs)

    class Meta:
        ordering = ('-posted', 'translations__title')
