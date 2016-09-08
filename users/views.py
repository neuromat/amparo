from abc import ABCMeta, abstractmethod
from django.conf import settings
from jsonrpc_requests import Server, TransportError


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
