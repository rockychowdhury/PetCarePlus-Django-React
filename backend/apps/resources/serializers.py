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
    animal_types = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'resource_type', 'animal_types',
            'is_active', 'created_at', 'updated_at',
            'title_en', 'title_bn', 'description_en', 'description_bn', 'is_saved'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_saved', 'animal_types']

    def get_animal_types(self, obj):
        return [
            {
                'id': at.id,
                'name_en': at.name_en,
                'name_bn': at.name_bn,
                'slug': at.slug
            } for at in obj.animal_types.all()
        ]

    def get_is_saved(self, obj):
        return getattr(obj, 'is_saved', False)

    def get_title(self, obj):
        return self.get_bilingual_field(obj, 'title')

    def get_description(self, obj):
        return self.get_bilingual_field(obj, 'description')
