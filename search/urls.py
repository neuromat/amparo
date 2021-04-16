from django.conf.urls import url
from search import views


urlpatterns = [
    url(r'^findresults/$', views.findresults, name='findresults'),
]
