"""
PetCarePlus v2 — Resources Serializer

Bilingual serializer for Resource model using BilingualMixin.
"""

from rest_framework import serializers
from common.mixins import BilingualMixin
from apps.resources.models import Resource


class ResourceSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for Resource model.
    Dynamically returns translated 'title' and 'description' based on user language context.
    """
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    animal_type_name = serializers.CharField(source='animal_type.name_en', read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'resource_type', 'animal_type', 'animal_type_name',
            'is_active', 'created_at', 'updated_at',
            'title_en', 'title_bn', 'description_en', 'description_bn'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_title(self, obj):
        return self.get_bilingual_field(obj, 'title')

    def get_description(self, obj):
        return self.get_bilingual_field(obj, 'description')
