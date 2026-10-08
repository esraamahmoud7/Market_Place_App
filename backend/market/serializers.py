from rest_framework import serializers

from .models import Category, Listing, Order


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ListingSerializer(serializers.ModelSerializer):

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )
    category_name = serializers.SerializerMethodField()
    seller = serializers.CharField(source='seller.username', read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'price', 'condition', 'image_url',
            'status', 'category', 'category_name', 'seller', 'is_mine',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_is_mine(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.seller_id == request.user.id)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than zero.')
        return value


class OrderSerializer(serializers.ModelSerializer):

    listing_title = serializers.CharField(source='listing.title', read_only=True)
    image_url = serializers.CharField(source='listing.image_url', read_only=True)
    seller = serializers.CharField(source='listing.seller.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'listing', 'listing_title', 'image_url', 'seller', 'price', 'created_at']
        read_only_fields = fields
