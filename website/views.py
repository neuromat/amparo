from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import activate, LANGUAGE_SESSION_KEY

from blog.models import Blog
from pages.models import Page


def index(request):
    # Search banner
    try:
        current_banner = Blog.objects.filter(banner=True, publish=True)
    except Blog.DoesNotExist:
        current_banner = False

    # Search home page
    try:
        home_page = Page.objects.get(home_page=True)
    except Page.DoesNotExist:
        home_page = False

    context = {'current_banner': current_banner, 'home_page': home_page}
    return render(request, 'main/default.html', context)


def language_change(request, language_code):
    activate(language_code)
    request.session[LANGUAGE_SESSION_KEY] = language_code

    return HttpResponseRedirect(request.GET['next'])
