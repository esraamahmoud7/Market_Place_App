from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ListingViewSet, OrderListView


router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('listings', ListingViewSet, basename='listing')


urlpatterns = [
    path('orders/', OrderListView.as_view(), name='orders'),
    path('', include(router.urls)),
]
