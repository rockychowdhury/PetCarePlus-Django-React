"""
PetCarePlus v2 — Local Network Utilities

Implements the cascade query logic for location-scoped features:
1. Match user's district
2. If results < threshold, expand to division
3. If still insufficient, return all verified results
"""

from apps.providers.models import ServiceProvider


LOCAL_THRESHOLD = 3  # Minimum results before expanding scope


def get_local_providers(user, provider_type=None, animal_type_id=None):
    """
    Get locally-scoped providers using cascade logic.

    Args:
        user: The requesting user (must have district/division fields)
        provider_type: Optional filter by provider type (vet, groomer, etc.)
        animal_type_id: Optional filter by animal type

    Returns:
        QuerySet of ServiceProvider objects, ordered by avg_rating descending.
    """
    qs = ServiceProvider.objects.filter(is_verified=True, is_active=True)

    if provider_type:
        qs = qs.filter(provider_type=provider_type)
    if animal_type_id:
        qs = qs.filter(animal_types__animal_type_id=animal_type_id)

    # Step 1: Same district
    if user.district:
        local = qs.filter(district=user.district)
        if local.count() >= LOCAL_THRESHOLD:
            return local.order_by('-avg_rating')

    # Step 2: Same division
    if user.division:
        regional = qs.filter(division=user.division)
        if regional.count() >= LOCAL_THRESHOLD:
            return regional.order_by('-avg_rating')

    # Step 3: All verified providers
    return qs.order_by('-avg_rating')


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
