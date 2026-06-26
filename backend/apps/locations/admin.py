"""
PetCarePlus v2 — Locations Admin

Admin for managing Bangladesh geographical hierarchy:
Division → District → Upazila → Union
"""

from django.contrib import admin
from .models import Division, District, Upazila, Union


class DistrictInline(admin.TabularInline):
    model = District
    extra = 0
    fields = ('name_en', 'name_bn', 'lat', 'lng')
    show_change_link = True


class UpazilaInline(admin.TabularInline):
    model = Upazila
    extra = 0
    fields = ('name_en', 'name_bn')
    show_change_link = True


class UnionInline(admin.TabularInline):
    model = Union
    extra = 0
    fields = ('name_en', 'name_bn')


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_bn', 'district_count')
    search_fields = ('name_en', 'name_bn')
    inlines = [DistrictInline]

    def district_count(self, obj):
        return obj.districts.count()
    district_count.short_description = 'Districts'


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_bn', 'division', 'lat', 'lng', 'upazila_count')
    list_filter = ('division',)
    search_fields = ('name_en', 'name_bn')
    autocomplete_fields = ['division']
    inlines = [UpazilaInline]

    def upazila_count(self, obj):
        return obj.upazilas.count()
    upazila_count.short_description = 'Upazilas'


@admin.register(Upazila)
class UpazilaAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_bn', 'district', 'get_division')
    list_filter = ('district__division',)
    search_fields = ('name_en', 'name_bn')
    autocomplete_fields = ['district']
    inlines = [UnionInline]

    def get_division(self, obj):
        return obj.district.division
    get_division.short_description = 'Division'
    get_division.admin_order_field = 'district__division'


@admin.register(Union)
class UnionAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_bn', 'upazila', 'get_district')
    list_filter = ('upazila__district__division',)
    search_fields = ('name_en', 'name_bn')
    autocomplete_fields = ['upazila']

    def get_district(self, obj):
        return obj.upazila.district
    get_district.short_description = 'District'
    get_district.admin_order_field = 'upazila__district'
