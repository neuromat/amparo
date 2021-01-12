from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import ugettext_lazy as _

from .models import CustomUser, Type

admin.site.register(Type)


class UserAdmin(BaseUserAdmin):
    # The fields to be used in displaying the User model.
    list_display = ('username', 'email', 'type_of_person')
    fieldsets = (
        (None, {'fields': ('email', 'password', 'type_of_person', 'token_id', 'token', 'survey_completed')}),
        (_('Permissions'), {'fields': ('is_staff', 'is_active', 'is_superuser', 'user_permissions', 'groups')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'type_of_person', 'password1', 'password2')}
         ),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()

admin.site.register(CustomUser, UserAdmin)
