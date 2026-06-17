import json
import os
from django.conf import settings
from django.db import transaction
from django.core.management.base import BaseCommand
from apps.locations.models import Division, District, Upazila, Union

class Command(BaseCommand):
    help = 'Seeds Bangladesh locations (Divisions, Districts, Upazilas, Unions)'

    def handle(self, *args, **kwargs):
        # paths
        eng_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'node_modules', 'bangladesh-location-data', 'locationBdDivisonsToUnionsEnglish.json')
        bng_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'node_modules', 'bangladesh-location-data', 'locationBdDivisonsToUnionsBangla.json')

        if not os.path.exists(eng_path) or not os.path.exists(bng_path):
            self.stdout.write(self.style.ERROR("Bangladesh location JSON data files not found in frontend node_modules. Please ensure you ran 'npm install bangladesh-location-data' in the frontend directory."))
            return

        self.stdout.write("Loading JSON data...")
        with open(eng_path, 'r', encoding='utf-8') as f:
            eng_data = json.load(f)

        with open(bng_path, 'r', encoding='utf-8') as f:
            bng_data = json.load(f)

        # Create maps for Bangla translation (converting string value keys to int to match English JSON keys)
        self.stdout.write("Parsing Bangla data...")
        div_bn_map = {int(item['value']): item['title'] for item in bng_data.get('divisions_bn', [])}
        
        dist_bn_map = {}
        for key, items in bng_data.get('districts_bn', {}).items():
            for item in items:
                dist_bn_map[int(item['value'])] = item['title']
                
        upz_bn_map = {}
        for key, items in bng_data.get('upazilas_bn', {}).items():
            for item in items:
                upz_bn_map[int(item['value'])] = item['title']
                
        uni_bn_map = {}
        for key, items in bng_data.get('unions_bn', {}).items():
            for item in items:
                uni_bn_map[int(item['value'])] = item['title']

        # Extract coordinates of currently seeded districts to preserve them
        self.stdout.write("Extracting existing district coordinates from DB...")
        existing_coords = {}
        for dist in District.objects.all():
            existing_coords[dist.name_en.lower()] = (dist.lat, dist.lng)

        self.stdout.write("Deleting existing location records...")
        with transaction.atomic():
            Union.objects.all().delete()
            Upazila.objects.all().delete()
            District.objects.all().delete()
            Division.objects.all().delete()

        self.stdout.write("Seeding divisions...")
        divisions_to_create = []
        div_id_map = {} # Maps JSON division value to DB Division instance
        
        with transaction.atomic():
            for div in eng_data.get('divisions_en', []):
                val = div['value']
                name_en = div['title']
                name_bn = div_bn_map.get(val, name_en)
                db_div = Division.objects.create(name_en=name_en, name_bn=name_bn)
                div_id_map[val] = db_div

        self.stdout.write("Seeding districts...")
        districts_to_create = []
        dist_id_map = {} # Maps JSON district value to DB District instance
        
        with transaction.atomic():
            for div_val, districts in eng_data.get('districts_en', {}).items():
                db_div = div_id_map.get(int(div_val))
                if not db_div:
                    continue
                for dist in districts:
                    val = dist['value']
                    name_en = dist['title']
                    name_bn = dist_bn_map.get(val, name_en)
                    # Lookup coordinates in existing database fallback
                    lat, lng = existing_coords.get(name_en.lower(), (None, None))
                    db_dist = District.objects.create(
                        division=db_div,
                        name_en=name_en,
                        name_bn=name_bn,
                        lat=lat,
                        lng=lng
                    )
                    dist_id_map[val] = db_dist

        self.stdout.write("Seeding upazilas...")
        upazilas_to_create = []
        upz_id_map = {} # Maps JSON upazila value to DB Upazila instance
        
        with transaction.atomic():
            for dist_val, upazilas in eng_data.get('upazilas_en', {}).items():
                db_dist = dist_id_map.get(int(dist_val))
                if not db_dist:
                    continue
                for upz in upazilas:
                    val = upz['value']
                    name_en = upz['title']
                    name_bn = upz_bn_map.get(val, name_en)
                    db_upz = Upazila.objects.create(
                        district=db_dist,
                        name_en=name_en,
                        name_bn=name_bn
                    )
                    upz_id_map[val] = db_upz

        self.stdout.write("Seeding unions...")
        unions_to_create = []
        
        with transaction.atomic():
            for upz_val, unions in eng_data.get('unions_en', {}).items():
                db_upz = upz_id_map.get(int(upz_val))
                if not db_upz:
                    continue
                for uni in unions:
                    val = uni['value']
                    name_en = uni['title']
                    name_bn = uni_bn_map.get(val, name_en)
                    unions_to_create.append(
                        Union(
                            upazila=db_upz,
                            name_en=name_en,
                            name_bn=name_bn
                        )
                    )
            
            # Perform bulk create in chunks of 500
            Union.objects.bulk_create(unions_to_create, batch_size=500)

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded! Created {Division.objects.count()} divisions, {District.objects.count()} districts, {Upazila.objects.count()} upazilas, and {Union.objects.count()} unions."))
