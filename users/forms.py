from django import forms
from django.utils.translation import ugettext_lazy as _

from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from allauth.account.forms import LoginForm, SignupForm
from allauth.socialaccount.forms import SignupForm as AllAuthSocialSignUpForm
from .models import Type


class SocialSignUpForm(AllAuthSocialSignUpForm):

    type_of_person = forms.ModelChoiceField(label=_('I am'), queryset=Type.objects.all())

    def __init__(self, *args, **kwargs):
        super(SocialSignUpForm, self).__init__(*args, **kwargs)
        del self.fields['email'].widget.attrs['placeholder']
        self.fields['email'].required = False
        self.fields['email'].label = _("E-mail (optional)")

        for field in ['type_of_person', 'email']:
            self.fields[field].widget.attrs['class'] = 'form-control'

    def save(self, request):
        user = super(SocialSignUpForm, self).save(request)
        user.type_of_person = self.cleaned_data['type_of_person']
        user.save()


class UserSignupForm(SignupForm):
    type_of_person = forms.ModelChoiceField(label=_('I am'), queryset=Type.objects.all())

    def __init__(self, *args, **kwargs):
        super(UserSignupForm, self).__init__(*args, **kwargs)

        for field in ['email', 'password1', 'password2']:
            del self.fields[field].widget.attrs['placeholder']

        for field in ['type_of_person', 'email', 'password1', 'password2']:
            self.fields[field].widget.attrs['class'] = 'form-control'

    def save(self, request):
        adapter = get_adapter(request)
        user = adapter.new_user(request)
        adapter.save_user(request, user, self)

        user.type_of_person = self.cleaned_data['type_of_person']
        user.save()

        self.custom_signup(request, user)
        setup_user_email(request, user, [])
        return user


class CustomLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        super(CustomLoginForm, self).__init__(*args, **kwargs)

        for field in ['login', 'password']:
            self.fields[field].widget.attrs['class'] = 'form-control'
