from django import template
from django.conf import settings

from blog.models import Blog

register = template.Library()


@register.simple_tag
def settings_value(name):
    return getattr(settings, name, "")


@register.assignment_tag
def get_posts():
    """
    Check if the blog app is being used

    :return:    Blog entries
    """
    return Blog.objects.exclude(category__slug='banner')
