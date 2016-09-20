from django.db import models
from django.utils.translation import ugettext_lazy as _
from solo.models import SingletonModel


class ProjectName(SingletonModel):

    name = models.CharField(_('Name'), max_length=255, default=_('Project name'))

    class Meta:
        verbose_name = _('Project name')
        permissions = (("change_project_name", _("Can change the project name.")),)


class ProjectLogo(SingletonModel):

    logo = models.ImageField(_('Project logo'))

    class Meta:
        verbose_name = _('Project logo')
        permissions = (("change_project_logo", _("Can change the project logo.")),)
