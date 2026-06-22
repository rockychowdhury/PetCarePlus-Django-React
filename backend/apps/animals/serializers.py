"""
PetCarePlus v2 — Animals Serializers

Bilingual serializers for AnimalType, Guideline, and VaccinationRecord.
Utilizes BilingualMixin to resolve dynamically translated fields.
"""

from rest_framework import serializers
from common.mixins import BilingualMixin
from apps.animals.models import AnimalType


class AnimalTypeSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for the core AnimalType model.
    Dynamically maps the bilingual 'name' field based on request context.
    """
    name = serializers.SerializerMethodField()

    class Meta:
        model = AnimalType
        fields = [
            'id', 'name', 'slug', 'category', 'icon',
            'supports_rehoming', 'supports_services',
            'name_en', 'name_bn'
        ]

    def get_name(self, obj):
        return self.get_bilingual_field(obj, 'name')

