"""
PetCarePlus v2 — Bilingual Serializer Mixin

Returns _en or _bn field variants based on user language preference.
Fallback chain: user preferred language → Accept-Language header → Bangla (default).
"""


class BilingualMixin:
    """
    Mixin for DRF serializers that have bilingual fields.

    Usage:
        class GuidelineSerializer(BilingualMixin, serializers.ModelSerializer):
            title = serializers.SerializerMethodField()
            content = serializers.SerializerMethodField()

            def get_title(self, obj):
                return self.get_bilingual_field(obj, 'title')

            def get_content(self, obj):
                return self.get_bilingual_field(obj, 'content')
    """

    def get_language(self):
        """Determine the preferred language from the request context."""
        request = self.context.get('request')
        if not request:
            return 'bn'

        # Authenticated user: use their stored preference
        if request.user and request.user.is_authenticated:
            return getattr(request.user, 'preferred_language', 'bn')

        # Anonymous user: check Accept-Language header
        accept_lang = request.headers.get('Accept-Language', 'bn')
        lang = accept_lang[:2].lower()
        return lang if lang in ('bn', 'en') else 'bn'

    def get_bilingual_field(self, obj, field_name):
        """
        Get a field value in the preferred language.
        Falls back to English if the preferred language value is empty.
        """
        lang = self.get_language()
        value = getattr(obj, f'{field_name}_{lang}', None)
        if value:
            return value
        # Fallback to English
        return getattr(obj, f'{field_name}_en', '') or ''
