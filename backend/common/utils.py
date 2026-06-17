"""
PetCarePlus v2 — Local Network Utilities

Implements the cascade query logic for location-scoped features:
1. Match user's district
2. If results < threshold, expand to division
3. If still insufficient, return all verified results
"""

from apps.providers.models import ServiceProvider


LOCAL_THRESHOLD = 3  # Minimum results before expanding scope


from django.db import models
from django.db.models.functions import ACos, Cos, Radians, Sin
from django.db.models import F, ExpressionWrapper

def get_local_providers(user, provider_type=None, animal_type_id=None):
    """
    Get locally-scoped providers using cascade logic.

    Args:
        user: The requesting user (or MockUser with lat/lng/union/upazila)
        provider_type: Optional filter by provider type (vet, groomer, etc.)
        animal_type_id: Optional filter by animal type

    Returns:
        QuerySet of ServiceProvider objects.
    """
    base_qs = ServiceProvider.objects.filter(is_verified=True, is_active=True)

    if provider_type:
        base_qs = base_qs.filter(provider_type=provider_type)
    if animal_type_id:
        base_qs = base_qs.filter(animal_types__animal_type_id=animal_type_id)

    # 1. Radial Haversine search (15km radius) if coordinates are available
    lat = getattr(user, 'latitude', None)
    lng = getattr(user, 'longitude', None)

    if lat and lng:
        try:
            lat_val = float(lat)
            lng_val = float(lng)
            
            # Bounding box filter for database index optimization (~15km delta)
            import math
            lat_delta = 15.0 / 111.0
            lng_delta = 15.0 / (111.0 * math.cos(math.radians(lat_val)))
            
            radial_qs = base_qs.exclude(latitude__isnull=True).filter(
                latitude__gte=lat_val - lat_delta,
                latitude__lte=lat_val + lat_delta,
                longitude__gte=lng_val - lng_delta,
                longitude__lte=lng_val + lng_delta
            )
            
            lat_rad = Radians(lat_val)
            lng_rad = Radians(lng_val)
            
            distance_expr = ExpressionWrapper(
                6371 * ACos(
                    Cos(lat_rad) * Cos(Radians(F('latitude'))) *
                    Cos(Radians(F('longitude')) - lng_rad) +
                    Sin(lat_rad) * Sin(Radians(F('latitude')))
                ),
                output_field=models.FloatField()
            )
            
            radial_qs = radial_qs.annotate(distance=distance_expr).filter(distance__lte=15.0).order_by('distance')
            
            if radial_qs.count() >= LOCAL_THRESHOLD:
                return radial_qs
        except (ValueError, TypeError):
            pass

    # 2. Same Union
    union = getattr(user, 'union', None)
    if union:
        local = base_qs.filter(user__union__iexact=union)
        if local.count() >= LOCAL_THRESHOLD:
            return local.order_by('-avg_rating')

    # 3. Same Upazila
    upazila = getattr(user, 'upazila', None)
    if upazila:
        local = base_qs.filter(upazila__iexact=upazila)
        if local.count() >= LOCAL_THRESHOLD:
            return local.order_by('-avg_rating')

    # 4. Same District
    district = getattr(user, 'district', None)
    if district:
        local = base_qs.filter(district__iexact=district)
        if local.count() >= LOCAL_THRESHOLD:
            return local.order_by('-avg_rating')

    # 5. Same Division
    division = getattr(user, 'division', None)
    if division:
        regional = base_qs.filter(division__iexact=division)
        if regional.count() >= LOCAL_THRESHOLD:
            return regional.order_by('-avg_rating')

    # 6. All verified providers
    return base_qs.order_by('-avg_rating')


def get_local_queryset(queryset, user, location_field_prefix=''):
    """
    Generic local network scoping for any model with location fields.

    Use for rehoming listings, govt resources, etc.

    Args:
        queryset: Base queryset to filter
        user: The requesting user
        location_field_prefix: Prefix for location fields (e.g., 'owner__' for related models)

    Returns:
        Filtered queryset with cascade scoping.
    """
    district_field = f'{location_field_prefix}district'
    division_field = f'{location_field_prefix}division'

    if user.district:
        local = queryset.filter(**{district_field: user.district})
        if local.count() >= LOCAL_THRESHOLD:
            return local

    if user.division:
        regional = queryset.filter(**{division_field: user.division})
        if regional.count() >= LOCAL_THRESHOLD:
            return regional

    return queryset
