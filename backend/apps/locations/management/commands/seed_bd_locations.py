from django.core.management.base import BaseCommand
from apps.locations.models import Division, District, Upazila, Union

class Command(BaseCommand):
    help = 'Seeds Bangladesh locations (Divisions, Districts, Upazilas, Unions)'

    def handle(self, *args, **kwargs):
        data = [
            {
                "name_en": "Dhaka",
                "name_bn": "ঢাকা",
                "districts": [
                    {
                        "name_en": "Dhaka",
                        "name_bn": "ঢাকা",
                        "lat": 23.8103,
                        "lng": 90.4125,
                        "upazilas": [
                            {
                                "name_en": "Savar",
                                "name_bn": "সাভার",
                                "unions": [
                                    {"name_en": "Aminbazar", "name_bn": "আমিনবাজার"},
                                    {"name_en": "Ashulia", "name_bn": "আশুলিয়া"}
                                ]
                            },
                            {
                                "name_en": "Dhamrai",
                                "name_bn": "ধামরাই",
                                "unions": [
                                    {"name_en": "Amta", "name_bn": "আমতা"},
                                    {"name_en": "Balia", "name_bn": "বালিয়া"}
                                ]
                            }
                        ]
                    },
                    {
                        "name_en": "Gazipur",
                        "name_bn": "গাজীপুর",
                        "lat": 23.9999,
                        "lng": 90.4203,
                        "upazilas": [
                            {
                                "name_en": "Gazipur Sadar",
                                "name_bn": "গাজীপুর সদর",
                                "unions": [
                                    {"name_en": "Mirzapur", "name_bn": "মির্জাপুর"},
                                    {"name_en": "Bhawal Garh", "name_bn": "ভাওয়াল গড়"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "name_en": "Chattogram",
                "name_bn": "চট্টগ্রাম",
                "districts": [
                    {
                        "name_en": "Chattogram",
                        "name_bn": "চট্টগ্রাম",
                        "lat": 22.3569,
                        "lng": 91.7832,
                        "upazilas": [
                            {
                                "name_en": "Hathazari",
                                "name_bn": "হাটহাজারী",
                                "unions": [
                                    {"name_en": "Mirzapur", "name_bn": "মির্জাপুর"},
                                    {"name_en": "Fatepur", "name_bn": "ফতেপুর"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "name_en": "Rajshahi",
                "name_bn": "রাজশাহী",
                "districts": [
                    {
                        "name_en": "Rajshahi",
                        "name_bn": "রাজশাহী",
                        "lat": 24.3636,
                        "lng": 88.6241,
                        "upazilas": [
                            {
                                "name_en": "Paba",
                                "name_bn": "পবা",
                                "unions": [
                                    {"name_en": "Damkur", "name_bn": "দামকুড়"},
                                    {"name_en": "Harian", "name_bn": "হরিয়ান"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "name_en": "Sylhet",
                "name_bn": "সিলেট",
                "districts": [
                    {
                        "name_en": "Sylhet",
                        "name_bn": "সিলেট",
                        "lat": 24.8949,
                        "lng": 91.8687,
                        "upazilas": [
                            {
                                "name_en": "Sylhet Sadar",
                                "name_bn": "সিলেট সদর",
                                "unions": [
                                    {"name_en": "Jalalabad", "name_bn": "জালালাবাদ"},
                                    {"name_en": "Khadimnagar", "name_bn": "খাদিমনগর"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]

        self.stdout.write("Seeding locations...")
        
        for div_data in data:
            division, _ = Division.objects.get_or_create(
                name_en=div_data['name_en'],
                defaults={'name_bn': div_data['name_bn']}
            )
            for dist_data in div_data.get('districts', []):
                district, _ = District.objects.get_or_create(
                    division=division,
                    name_en=dist_data['name_en'],
                    defaults={
                        'name_bn': dist_data['name_bn'],
                        'lat': dist_data['lat'],
                        'lng': dist_data['lng']
                    }
                )
                for upz_data in dist_data.get('upazilas', []):
                    upazila, _ = Upazila.objects.get_or_create(
                        district=district,
                        name_en=upz_data['name_en'],
                        defaults={'name_bn': upz_data['name_bn']}
                    )
                    for uni_data in upz_data.get('unions', []):
                        Union.objects.get_or_create(
                            upazila=upazila,
                            name_en=uni_data['name_en'],
                            defaults={'name_bn': uni_data['name_bn']}
                        )
        
        self.stdout.write(self.style.SUCCESS("Successfully seeded Bangladesh locations!"))
