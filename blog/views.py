# -*- coding: utf-8 -*-
import datetime
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from models import Blog, Category
from parler.utils import get_active_language_choices


def index(request):
    """
    Função que gera a lista de posts do blog.
    Gerar a paginação de acordo com o número definido na variável "number_of_posts".

    :return:        Retorna os posts do blog
    """
    next_lectures = Blog.objects.filter(
        translations__language_code__in=get_active_language_choices(),
        translations__date_time__gt=datetime.datetime.now()
    ).order_by('translations__date_time')

    next_lectures_ids = next_lectures.values_list('pk', flat=True)

    blog_list = Blog.objects.active_translations().exclude(pk__in=next_lectures_ids)
    number_of_posts = 4
    paginator = Paginator(blog_list, number_of_posts)
    page = request.GET.get('page')

    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        # Se a página não é um inteiro, mostrar a primeira página.
        posts = paginator.page(1)
    except EmptyPage:
        # Se a página está fora do intervalo (por exemplo 9999), mostrar a última página de resultados.
        posts = paginator.page(paginator.num_pages)

    context = {'posts': posts, 'next_lectures': next_lectures}

    return render(request, 'blog/blog.html', context)


def search_posts(request):
    """
    Função para buscar posts no site

    :return:        Retorna lista de posts ou mensagem de erro se nenhum post for encontrado
    """
    if request.user.is_authenticated() and request.user.has_perm('blog.view_private_posts'):
        list_of_posts = Blog.objects.active_translations()
    else:
        list_of_posts = Blog.objects.active_translations(publish=True)

    query = request.GET.get("search_box")

    if query:
        list_of_posts = list_of_posts.filter(Q(translations__title__icontains=query) |
                                             Q(translations__body__icontains=query))

    context = {"posts": list_of_posts}

    return render(request, 'blog/search.html', context)
