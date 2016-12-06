# -*- coding: utf-8 -*-
import datetime

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.test import TestCase
from django.test.client import RequestFactory

from .models import Blog
from users.models import Type

USER_USERNAME = 'myadmin'
USER_EMAIL = 'test@dummy.com'
USER_PWD = 'mypassword'


class ObjectsFactory(object):

    @staticmethod
    def system_authentication(instance):
        type_of_person = Type.objects.create(name='Profissional')
        user = get_user_model()
        user = user.objects.create_user(username=USER_USERNAME, email=USER_EMAIL, password=USER_PWD,
                                        type_of_person=type_of_person)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        factory = RequestFactory()
        logged = instance.client.login(email=USER_EMAIL, password=USER_PWD)
        return logged, user, factory

    @staticmethod
    def create_post(title, slug, body, posted, speaker, publish, banner):
        """
        Criar post no blog
        :return: post
        """
        post = Blog.objects.create(title=title, slug=slug, body=body, posted=posted, speaker=speaker, publish=publish,
                                   banner=banner)
        post.save()
        return post


class BlogTests(TestCase):

    def setUp(self):
        logged, self.user, self.factory = ObjectsFactory.system_authentication(self)
        self.assertEqual(logged, True)

        title = 'Título do post'
        body = 'Mussum ipsum cacilds, vidis litro abertis. Consetis adipiscings elitis. Pra lá , depois divoltis ' \
               'porris, paradis. Paisis, filhis, espiritis santis.'
        speaker = 'Fulano de Tal'
        posted = datetime.datetime.now().date()

        ObjectsFactory.create_post(title, 'titulo-do-post', body, posted, speaker, True, True)
        ObjectsFactory.create_post(title, 'titulo-do-post-02', body, posted, speaker, True, False)

    def test_view_blog_index(self):
        """
        Testing the home page
        """
        response = self.client.get(reverse('view_blog_index'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Blog.objects.filter(banner=True)), 1)

