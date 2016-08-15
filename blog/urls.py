from django.conf.urls import url
from blog import views


urlpatterns = [
    url(r'^$', views.index, name='view_blog_index'),
    url(r'^view/(?P<slug>[^\.]+).html', views.view_post, name='view_blog_post'),
    url(r'^category/(?P<slug>[^\.]+).html', views.view_category, name='view_blog_category'),
    url(r'^search/$', views.search_posts, name='blog_search'),
]
