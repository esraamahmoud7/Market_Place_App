from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class AccountAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (('Profile', {'fields': ('bio',)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (('Profile', {'fields': ('email', 'bio')}),)
    list_display = ['username', 'email', 'is_staff']
