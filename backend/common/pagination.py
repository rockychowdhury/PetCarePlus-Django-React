"""
PetCarePlus v2 — Pagination
"""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Standard pagination for all list endpoints. 20 items per page."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
