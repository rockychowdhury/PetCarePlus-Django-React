from rest_framework import serializers
from .models import Division, District, Upazila, Union

class UnionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Union
        fields = '__all__'

class UpazilaSerializer(serializers.ModelSerializer):
    unions = UnionSerializer(many=True, read_only=True)
    class Meta:
        model = Upazila
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    upazilas = UpazilaSerializer(many=True, read_only=True)
    class Meta:
        model = District
        fields = '__all__'

class DivisionSerializer(serializers.ModelSerializer):
    districts = DistrictSerializer(many=True, read_only=True)
    class Meta:
        model = Division
        fields = '__all__'
