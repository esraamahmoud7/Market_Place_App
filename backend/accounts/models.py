from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """The account model. Log in with username; email is required and unique."""

    email = models.EmailField('email address', unique=True)
    bio = models.TextField(blank=True)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username
