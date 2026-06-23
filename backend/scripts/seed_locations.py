import os
import sys
import json
import django

# Setup Django if run standalone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.locations.models import Division, District, Upazila, Union
from django.db import transaction

def seed_locations():
    # Load JSON files
    en_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "node_modules", "bangladesh-location-data", "locationBdDivisonsToUnionsEnglish.json"))
    bn_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "node_modules", "bangladesh-location-data", "locationBdDivisonsToUnionsBangla.json"))
    
    if not os.path.exists(en_path) or not os.path.exists(bn_path):
        print(f"Error: JSON files not found. Ensure the npm package is installed.")
        return
        
    with open(en_path, 'r', encoding='utf-8') as f:
        data_en = json.load(f)
    with open(bn_path, 'r', encoding='utf-8') as f:
        data_bn = json.load(f)

    with transaction.atomic():
        # Process Divisions
        print("Seeding Divisions...")
        divisions_bn_map = {str(item['value']): item['title'] for item in data_bn.get('divisions_bn', [])}
        
        div_id_map = {} 
        
        for div_en in data_en.get('divisions_en', []):
            val = str(div_en['value'])
            title_en = div_en['title']
            title_bn = divisions_bn_map.get(val, title_en)
            
            div_obj, _ = Division.objects.get_or_create(
                name_en=title_en,
                defaults={'name_bn': title_bn}
            )
            div_id_map[val] = div_obj
            
        # Process Districts
        print("Seeding Districts...")
        districts_bn_map = {}
        for div_id, dists in data_bn.get('districts_bn', {}).items():
            for dist in dists:
                districts_bn_map[str(dist['value'])] = dist['title']
                
        dist_id_map = {}
        for div_val, dists in data_en.get('districts_en', {}).items():
            div_obj = div_id_map.get(str(div_val))
            if not div_obj:
                continue
                
            for dist_en in dists:
                val = str(dist_en['value'])
                title_en = dist_en['title']
                title_bn = districts_bn_map.get(val, title_en)
                
                dist_obj, _ = District.objects.get_or_create(
                    name_en=title_en,
                    division=div_obj,
                    defaults={'name_bn': title_bn}
                )
                dist_id_map[val] = dist_obj
                
        # Process Upazilas FAST
        print("Seeding Upazilas...")
        upazilas_bn_map = {}
        for dist_id, upzs in data_bn.get('upazilas_bn', {}).items():
            for upz in upzs:
                upazilas_bn_map[str(upz['value'])] = upz['title']
                
        existing_upz = set(Upazila.objects.values_list('name_en', 'district_id'))
        upzs_to_create = []
        upz_id_map = {}
        
        # We need the inserted objects back to map to unions, so we save them if new, else query them.
        for dist_val, upzs in data_en.get('upazilas_en', {}).items():
            dist_obj = dist_id_map.get(str(dist_val))
            if not dist_obj: continue
            
            for upz_en in upzs:
                val = str(upz_en['value'])
                title_en = upz_en['title']
                title_bn = upazilas_bn_map.get(val, title_en)
                
                if (title_en, dist_obj.id) not in existing_upz:
                    upzs_to_create.append(Upazila(name_en=title_en, name_bn=title_bn, district=dist_obj))
        
        if upzs_to_create:
            Upazila.objects.bulk_create(upzs_to_create)
            
        # Re-fetch all upazilas to map them for unions
        all_upz = Upazila.objects.all()
        # Create a dict mapping (district_id, name_en) -> Upazila object
        upz_obj_map = {(u.district_id, u.name_en): u for u in all_upz}
        
        for dist_val, upzs in data_en.get('upazilas_en', {}).items():
            dist_obj = dist_id_map.get(str(dist_val))
            if not dist_obj: continue
            for upz_en in upzs:
                val = str(upz_en['value'])
                upz_id_map[val] = upz_obj_map.get((dist_obj.id, upz_en['title']))

        # Process Unions FAST
        print("Seeding Unions...")
        unions_bn_map = {}
        for upz_id, unis in data_bn.get('unions_bn', {}).items():
            for uni in unis:
                unions_bn_map[str(uni['value'])] = uni['title']
                
        existing_unions = set(Union.objects.values_list('name_en', 'upazila_id'))
        unions_to_create = []
        
        for upz_val, unis in data_en.get('unions_en', {}).items():
            upz_obj = upz_id_map.get(str(upz_val))
            if not upz_obj: continue
                
            for uni_en in unis:
                val = str(uni_en['value'])
                title_en = uni_en['title']
                title_bn = unions_bn_map.get(val, title_en)
                
                if (title_en, upz_obj.id) not in existing_unions:
                    unions_to_create.append(Union(name_en=title_en, name_bn=title_bn, upazila=upz_obj))

        if unions_to_create:
            Union.objects.bulk_create(unions_to_create, batch_size=1000)

        print(f"Seeding Complete! Inserted {len(unions_to_create)} new Unions.")

if __name__ == "__main__":
    seed_locations()
