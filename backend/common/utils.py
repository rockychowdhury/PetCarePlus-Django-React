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

def get_local_providers(user=None, provider_type=None, animal_type_id=None,
                        lat=None, lng=None, division_id=None, district_id=None, upazila_id=None):
    """
    Get locally-scoped providers.
    - If Region Search (IDs only, no lat/lng): Strict match, NO fallback.
    - If Radius Search (lat/lng provided): Radius -> Upazila -> District fallback.
    - If Implicit (User profile): Radius -> Upazila -> District fallback.
    """
    base_qs = ServiceProvider.objects.prefetch_related('animal_types').filter(is_verified=True, is_active=True)

    if provider_type:
        base_qs = base_qs.filter(provider_type=provider_type)
    if animal_type_id:
        base_qs = base_qs.filter(animal_types__animal_type_id=animal_type_id)

    # Determine if this is an explicit Region Search (IDs picked, no GPS)
    is_region_search = not lat and not lng and (upazila_id or district_id or division_id)

    if is_region_search:
        if upazila_id:
            return base_qs.filter(upazila_id=upazila_id).order_by('-avg_rating')
        if district_id:
            return base_qs.filter(district_id=district_id).order_by('-avg_rating')
        if division_id and division_id != 'all':
            return base_qs.filter(division_id=division_id).order_by('-avg_rating')
        return base_qs.order_by('-avg_rating')

    # --- Radius Search / Implicit Profile Search (with Fallback) ---
    
    # Extract implicit coordinates/IDs from user if not passed directly
    if not lat and getattr(user, 'latitude', None):
        lat = user.latitude
    if not lng and getattr(user, 'longitude', None):
        lng = user.longitude
    if not upazila_id and getattr(user, 'upazila_id', None):
        upazila_id = user.upazila_id
    if not district_id and getattr(user, 'district_id', None):
        district_id = user.district_id

    # 1. Radial Haversine search (15km radius)
    if lat and lng:
        try:
            lat_val = float(lat)
            lng_val = float(lng)
            
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
            
            if radial_qs.count() > 0:
                return radial_qs
        except (ValueError, TypeError):
            pass

        # Fallback to upazila if radius has 0 results
        if upazila_id:
            upazila_qs = base_qs.filter(upazila_id=upazila_id).order_by('-avg_rating')
            if upazila_qs.count() > 0:
                return upazila_qs
        
        # If NO one found (radius empty AND upazila empty/missing), return empty set!
        return base_qs.none()

    # 2. User Profile fallback (No GPS provided, fallback to explicitly saved user IDs)
    if upazila_id:
        local = base_qs.filter(upazila_id=upazila_id)
        if local.count() > 0:
            return local.order_by('-avg_rating')

    if district_id:
        local = base_qs.filter(district_id=district_id)
        if local.count() > 0:
            return local.order_by('-avg_rating')

    # 3. Global Fallback
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
