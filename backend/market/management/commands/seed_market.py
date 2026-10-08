from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from market.models import Category, Listing

User = get_user_model()

CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Home']

SAMPLES = [
    ('Mechanical keyboard', 'Electronics', '45.00', 'USED', 'Tactile switches, USB-C cable included.'),
    ('27-inch monitor', 'Electronics', '120.00', 'USED', '1440p, no dead pixels.'),
    ('Oak bookshelf', 'Furniture', '85.00', 'USED', 'Five shelves, minor scuffs on one side.'),
    ('Standing desk', 'Furniture', '210.00', 'NEW', 'Electric height adjustment, still boxed.'),
    ('Denim jacket', 'Clothing', '30.00', 'USED', 'Size M, barely worn.'),
    ('Python crash course', 'Books', '12.00', 'USED', 'Paperback, no highlighting.'),
    ('Yoga mat', 'Sports', '15.00', 'NEW', 'Non-slip, 6 mm.'),
    ('Ceramic table lamp', 'Home', '22.50', 'NEW', 'Warm white bulb included.'),
]


class Command(BaseCommand):
    help = 'Create demo categories, a demo seller and sample listings.'

    def handle(self, *args, **options):
        categories = {}
        for name in CATEGORIES:
            categories[name], _ = Category.objects.get_or_create(
                slug=slugify(name), defaults={'name': name}
            )

        seller, created = User.objects.get_or_create(
            username='demo_seller', defaults={'email': 'demo@example.com'}
        )
        if created:
            seller.set_password('demo-pass-123!')
            seller.save()

        added = 0
        for title, category, price, condition, description in SAMPLES:
            _, was_created = Listing.objects.get_or_create(
                seller=seller,
                title=title,
                defaults={
                    'category': categories[category],
                    'price': price,
                    'condition': condition,
                    'description': description,
                },
            )
            added += was_created

        self.stdout.write(self.style.SUCCESS(
            f'{len(categories)} categories ready, {added} listings added. '
            f'Demo seller: demo_seller / demo-pass-123!'
        ))
