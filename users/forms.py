from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.utils.translation import ugettext_lazy as _

from models import CustomUser


class UserCreationForm(forms.ModelForm):
    """
    A form for creating new users. Includes all the required
    fields, plus a repeated password.
    """
    password1 = forms.CharField(label=_('Password'), widget=forms.PasswordInput)
    password2 = forms.CharField(label=_('Password confirmation'), widget=forms.PasswordInput)

    class Meta:
        model = CustomUser
        fields = ('email', 'type_of_person')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_("Passwords don't match"))
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """
    A form for updating users. Includes all the fields on the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField(label=_("Password"),
                                         help_text=_("""Raw passwords are not stored, so there is no way to see this
                                         user's password, but you can change the password using
                                         <a href=/admin/password_change>this form</a>."""))

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'type_of_person', 'is_active', 'is_staff', 'date_joined', 'user_permissions',
                  'groups')

    def clean_password(self):
        return self.initial["password"]


# class SignupForm(forms.Form):
#     first_name = forms.CharField(max_length=30, label='Voornaam')
#     last_name = forms.CharField(max_length=30, label='Achternaam')
#
#     def signup(self, request, user):
#         user.first_name = self.cleaned_data['first_name']
#         user.last_name = self.cleaned_data['last_name']
#         user.save()
#
class SignupForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ['type_of_person',]

    def signup(self, request, user):
        user.type_of_person = self.cleaned_data['type_of_person']
        user.save()
