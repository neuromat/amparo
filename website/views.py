# -*- coding: utf-8 -*-
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render, render_to_response
from django.template import RequestContext
from django.utils.translation import activate, LANGUAGE_SESSION_KEY

from blog.models import Blog
from pages.models import Page
from users.views import Questionnaires


def is_limesurvey_available(questionnaire):
    limesurvey_available = True

    if not questionnaire.session_key:
        limesurvey_available = False

    return limesurvey_available


def index(request):
    # Search banner
    banner = Blog.objects.active_translations()
    banner = banner.filter(banner=True)

    try:
        open_lecture = banner.get(publish=True)
    except Blog.DoesNotExist:
        open_lecture = False

    try:
        private_lecture = banner.get(publish=False)
    except Blog.DoesNotExist:
        private_lecture = False

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

        elif type_of_person == 'Pessoa com doença de Parkinson':
            survey_id = settings.LIMESURVEY['PACIENTE']

        limesurvey_available = is_limesurvey_available(questionnaire)

        # Create the token and the URL to the questionnaire
        if survey_id and limesurvey_available and request.user.token_id == '':
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

        # Create the URL to the questionnaire
        elif survey_id and limesurvey_available and request.user.token_id != '':
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

    context = {'open_lecture': open_lecture, 'private_lecture': private_lecture, 'home_page': home_page,
               'survey_url': survey_url}
    return render(request, 'main/default.html', context)


def language_change(request, language_code):
    activate(language_code)
    request.session[LANGUAGE_SESSION_KEY] = language_code

    return HttpResponseRedirect(request.GET['next'])


def google_analytics(request):
    """
    Using the variable returned in this function to render the Google Analytics tracking code.
    """
    ga_prop_id = getattr(settings, 'GOOGLE_ANALYTICS_PROPERTY_ID', False)
    if ga_prop_id:
        return {'GOOGLE_ANALYTICS_PROPERTY_ID': ga_prop_id}
    return {}


def handler404(request):
    response = render_to_response('404.html', {}, context_instance=RequestContext(request))
    response.status_code = 404
    return response
