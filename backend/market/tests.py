from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Category, Listing, Order

User = get_user_model()


def results(response):
    return response.json()['results']


class MarketTests(APITestCase):

    def setUp(self):
        self.alice = User.objects.create_user('alice', 'alice@example.com', 'pass12345!')
        self.bob = User.objects.create_user('bob', 'bob@example.com', 'pass12345!')
        self.books = Category.objects.create(name='Books', slug='books')
        self.book = Listing.objects.create(
            seller=self.alice, category=self.books, title='Old book', price='5.00'
        )

    def test_browsing_is_public_and_hides_sold_listings(self):
        Listing.objects.create(
            seller=self.alice, title='Gone', price='1.00', status=Listing.Status.SOLD
        )
        res = self.client.get('/api/listings/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual([l['title'] for l in results(res)], ['Old book'])

    def test_search_category_and_price_filters(self):
        Listing.objects.create(seller=self.alice, title='Desk lamp', price='20.00')
        self.assertEqual(len(results(self.client.get('/api/listings/?search=lamp'))), 1)
        self.assertEqual(len(results(self.client.get('/api/listings/?category=books'))), 1)
        self.assertEqual(len(results(self.client.get('/api/listings/?min_price=10'))), 1)
        self.assertEqual(len(results(self.client.get('/api/listings/?max_price=abc'))), 2)

    def test_create_requires_login_and_sets_seller(self):
        body = {'title': 'Lamp', 'price': '12.50', 'category': self.books.id}
        self.assertEqual(self.client.post('/api/listings/', body, format='json').status_code, 401)

        self.client.force_authenticate(self.alice)
        res = self.client.post('/api/listings/', body, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['seller'], 'alice')
        self.assertTrue(res.json()['is_mine'])

    def test_price_must_be_positive(self):
        self.client.force_authenticate(self.alice)
        res = self.client.post('/api/listings/', {'title': 'Free?', 'price': '0'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_only_seller_can_edit(self):
        url = f'/api/listings/{self.book.id}/'
        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.patch(url, {'price': '1.00'}, format='json').status_code, 403)
        self.client.force_authenticate(self.alice)
        res = self.client.patch(url, {'price': '7.50'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['price'], '7.50')

    def test_buy_flow(self):
        url = f'/api/listings/{self.book.id}/buy/'
        self.assertEqual(self.client.post(url).status_code, 401)

        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.post(url).status_code, 201)
        self.book.refresh_from_db()
        self.assertEqual(self.book.status, Listing.Status.SOLD)
        self.assertEqual(Order.objects.get().buyer, self.bob)

        self.assertEqual(self.client.post(url).status_code, 400)  # already sold

    def test_cannot_buy_own_listing(self):
        self.client.force_authenticate(self.alice)
        res = self.client.post(f'/api/listings/{self.book.id}/buy/')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_sold_listing_cannot_be_deleted(self):
        self.client.force_authenticate(self.bob)
        self.client.post(f'/api/listings/{self.book.id}/buy/')
        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.delete(f'/api/listings/{self.book.id}/').status_code, 400)

    def test_mine_filter_and_orders_are_private(self):
        self.client.force_authenticate(self.bob)
        self.client.post(f'/api/listings/{self.book.id}/buy/')
        self.assertEqual(len(results(self.client.get('/api/orders/'))), 1)
        self.assertEqual(len(results(self.client.get('/api/listings/?mine=true'))), 0)

        self.client.force_authenticate(self.alice)
        self.assertEqual(len(results(self.client.get('/api/orders/'))), 0)
        self.assertEqual(len(results(self.client.get('/api/listings/?mine=true'))), 1)
