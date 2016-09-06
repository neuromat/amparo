# -*- coding: utf-8 -*-
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import activate, LANGUAGE_SESSION_KEY

from blog.models import Blog
from pages.models import Page
from users.views import Questionnaires


def index(request):
    # Search banner
    try:
        current_banner = Blog.objects.active_translations()
        current_banner = current_banner.filter(banner=True, publish=True)
    except Blog.DoesNotExist:
        current_banner = False

    # Search home page
    try:
        home_page = Page.objects.get(home_page=True)
    except Page.DoesNotExist:
        home_page = False

    # Check if the user filled the questionnaire
    survey_id = False
    survey_url = False

    if request.user.is_authenticated() and request.user.survey_completed is False:
        questionnaire = Questionnaires()
        type_of_person = str(request.user.type_of_person)
        email = request.user.email

        if type_of_person == 'Profissional':
            survey_id = settings.LIMESURVEY['PROFISSIONAL']

        elif type_of_person == 'Estudante':
            survey_id = settings.LIMESURVEY['ESTUDANTE']

        elif type_of_person == 'Familiar ou cuidador':
            survey_id = settings.LIMESURVEY['CUIDADOR']

        elif type_of_person == 'Portador da doença de Parkinson':
            survey_id = settings.LIMESURVEY['PACIENTE']

        if survey_id and request.user.token_id == '':
            survey = questionnaire.user_survey(survey_id, email)

            if survey:
                token = survey['token']
                token_id = survey['token_id']

                survey_url = \
                    '%s/index.php/%s/token/%s/newtest/Y' % (
                        settings.LIMESURVEY['URL_WEB'],
                        survey_id,
                        token,
                    )
                request.user.token_id = token_id
                request.user.save()
                request.user.token = token
                request.user.save()

        elif survey_id and request.user.token_id != '':
            survey_info = (questionnaire.get_participant_properties(survey_id,
                                                                    request.user.token_id,
                                                                    "completed") != 'N')

            if survey_info:
                request.user.survey_completed = True
                request.user.save()

            else:
                survey_url = \
                    '%s/index.php/%s/token/%s/newtest/Y' % (
                        settings.LIMESURVEY['URL_WEB'],
                        survey_id,
                        request.user.token,
                    )

    context = {'current_banner': current_banner, 'home_page': home_page, 'survey_url': survey_url}
    return render(request, 'main/default.html', context)


def language_change(request, language_code):
    activate(language_code)
    request.session[LANGUAGE_SESSION_KEY] = language_code

    return HttpResponseRedirect(request.GET['next'])
