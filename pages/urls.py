from django.conf.urls import url
from pages import views


urlpatterns = [
    url(r'^(?P<slug>[^\.]+)', views.view_page, name='view_page'),
]
