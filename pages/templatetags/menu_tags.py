from django import template

from pages.models import Page

register = template.Library()


@register.assignment_tag
def get_pages():
    """
    Check the pages that need to be listed in menu.

    :return:    Pages
    """
    links = Page.objects.active_translations()
    links = links.filter(enabled=True).order_by('link_order')
    return links
