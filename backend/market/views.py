from decimal import Decimal, InvalidOperation

from django.db import transaction
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import Category, Listing, Order
from .permissions import IsSellerOrReadOnly
from .serializers import CategorySerializer, ListingSerializer, OrderSerializer


def parse_price(value):
    try:
        number = Decimal(value)
    except (InvalidOperation, TypeError):
        return None
    return number if number.is_finite() else None


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None


class ListingViewSet(viewsets.ModelViewSet):
    """
    GET    /listings/          browse active listings
                               ?search= ?category=<slug> ?min_price= ?max_price=
                               ?ordering=price|-price|created_at|-created_at
                               ?mine=true  (your own listings, any status)
    POST   /listings/          create (login required)
    PATCH  /listings/{id}/     edit (seller only)
    DELETE /listings/{id}/     delete (seller only)
    POST   /listings/{id}/buy/ buy it (login required)
    """

    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Listing.objects.select_related('seller', 'category')
        if self.action != 'list':
            return queryset

        params = self.request.query_params
        if params.get('mine') == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(seller=self.request.user)
        else:
            queryset = queryset.filter(status=Listing.Status.ACTIVE)

        if params.get('category'):
            queryset = queryset.filter(category__slug=params['category'])
        low = parse_price(params.get('min_price'))
        high = parse_price(params.get('max_price'))
        if low is not None:
            queryset = queryset.filter(price__gte=low)
        if high is not None:
            queryset = queryset.filter(price__lte=high)
        return queryset

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.status == Listing.Status.SOLD:
            raise ValidationError("Sold listings can't be edited.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status == Listing.Status.SOLD:
            raise ValidationError("Sold listings can't be deleted.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def buy(self, request, pk=None):
        listing = self.get_object()
        if listing.seller_id == request.user.id:
            raise ValidationError("You can't buy your own listing.")

        with transaction.atomic():
            # Single UPDATE so two buyers can't both claim the same listing.
            claimed = Listing.objects.filter(
                pk=listing.pk, status=Listing.Status.ACTIVE
            ).update(status=Listing.Status.SOLD)
            if not claimed:
                raise ValidationError('This listing has already been sold.')
            order = Order.objects.create(buyer=request.user, listing=listing, price=listing.price)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """The logged-in user's purchases."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).select_related(
            'listing', 'listing__seller'
        )
