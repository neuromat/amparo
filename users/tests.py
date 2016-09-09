from django.contrib.auth import get_user_model
from django.test import TestCase

from models import CustomUser, Type

# Create your tests here.
USER_USERNAME = 'myadmin'
USER_EMAIL = 'test@dummy.com'
USER_PWD = 'mypassword'


class UserTest(TestCase):

    user_username = 'newuser'
    user_email = 'newuser@localhost.local'
    user_password = 'abc123'

    def create_user(self):
        # Create and return a new user
        return get_user_model().objects.create_user(self.user_username, self.user_email, self.user_password)

    def test_user_creation(self):
        self.create_user()
        # Check user exists and email is correct
        self.assertEqual(get_user_model().objects.all().count(), 1)
        self.assertEqual(get_user_model().objects.all()[0].email, self.user_email)

        # Check flags
        self.assertTrue(get_user_model().objects.all()[0].is_active)
        self.assertFalse(get_user_model().objects.all()[0].is_staff)
        self.assertFalse(get_user_model().objects.all()[0].is_superuser)


class UserManagerTest(TestCase):

    def test_create_superuser(self):
        username = 'superuser'
        email = 'superuser@localhost.local'
        password = 'abc!@#'
        user = get_user_model().objects.create_superuser(username, email, password)
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password, password)
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_user_creation_is_active(self):
        # Create deactivated user
        username = 'fulano'
        email = 'fulano@exemplo.com'
        password = 'abc123'
        user = get_user_model().objects.create_user(username, email, password, is_active=False)
        self.assertFalse(user.is_active)

    def test_create_user_email_domain_normalize(self):
        returned = get_user_model().objects.normalize_email('normal@DOMAIN.COM')
        self.assertEqual(returned, 'normal@domain.com')


class CustomUserTest(TestCase):

    def test_create_type_of_person(self):
        Type.objects.create(name='Profissional')
        self.assertEqual(Type.objects.all().count(), 1)

    def test_create_common_user(self):
        username = 'teste'
        email = 'teste@dominio.com'
        password = '123456'
        type_of_person = Type.objects.create(name='Estudante')
        user = CustomUser.objects.create_user(username=username, email=email, password=password,
                                              type_of_person=type_of_person)

        # Check flags
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        # Check email and type of person
        self.assertEqual(CustomUser.objects.get(email=email).email, email)
        self.assertEqual(CustomUser.objects.get(email=email).type_of_person, type_of_person)

        # Check type of person (wrong type)
        worng_type_of_person = Type.objects.create(name='Cuidador')
        self.assertNotEqual(CustomUser.objects.get(email=email).type_of_person, worng_type_of_person)
