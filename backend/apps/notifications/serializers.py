"""
PetCarePlus v2 — Notifications Serializers

Bilingual serializer for Notification model using BilingualMixin.
"""

from rest_framework import serializers
from common.mixins import BilingualMixin
from apps.notifications.models import Notification


class NotificationSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for Notification.
    Dynamically maps bilingual title and message fields.
    """
    title = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message', 'link',
            'is_read', 'created_at', 'title_en', 'title_bn', 'message_en', 'message_bn'
        ]
        read_only_fields = [
            'id', 'user', 'notification_type', 'title_en', 'title_bn',
            'message_en', 'message_bn', 'link', 'created_at'
        ]

    def get_title(self, obj):
        return self.get_bilingual_field(obj, 'title')

    def get_message(self, obj):
        return self.get_bilingual_field(obj, 'message')
