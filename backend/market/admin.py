from django.contrib import admin

from .models import Category, Listing, Order


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'category', 'price', 'status', 'created_at']
    list_filter = ['status', 'condition', 'category']
    search_fields = ['title', 'seller__username']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['listing', 'buyer', 'price', 'created_at']
