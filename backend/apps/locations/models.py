from django.db import models

class Division(models.Model):
    name_en = models.CharField(max_length=50)
    name_bn = models.CharField(max_length=50)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return f"{self.name_en} ({self.name_bn})"

class District(models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='districts')
    name_en = models.CharField(max_length=50)
    name_bn = models.CharField(max_length=50)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return f"{self.name_en} ({self.name_bn})"

class Upazila(models.Model):
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='upazilas')
    name_en = models.CharField(max_length=50)
    name_bn = models.CharField(max_length=50)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return f"{self.name_en} ({self.name_bn})"

class Union(models.Model):
    upazila = models.ForeignKey(Upazila, on_delete=models.CASCADE, related_name='unions')
    name_en = models.CharField(max_length=50)
    name_bn = models.CharField(max_length=50)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return f"{self.name_en} ({self.name_bn})"
