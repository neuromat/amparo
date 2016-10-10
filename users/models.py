from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import ugettext_lazy as _


class Type(models.Model):
    """
    An instance of this class is a type of person.
    '__unicode__'		Returns the name.
    'class Meta'		Sets the description (singular and plural) model and the ordering of data by name.
    """
    name = models.CharField(_('Name'), max_length=50)

    def __unicode__(self):
        return u'%s' % self.name

    class Meta:
        verbose_name = _('Type')
        verbose_name_plural = _('Types')
        ordering = ('name', )


class CustomUser(AbstractUser):
    type_of_person = models.ForeignKey(Type, verbose_name=_('I am'), null=True)
    token_id = models.CharField(max_length=10, blank=True)
    token = models.CharField(max_length=15, blank=True)
    survey_completed = models.BooleanField(default=False)

    # to enforce that you require email field to be associated with every user at registration
    REQUIRED_FIELDS = ["email"]

    class Meta:
        permissions = (
            ("view_list_of_users", _("Can see the list of users")),
            ("send_email_to_users", _("Can send email to users")),
        )
