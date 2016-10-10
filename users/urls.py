from django.conf.urls import url
from users import views


urlpatterns = [
    url(r'^$', views.list_of_users, name='list_of_users'),
    url(r'^send_email', views.send_email_to_users, name='send_email'),
]
