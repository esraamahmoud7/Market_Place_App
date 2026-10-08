from rest_framework.test import APITestCase


class AuthFlowTests(APITestCase):

    def register(self, **overrides):
        body = {'username': 'carol', 'email': 'carol@example.com', 'password': 'a-Strong-pass-42', **overrides}
        return self.client.post('/api/auth/register/', body, format='json')

    def test_register_then_login(self):
        res = self.register()
        self.assertEqual(res.status_code, 201)
        self.assertNotIn('password', res.json())

        res = self.client.post(
            '/api/auth/login/',
            {'username': 'carol', 'password': 'a-Strong-pass-42'},
            format='json',
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.json())
        self.assertIn('refresh', res.json())

    def test_weak_password_rejected(self):
        self.assertEqual(self.register(password='123').status_code, 400)

    def test_email_required(self):
        res = self.client.post(
            '/api/auth/register/',
            {'username': 'dave', 'password': 'a-Strong-pass-42'},
            format='json',
        )
        self.assertEqual(res.status_code, 400)

    def test_duplicate_username_and_email_rejected(self):
        self.register()
        self.assertEqual(self.register(email='other@example.com').status_code, 400)
        self.assertEqual(self.register(username='other', email='CAROL@example.com').status_code, 400)

    def test_me_get_and_update(self):
        self.register()
        token = self.client.post(
            '/api/auth/login/',
            {'username': 'carol', 'password': 'a-Strong-pass-42'},
            format='json',
        ).json()['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        self.assertEqual(self.client.get('/api/auth/me/').json()['username'], 'carol')
        res = self.client.patch('/api/auth/me/', {'bio': 'Hello', 'username': 'hacked'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['bio'], 'Hello')
        self.assertEqual(res.json()['username'], 'carol')

    def test_me_requires_authentication(self):
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 401)
