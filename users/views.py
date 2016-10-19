# -*- coding: utf-8 -*-
from abc import ABCMeta, abstractmethod
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core import mail
from django.core.mail import BadHeaderError, EmailMultiAlternatives
from django.http import HttpResponse
from django.shortcuts import render
from django.utils.translation import ugettext_lazy as _
from jsonrpc_requests import Server, TransportError

from models import CustomUser


class ABCSearchEngine:
    __metaclass__ = ABCMeta
    session_key = None
    server = None

    def __init__(self):
        self.get_session_key()

    def get_session_key(self):

        self.server = Server(settings.LIMESURVEY['URL_API'] + '/index.php/admin/remotecontrol')

        try:
            self.session_key = self.server.get_session_key(settings.LIMESURVEY['USER'], settings.LIMESURVEY['PASSWORD'])
            self.session_key = None if isinstance(self.session_key, dict) else self.session_key
        except TransportError:
            self.session_key = None

    def release_session_key(self):
        if self.session_key:
            self.server.release_session_key(self.session_key)

    @abstractmethod
    def user_survey(self, sid, email):
        """
        This method creates the token

        :param sid: Survey ID
        :return: dictionary with token and token_id; None if error.
        """

        user_data = {'email': email}

        user_data_result = self.server.add_participants(
            self.session_key,
            sid,
            [user_data],
            True)

        if user_data_result \
                and isinstance(user_data_result, list) \
                and isinstance(user_data_result[0], dict) \
                and 'error' not in user_data_result[0]:

            return {'token': user_data_result[0]['token'],
                    'token_id': user_data_result[0]['tid']}
        else:
            return None

    @abstractmethod
    def get_participant_properties(self, survey_id, token_id, prop):
        """
        This method checks if the questionnaire has been answered

        :param survey_id: survey ID
        :param token_id: token ID
        :param prop: property name
        :return: value of a determined property from a participant/token
        """

        if self.session_key:
            result = self.server.get_participant_properties(self.session_key, survey_id, token_id, {'method': prop})
            result = result.get(prop)
        else:
            result = ""

        return result


class Questionnaires(ABCSearchEngine):

    def user_survey(self, survey_id, email):
        return super(Questionnaires, self).user_survey(survey_id, email)

    def get_participant_properties(self, survey_id, token_id, prop):
        return super(Questionnaires, self).get_participant_properties(survey_id, token_id, prop)


@login_required
def list_of_users(request):
    if request.user.has_perm('users.view_list_of_users'):
        users = CustomUser.objects.all()
        total = users.count()
        professionals = users.filter(type_of_person__name='Profissional').count()
        students = users.filter(type_of_person__name='Estudante').count()
        caregivers = users.filter(type_of_person__name='Familiar ou cuidador').count()
        patients = users.filter(type_of_person__name='Pessoa com doença de Parkinson').count()
        context = {'total': total, 'professionals': professionals, 'students': students, 'caregivers': caregivers,
                   'patients': patients}
        return render(request, 'users/list_of_users.html', context)
    else:
        return render(request, '404.html')


@login_required
def send_email_to_users(request):
    if request.user.has_perm('users.send_email_to_users'):
        if request.method == 'POST':
            selected_target = request.POST['target']
            subject_typed = request.POST['subject']
            message_typed = request.POST['message']
            users = CustomUser.objects.all()
            list_of_emails = []
            text_content = message_typed
            html_content = message_typed

            if selected_target == '2':
                for user in users:
                    if user.email:
                        list_of_emails.append(user.email)
            elif selected_target == '1':
                for user in users.filter(type_of_person__name='Profissional'):
                    if user.email:
                        list_of_emails.append(user.email)

            if subject_typed and message_typed and list_of_emails:
                subject, from_email, to = subject_typed, settings.EMAIL_HOST_USER, list_of_emails

                if subject and from_email and to:
                    connection = mail.get_connection()
                    connection.open()

                    try:
                        msg = EmailMultiAlternatives(subject, text_content, from_email, bcc=to)
                        msg.attach_alternative(html_content, "text/html")
                        if request.FILES:
                            file_uploaded = request.FILES['attachment']
                            msg.attach(file_uploaded.name, file_uploaded.read(), file_uploaded.content_type)
                        msg.send()
                    except BadHeaderError:
                        return HttpResponse('Invalid header found.')

                    connection.close()
                    messages.success(request, _('Email successfully sent!'))
            else:
                messages.error(request, _('You must select the target audience and fill in the subject and message '
                                          'fields'))

        return render(request, 'users/send_email.html')

    else:
        return render(request, '404.html')
