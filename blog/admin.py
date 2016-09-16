from django.contrib import admin
from parler.admin import TranslatableAdmin

from models import Blog, Category, LectureVideo


class LectureVideoInline(admin.TabularInline):
    model = LectureVideo
    extra = 1


class BlogAdmin(TranslatableAdmin):
    fieldsets = (
        (None, {
            'fields': ['category', 'title', 'slug', 'body', 'speaker', 'image', 'resume_speaker', 'affiliation',
                       'moderator', 'date_time', 'link_to_iptv', 'publish', 'banner']
        }),
    )
    exclude = ['posted']
    list_display = ('title', 'speaker', 'date_time', 'publish', 'banner')
    list_display_links = ('title', )
    search_fields = ['translations__title', 'speaker']
    inlines = (LectureVideoInline,)

    def get_prepopulated_fields(self, request, obj=None):
        # Can't use prepopulated_fields= yet, but this is a workaround.
        return {'slug': ('title',)}


class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('title',)}

admin.site.register(Blog, BlogAdmin)
admin.site.register(Category, CategoryAdmin)
