from django.contrib import admin
from models import ProjectLogo, ProjectName
from solo.admin import SingletonModelAdmin


admin.site.register(ProjectName, SingletonModelAdmin)
admin.site.register(ProjectLogo, SingletonModelAdmin)
