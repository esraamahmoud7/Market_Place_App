from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .serializers import AccountSerializer, RegisterSerializer


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class MeView(generics.RetrieveUpdateAPIView):
    """The logged-in user's own account."""

    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
