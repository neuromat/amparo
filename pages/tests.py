# -*- coding: utf-8 -*-
import datetime

from django.core.urlresolvers import reverse
from django.test import TestCase

from blog.tests import ObjectsFactory
from pages.models import Page


class PageTests(TestCase):

    def setUp(self):
        logged, self.user, self.factory = ObjectsFactory.system_authentication(self)
        self.assertEqual(logged, True)

        title = 'Título do página'
        body = 'Mussum ipsum cacilds, vidis litro abertis. Consetis adipiscings elitis. Pra lá , depois divoltis ' \
               'porris, paradis. Paisis, filhis, espiritis santis.'
        posted = datetime.datetime.now().date()

        Page.objects.create(title=title, slug='slug01', body=body, posted=posted, home_page=True)
        Page.objects.create(title=title, slug='slug02', body=body, posted=posted, home_page=False)

    def test_view_page(self):
        """
        Testing the creation of pages
        """
        response = self.client.get(reverse('view_page', args=(Page.objects.get(slug='slug01').slug,)))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Page.objects.all()), 2)

        # Testing the home page
        self.assertEqual(len(Page.objects.filter(home_page=True)), 1)
