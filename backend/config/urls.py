from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),

    # Marketplace: categories, listings, orders
    path('api/', include('market.urls')),

    # Accounts: register, me
    path('api/auth/', include('accounts.urls')),

    # JWT login / refresh
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
