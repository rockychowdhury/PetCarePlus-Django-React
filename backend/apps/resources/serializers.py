"""
PetCarePlus v2 — Government Resources Serializer

Bilingual serializer for GovtResource model using BilingualMixin.
"""

from rest_framework import serializers
from common.mixins import BilingualMixin
from apps.resources.models import GovtResource


class GovtResourceSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for GovtResource model.
    Dynamically returns translated 'name', 'description', and 'address' based on user language context.
    """
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = GovtResource
        fields = [
            'id', 'name', 'description', 'resource_type',
            'division', 'district', 'phone', 'email', 'website', 'address',
            'is_active', 'created_at', 'updated_at',
            'name_en', 'name_bn', 'description_en', 'description_bn',
            'address_en', 'address_bn'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_name(self, obj):
        return self.get_bilingual_field(obj, 'name')

    def get_description(self, obj):
        return self.get_bilingual_field(obj, 'description')

    def get_address(self, obj):
        return self.get_bilingual_field(obj, 'address')
