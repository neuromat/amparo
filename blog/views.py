# -*- coding: utf-8 -*-
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from models import Blog, Category


def index(request):
    """
    Função que gera a lista de posts do blog.
    Gerar a paginação de acordo com o número definido na variável "number_of_posts".

    :return:        Retorna os posts do blog
    """
    blog_list = Blog.objects.active_translations()
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

    context = {'posts': posts}

    return render(request, 'blog/blog.html', context)


def view_post(request, slug):
    """
    Função que mostra o conteúdo de um post.

    :return:        Retorna o conteúdo do post
    """
    context = {'post': get_object_or_404(Blog, slug=slug)}
    return render(request, 'blog/view_post.html', context)


def view_category(request, slug):
    category = get_object_or_404(Category, slug=slug)
    posts = Blog.objects.filter(category=category)[:5]
    context = {'category': category, 'posts': posts}

    return render(request, 'blog/view_category.html', context)


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
