from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from parler.admin import TranslatableAdmin

from models import Page


class PageAdmin(TranslatableAdmin):
    fieldsets = (
        (None, {
            'fields': ['title', 'slug', 'body', 'home_page', 'enabled', 'link_title', 'submenu', 'link_order',
                       'glyphicon']
        }),
        (_('Edit summary'), {
            'classes': ('collapse',),
            'fields': ('summary',),
        }),
    )
    list_display = ('title', 'home_page', 'enabled', 'link_order', 'submenu')
    exclude = ['posted']

    def get_prepopulated_fields(self, request, obj=None):
        # Can't use prepopulated_fields= yet, but this is a workaround.
        return {'slug': ('title',)}

admin.site.register(Page, PageAdmin)
