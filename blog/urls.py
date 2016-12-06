from django.conf.urls import url
from blog import views


urlpatterns = [
    url(r'^$', views.index, name='view_blog_index'),
    url(r'^search/$', views.search_posts, name='blog_search'),
]
