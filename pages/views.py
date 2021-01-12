from django.shortcuts import render, get_object_or_404
from .models import Page


def view_page(request, slug):
    """
    Function that displays the contents of a static page.

    :return:    Returns the page content
    """
    context = {'page': get_object_or_404(Page, slug=slug)}
    return render(request, 'pages/view_page.html', context)
