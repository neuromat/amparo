# -*- coding: utf-8 -*-
import datetime

from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.test import TestCase
from django.test.client import RequestFactory

from .models import Blog


USER_USERNAME = 'myadmin'
USER_PWD = 'mypassword'


class ObjectsFactory(object):

    @staticmethod
    def system_authentication(instance):
        user = User.objects.create_user(username=USER_USERNAME, email='test@dummy.com', password=USER_PWD)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        factory = RequestFactory()
        logged = instance.client.login(username=USER_USERNAME, password=USER_PWD)
        return logged, user, factory

    @staticmethod
    def create_post(title, slug, body, posted):
        """
        Criar post no blog
        :return: post
        """
        post = Blog.objects.create(title=title, slug=slug, body=body, posted=posted)
        post.save()
        return post


class BlogTests(TestCase):

    def setUp(self):
        logged, self.user, self.factory = ObjectsFactory.system_authentication(self)
        self.assertEqual(logged, True)

        title = 'Título do post'
        body = 'Mussum ipsum cacilds, vidis litro abertis. Consetis adipiscings elitis. Pra lá , depois divoltis ' \
               'porris, paradis. Paisis, filhis, espiritis santis.'
        posted = datetime.datetime.now().date()

        ObjectsFactory.create_post(title, 'titulo-do-post', body, posted)
        ObjectsFactory.create_post(title, 'titulo-do-post-02', body, posted)

    def test_view_blog_index(self):
        """
        Testa visualização dos posts do blog
        """
        response = self.client.get(reverse('view_blog_index'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Blog.objects.all()), 2)

    def test_view_blog_post(self):
        """
        Testa visualização de um determinado post
        """
        post = ObjectsFactory.create_post('titulo', 'outro-titulo', 'body', datetime.datetime.now().date())
        response = self.client.get(reverse('view_blog_post', kwargs={'slug': 'outro-titulo'}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(get_object_or_404(Blog, slug='outro-titulo'), post)
