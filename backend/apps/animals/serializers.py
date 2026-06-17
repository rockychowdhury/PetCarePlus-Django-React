"""
PetCarePlus v2 — Animals Serializers

Bilingual serializers for AnimalType, Guideline, and VaccinationRecord.
Utilizes BilingualMixin to resolve dynamically translated fields.
"""

from rest_framework import serializers
from common.mixins import BilingualMixin
from apps.animals.models import AnimalType, Guideline, VaccinationRecord


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


class GuidelineSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for Guideline model.
    Dynamically maps 'title', 'content', and 'summary' bilingual fields.
    Also returns the translated animal type name.
    """
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    animal_type_name = serializers.SerializerMethodField()
    animal_type_details = AnimalTypeSerializer(source='animal_type', read_only=True)

    class Meta:
        model = Guideline
        fields = [
            'id', 'animal_type', 'animal_type_name', 'animal_type_details',
            'title', 'content', 'summary',
            'topic', 'season', 'is_published', 'created_at', 'updated_at',
            'title_en', 'title_bn', 'content_en', 'content_bn',
            'summary_en', 'summary_bn'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_title(self, obj):
        return self.get_bilingual_field(obj, 'title')

    def get_content(self, obj):
        return self.get_bilingual_field(obj, 'content')

    def get_summary(self, obj):
        return self.get_bilingual_field(obj, 'summary')

    def get_animal_type_name(self, obj):
        return self.get_bilingual_field(obj.animal_type, 'name')


class VaccinationRecordSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for VaccinationRecord model.
    Dynamically maps bilingual fields: vaccine_name, disease, schedule, and notes.
    """
    vaccine_name = serializers.SerializerMethodField()
    disease = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    animal_type_name = serializers.SerializerMethodField()
    animal_type_details = AnimalTypeSerializer(source='animal_type', read_only=True)

    class Meta:
        model = VaccinationRecord
        fields = [
            'id', 'animal_type', 'animal_type_name', 'animal_type_details',
            'vaccine_name', 'disease', 'schedule', 'notes',
            'dosage', 'age_range', 'local_medicine_name', 'created_at', 'updated_at',
            'vaccine_name_en', 'vaccine_name_bn', 'disease_en', 'disease_bn',
            'schedule_en', 'schedule_bn', 'notes_en', 'notes_bn'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_vaccine_name(self, obj):
        return self.get_bilingual_field(obj, 'vaccine_name')

    def get_disease(self, obj):
        return self.get_bilingual_field(obj, 'disease')

    def get_schedule(self, obj):
        return self.get_bilingual_field(obj, 'schedule')

    def get_notes(self, obj):
        return self.get_bilingual_field(obj, 'notes')

    def get_animal_type_name(self, obj):
        return self.get_bilingual_field(obj.animal_type, 'name')
