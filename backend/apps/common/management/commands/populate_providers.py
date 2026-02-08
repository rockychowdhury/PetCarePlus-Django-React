"""
Django management command to populate service provider database
Run with: python manage.py populate_providers
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.services.models import (
    ServiceProvider, ServiceCategory, Species, Specialization, ServiceOption,
    FosterService, VeterinaryClinic, TrainerService, GroomerService, PetSitterService,
    ServiceMedia, BusinessHours
)
from decimal import Decimal
import random
from datetime import time

User = get_user_model()

# Image URLs provided
IMAGES = [
    "https://i.ibb.co.com/zTjrcM14/p1.jpg",
    "https://i.ibb.co.com/Z6PT0VCv/p2.jpg",
    "https://i.ibb.co.com/gMLWJQn2/p3.jpg",
    "https://i.ibb.co.com/F4W11C65/p4.jpg",
    "https://i.ibb.co.com/q3TvcnZg/p5.jpg",
    "https://i.ibb.co.com/WpYWTjRP/p6.jpg",
    "https://i.ibb.co.com/2wCFnG7/p7.jpg",
    "https://i.ibb.co.com/DfjbW78h/p8.jpg",
    "https://i.ibb.co.com/1t7ndmsp/p9.jpg",
    "https://i.ibb.co.com/S4KX8Dh4/p10.jpg",
    "https://i.ibb.co.com/bh9X2y0/p11.jpg",
    "https://i.ibb.co.com/TDPhggjC/p12.jpg",
]

# Cities with coordinates
CITIES = [
    {"city": "New York", "state": "NY", "lat": 40.7128, "lng": -74.0060, "zip": "10001"},
    {"city": "Los Angeles", "state": "CA", "lat": 34.0522, "lng": -118.2437, "zip": "90001"},
    {"city": "Chicago", "state": "IL", "lat": 41.8781, "lng": -87.6298, "zip": "60601"},
    {"city": "Houston", "state": "TX", "lat": 29.7604, "lng": -95.3698, "zip": "77001"},
    {"city": "Phoenix", "state": "AZ", "lat": 33.4484, "lng": -112.0740, "zip": "85001"},
    {"city": "Philadelphia", "state": "PA", "lat": 39.9526, "lng": -75.1652, "zip": "19019"},
    {"city": "San Antonio", "state": "TX", "lat": 29.4241, "lng": -98.4936, "zip": "78201"},
    {"city": "San Diego", "state": "CA", "lat": 32.7157, "lng": -117.1611, "zip": "92101"},
    {"city": "Dallas", "state": "TX", "lat": 32.7767, "lng": -96.7970, "zip": "75201"},
    {"city": "Austin", "state": "TX", "lat": 30.2672, "lng": -97.7431, "zip": "78701"},
    {"city": "Jacksonville", "state": "FL", "lat": 30.3322, "lng": -81.6557, "zip": "32099"},
    {"city": "Fort Worth", "state": "TX", "lat": 32.7555, "lng": -97.3308, "zip": "76101"},
    {"city": "Columbus", "state": "OH", "lat": 39.9612, "lng": -82.9988, "zip": "43004"},
    {"city": "Charlotte", "state": "NC", "lat": 35.2271, "lng": -80.8431, "zip": "28201"},
    {"city": "Indianapolis", "state": "IN", "lat": 39.7684, "lng": -86.1581, "zip": "46201"},
]

# Provider configurations (same as before)
PROVIDERS = [
    {
        "type": "foster",
        "business_name": "Loving Paws Foster Home",
        "description": """Welcome to Loving Paws Foster Home, where every animal receives the care, attention, and love they deserve. With over 10 years of experience in animal fostering, we specialize in providing a safe, nurturing environment for pets in transition. Our spacious facility includes both indoor and outdoor areas, ensuring pets have plenty of room to play and relax. We maintain strict health and safety protocols, including regular veterinary check-ups and individualized care plans for each animal. Our team is trained in behavioral assessment and rehabilitation, making us well-equipped to handle pets with special needs or behavioral challenges. We believe in transparency and provide regular updates to pet owners, including photos and progress reports. Our foster home is licensed and insured, giving you peace of mind that your pet is in professional hands.""",
        "capacity": 8,
        "daily_rate": Decimal("45.00"),
        "monthly_rate": Decimal("1100.00"),
        "weekly_discount": 15,
    },
    {
        "type": "vet",
        "business_name": "Healthy Pets Veterinary Clinic",
        "description": """Healthy Pets Veterinary Clinic is a full-service animal hospital providing comprehensive medical, surgical, and dental care. Our state-of-the-art facility is equipped with advanced diagnostic tools including digital X-ray, ultrasound, and in-house laboratory services. We pride ourselves on our compassionate approach to veterinary medicine, treating every pet as if they were our own. Our team of experienced veterinarians and certified veterinary technicians are committed to providing the highest quality care. We offer wellness exams, vaccinations, spay/neuter services, dental cleanings, emergency care, and specialized surgical procedures. Our clinic maintains a calm, stress-free environment designed to make visits as comfortable as possible for both pets and their owners. We believe in client education and take the time to explain diagnoses, treatment options, and preventive care strategies.""",
        "clinic_type": "general",
        "emergency_services": True,
        "pricing_info": "Wellness exam: $65, Vaccinations: $25-45, Dental cleaning: $250-400, Spay/Neuter: $150-350",
    },
    {
        "type": "trainer",
        "business_name": "Pawsitive Training Academy",
        "description": """Pawsitive Training Academy offers professional dog training services using science-based, positive reinforcement methods. Our certified trainers have over 15 years of combined experience working with dogs of all breeds, ages, and temperaments. We specialize in obedience training, behavior modification, puppy socialization, and advanced skills training. Our training philosophy is built on trust, respect, and clear communication between dogs and their owners. We offer private one-on-one sessions, group classes, and specialized programs for reactive dogs, separation anxiety, and aggression issues. Each training plan is customized to meet the specific needs and goals of you and your dog. We also provide virtual training sessions for clients who prefer remote learning. Our facility includes indoor and outdoor training areas, agility equipment, and a controlled socialization space.""",
        "primary_method": "positive_reinforcement",
        "years_experience": 15,
        "private_session_rate": Decimal("85.00"),
        "group_class_rate": Decimal("35.00"),
    },
    {
        "type": "groomer",
        "business_name": "Pampered Paws Grooming Salon",
        "description": """Pampered Paws Grooming Salon is your one-stop destination for professional pet grooming services. Our experienced groomers are trained in breed-specific cuts and styling, ensuring your pet looks their absolute best. We use only premium, pet-safe products including hypoallergenic shampoos and conditioners. Our full-service grooming includes bath, haircut, nail trimming, ear cleaning, and teeth brushing. We also offer specialty services such as de-shedding treatments, flea and tick baths, and creative grooming. Our salon is designed with your pet's comfort in mind, featuring non-slip surfaces, gentle handling techniques, and a calm atmosphere. We take pride in our attention to detail and our ability to work with pets of all temperaments, including anxious or senior animals. Each grooming session is tailored to your pet's specific needs and your preferences.""",
        "salon_type": "salon",
        "base_price": Decimal("55.00"),
    },
    {
        "type": "sitter",
        "business_name": "Reliable Pet Care Services",
        "description": """Reliable Pet Care Services provides professional pet sitting and dog walking services in your neighborhood. We understand that your pets are family, and we treat them with the same love and care you do. Our insured and bonded pet sitters are experienced in caring for a variety of animals and can accommodate special needs including medication administration, senior pet care, and multiple pet households. We offer flexible scheduling including daily walks, drop-in visits, and overnight house sitting. Each visit includes playtime, feeding, fresh water, and lots of affection. We also provide complimentary services such as bringing in mail, watering plants, and alternating lights to give your home a lived-in appearance. You'll receive photo updates after each visit so you can see your happy pets. Our service area covers a 15km radius, and we're available for last-minute bookings and holiday care.""",
        "walking_rate": Decimal("25.00"),
        "house_sitting_rate": Decimal("65.00"),
        "drop_in_rate": Decimal("30.00"),
        "years_experience": 8,
    },
    {
        "type": "foster",
        "business_name": "Safe Haven Animal Foster",
        "description": """Safe Haven Animal Foster is dedicated to providing temporary homes for animals in need. Our foster program has successfully cared for over 500 animals in the past five years. We specialize in caring for animals recovering from medical procedures, senior pets, and those with behavioral challenges. Our facility features climate-controlled indoor spaces and secure outdoor play areas. Each animal receives individualized attention, including enrichment activities, socialization, and basic training. We work closely with veterinarians to ensure all medical needs are met promptly. Our foster parents are trained in animal behavior and first aid, ensuring professional care around the clock. We maintain detailed records of each animal's progress and provide comprehensive handover information. Our commitment is to make the transition as smooth as possible for both the animal and their family.""",
        "capacity": 5,
        "daily_rate": Decimal("40.00"),
        "monthly_rate": Decimal("950.00"),
        "weekly_discount": 10,
    },
    {
        "type": "vet",
        "business_name": "Emergency Animal Hospital",
        "description": """Emergency Animal Hospital is a 24/7 emergency veterinary facility equipped to handle critical care situations. Our board-certified emergency veterinarians and specialized support staff are available around the clock to provide life-saving care when your pet needs it most. We have advanced diagnostic capabilities including CT scan, digital radiography, ultrasound, and a fully equipped surgical suite. Our hospital specializes in trauma care, toxin ingestion, respiratory distress, and other emergency conditions. We also offer critical care monitoring with dedicated ICU facilities. While we focus on emergency services, we work closely with your regular veterinarian to ensure continuity of care. Our compassionate team understands the stress of emergency situations and provides clear communication and support throughout your pet's treatment. We accept all major pet insurance plans and offer payment options for emergency care.""",
        "clinic_type": "emergency",
        "emergency_services": True,
        "pricing_info": "Emergency exam: $150, Critical care: $200-500/day, Emergency surgery: $800-3000",
    },
    {
        "type": "trainer",
        "business_name": "Canine Behavior Solutions",
        "description": """Canine Behavior Solutions specializes in addressing complex behavioral issues in dogs. Our certified animal behaviorist and professional trainers work with dogs exhibiting aggression, severe anxiety, fear-based behaviors, and other challenging issues. We use evidence-based behavior modification techniques combined with positive reinforcement training. Our comprehensive assessment process includes behavioral evaluation, medical history review, and environmental analysis to develop customized treatment plans. We offer in-home training sessions to address behaviors in the environment where they occur. Our services include reactivity training, separation anxiety programs, fear and phobia treatment, and aggression rehabilitation. We also provide owner education and support, recognizing that successful behavior modification requires consistency and understanding. Many of our clients come to us as a last resort, and we're proud of our success rate in helping dogs and their families achieve harmony.""",
        "primary_method": "positive_reinforcement",
        "years_experience": 12,
        "private_session_rate": Decimal("120.00"),
        "group_class_rate": None,
    },
    {
        "type": "groomer",
        "business_name": "Mobile Grooming Express",
        "description": """Mobile Grooming Express brings professional grooming services directly to your doorstep. Our fully equipped mobile grooming van includes everything needed for a complete grooming experience, from bathing and drying to cutting and styling. This convenient service eliminates the stress of transportation and waiting in a salon environment, making it ideal for anxious pets, senior animals, or busy pet owners. Our certified groomers provide personalized, one-on-one attention in a calm, private setting. We use eco-friendly, premium grooming products and maintain the highest standards of cleanliness and safety. Services include full grooming, bath and brush, nail trimming, ear cleaning, and specialty treatments. We serve a wide area and offer flexible scheduling including evenings and weekends. Each appointment is unhurried, allowing us to work at your pet's pace and ensure a positive experience.""",
        "salon_type": "mobile",
        "base_price": Decimal("75.00"),
    },
    {
        "type": "sitter",
        "business_name": "Premium Pet Sitting Co",
        "description": """Premium Pet Sitting Co offers luxury pet care services for discerning pet owners. Our professional pet sitters are carefully selected, background-checked, and trained to provide exceptional care. We specialize in caring for high-maintenance breeds, exotic pets, and animals with special medical needs. Our services go beyond basic pet sitting to include enrichment activities, training reinforcement, and detailed care logs. We're experienced in administering medications, including injections, and can coordinate with your veterinarian as needed. Each visit is customized to your pet's routine and preferences. We offer extended visit times, overnight care, and vacation packages. Our sitters are equipped with pet first aid certification and have access to 24/7 veterinary support. We provide real-time updates through our client portal, including photos, videos, and detailed visit notes. Your home security is paramount, and we follow strict protocols for key management and property security.""",
        "walking_rate": Decimal("35.00"),
        "house_sitting_rate": Decimal("95.00"),
        "drop_in_rate": Decimal("45.00"),
        "years_experience": 10,
    },
    {
        "type": "vet",
        "business_name": "Specialty Veterinary Center",
        "description": """Specialty Veterinary Center is a referral-based practice offering advanced specialty care in cardiology, oncology, orthopedic surgery, and internal medicine. Our board-certified specialists work collaboratively with your primary veterinarian to provide the highest level of specialized care. Our facility features cutting-edge diagnostic equipment including MRI, CT scan, echocardiography, and advanced laboratory services. We offer specialized surgical procedures, chemotherapy, radiation therapy, and advanced pain management. Our team includes specialists, residents, and highly trained veterinary technicians dedicated to advancing veterinary medicine. We understand that specialty care can be overwhelming, and we prioritize clear communication and compassionate support for pet owners. Our specialists take time to explain complex medical conditions and treatment options, ensuring you can make informed decisions about your pet's care. We also offer telemedicine consultations for follow-up care and second opinions.""",
        "clinic_type": "specialty",
        "emergency_services": False,
        "pricing_info": "Specialist consultation: $200-350, Advanced imaging: $800-1500, Specialty surgery: $2000-8000",
    },
    {
        "type": "trainer",
        "business_name": "Puppy Prep Training School",
        "description": """Puppy Prep Training School specializes in early puppy development and socialization. Our comprehensive puppy programs are designed to give your young dog the best start in life. We focus on critical socialization periods, basic obedience, bite inhibition, and building confidence. Our puppy kindergarten classes provide safe, supervised play with other puppies while teaching essential skills. We use positive reinforcement methods that make learning fun and build a strong bond between you and your puppy. Our curriculum includes house training guidance, crate training, leash walking, and prevention of common behavioral problems. We also offer private sessions for puppies who need extra attention or have specific challenges. Our trainers are certified in puppy development and use age-appropriate training techniques. We provide ongoing support and resources to help you navigate the exciting and sometimes challenging puppy months. Many of our graduates continue with our advanced training programs.""",
        "primary_method": "positive_reinforcement",
        "years_experience": 8,
        "private_session_rate": Decimal("75.00"),
        "group_class_rate": Decimal("30.00"),
    },
    {
        "type": "groomer",
        "business_name": "Luxury Pet Spa",
        "description": """Luxury Pet Spa offers premium grooming and spa services in an upscale, relaxing environment. Our master groomers are certified in breed-specific styling and creative grooming techniques. We provide a full range of services including luxury baths with aromatherapy, breed-specific haircuts, hand scissoring, and show grooming. Our spa menu includes specialty treatments such as deep conditioning, blueberry facials, pawdicures, and teeth brushing. We use only the finest organic and hypoallergenic products, customized to your pet's skin and coat type. Our facility features individual grooming suites to reduce stress and provide a calm, spa-like atmosphere. We also offer add-on services including nail grinding, de-shedding treatments, and creative color services. Each grooming session includes a complimentary nail trim and ear cleaning. We cater to discerning pet owners who want the very best for their companions. Appointments are scheduled with ample time to ensure an unhurried, luxurious experience.""",
        "salon_type": "salon",
        "base_price": Decimal("95.00"),
    },
    {
        "type": "foster",
        "business_name": "Compassionate Care Foster Network",
        "description": """Compassionate Care Foster Network is a community-based foster program dedicated to providing loving temporary homes for animals in crisis. Our network of trained foster volunteers provides individualized care in home environments, which is often less stressful than kennel settings. We specialize in caring for pregnant animals, nursing mothers with litters, neonatal kittens and puppies, and animals recovering from illness or surgery. Each foster home is carefully screened and provided with supplies, veterinary support, and ongoing guidance. We maintain a 24/7 support hotline for our foster families and coordinate all medical care through our partner veterinary clinics. Our program has successfully fostered over 1000 animals, with a 95% survival rate for neonatal animals. We provide comprehensive training in bottle feeding, medication administration, and recognizing signs of illness. Our foster network creates a bridge between rescue and permanent placement, giving animals the time and care they need to thrive.""",
        "capacity": 6,
        "daily_rate": Decimal("35.00"),
        "monthly_rate": Decimal("850.00"),
        "weekly_discount": 12,
    },
    {
        "type": "sitter",
        "business_name": "Adventure Dog Walking",
        "description": """Adventure Dog Walking specializes in active, enriching dog walking experiences. We go beyond the standard neighborhood walk to provide adventure hikes, beach outings, and park play sessions. Our professional dog walkers are experienced in handling multiple dogs and managing group dynamics. We offer small group walks (maximum 4 dogs) to ensure individual attention and safety. Each walk is tailored to your dog's energy level and abilities, from gentle senior strolls to high-energy trail hikes. We provide mental stimulation through scent work, training games, and exploration of new environments. All our walkers are certified in pet first aid and carry emergency supplies. We use GPS tracking so you can see where your dog has been, and we send photo updates from each adventure. Our service includes transportation in our climate-controlled vehicles, fresh water, and post-walk towel-downs. We're insured and bonded, and we maintain strict safety protocols including secure leashing and careful dog matching.""",
        "walking_rate": Decimal("40.00"),
        "house_sitting_rate": Decimal("75.00"),
        "drop_in_rate": Decimal("35.00"),
        "years_experience": 6,
    },
    {
        "type": "vet",
        "business_name": "Mobile Vet Services",
        "description": """Mobile Vet Services brings veterinary care directly to your home, providing convenience and reducing stress for both pets and owners. Our mobile clinic is fully equipped with examination equipment, diagnostic tools, and a pharmacy, allowing us to provide comprehensive care in the comfort of your home. We specialize in wellness exams, vaccinations, senior pet care, end-of-life care, and minor procedures. House calls are ideal for pets who experience severe anxiety at traditional clinics, multi-pet households, and owners with mobility challenges. Our veterinarians take time to observe pets in their natural environment, which can provide valuable insights into behavior and health. We offer flexible scheduling including evenings and weekends. Services include physical exams, blood work, urinalysis, vaccinations, microchipping, and euthanasia services. We coordinate with specialty hospitals and laboratories for advanced diagnostics when needed. Our compassionate approach and personalized service have made us a trusted choice for families who value convenience without compromising quality care.""",
        "clinic_type": "mobile",
        "emergency_services": False,
        "pricing_info": "House call exam: $95, Vaccinations: $30-50, Senior wellness panel: $150, Euthanasia: $250-400",
    },
]


class Command(BaseCommand):
    help = 'Populate database with 15 service provider accounts'

    def create_business_hours(self, provider):
        """Create standard business hours"""
        hours_config = [
            (0, time(9, 0), time(18, 0), False),  # Monday
            (1, time(9, 0), time(18, 0), False),  # Tuesday
            (2, time(9, 0), time(18, 0), False),  # Wednesday
            (3, time(9, 0), time(18, 0), False),  # Thursday
            (4, time(9, 0), time(18, 0), False),  # Friday
            (5, time(10, 0), time(16, 0), False), # Saturday
            (6, None, None, True),                 # Sunday - Closed
        ]
        
        for day, open_time, close_time, is_closed in hours_config:
            BusinessHours.objects.create(
                provider=provider,
                day=day,
                open_time=open_time,
                close_time=close_time,
                is_closed=is_closed
            )

    def handle(self, *args, **options):
        self.stdout.write("Starting service provider population...")
        
        # Get or create categories
        categories = {}
        for cat_name, slug in [
            ("Foster Care", "foster-care"),
            ("Veterinary", "veterinary"),
            ("Training", "training"),
            ("Grooming", "grooming"),
            ("Pet Sitting", "pet-sitting"),
        ]:
            cat = None
            # Try to get by slug first
            try:
                cat = ServiceCategory.objects.get(slug=slug)
            except ServiceCategory.DoesNotExist:
                # Try to get by name
                try:
                    cat = ServiceCategory.objects.get(name=cat_name)
                    # Update slug if different
                    if cat.slug != slug:
                        self.stdout.write(f"  Updating slug for {cat_name}: {cat.slug} -> {slug}")
                        cat.slug = slug
                        cat.save()
                except ServiceCategory.DoesNotExist:
                    # Create new category
                    cat = ServiceCategory.objects.create(
                        slug=slug,
                        name=cat_name,
                        description=f"{cat_name} services for pets"
                    )
                    self.stdout.write(f"  Created category: {cat_name}")
            
            categories[slug] = cat
        
        # Get or create species
        species_list = {}
        for species_name in ["Dog", "Cat", "Bird", "Rabbit", "Hamster"]:
            sp, _ = Species.objects.update_or_create(
                name=species_name,
                defaults={"slug": species_name.lower()}
            )
            species_list[species_name] = sp
        
        # Create specializations
        specializations = {}
        spec_data = [
            ("veterinary", "Emergency Care"),
            ("veterinary", "Surgery"),
            ("veterinary", "Dental Care"),
            ("training", "Behavioral Issues"),
            ("training", "Obedience"),
            ("training", "Puppy Training"),
            ("training", "Agility"),
        ]
        
        for cat_slug, spec_name in spec_data:
            spec, _ = Specialization.objects.get_or_create(
                category=categories[cat_slug],
                name=spec_name
            )
            specializations[f"{cat_slug}_{spec_name}"] = spec
        
        # Create service options
        service_options = {}
        option_data = [
            ("veterinary", "Wellness Exam", Decimal("65.00")),
            ("veterinary", "Vaccination", Decimal("35.00")),
            ("veterinary", "Dental Cleaning", Decimal("300.00")),
            ("veterinary", "Spay/Neuter", Decimal("250.00")),
            ("veterinary", "Emergency Care", Decimal("150.00")),
        ]
        
        for cat_slug, opt_name, price in option_data:
            opt, _ = ServiceOption.objects.get_or_create(
                category=categories[cat_slug],
                name=opt_name,
                defaults={"base_price": price}
            )
            service_options[f"{cat_slug}_{opt_name}"] = opt
        
        # Create providers
        for i, provider_data in enumerate(PROVIDERS, 1):
            self.stdout.write(f"\nCreating provider {i}/15: {provider_data['business_name']}")
            
            # Create user account
            email = f"provider{i}@pcp.com"
            try:
                user = User.objects.get(email=email)
                self.stdout.write(f"  User {email} already exists, updating...")
                # Ensure user is active
                if not user.is_active:
                    user.is_active = True
                    user.save()
                    self.stdout.write(f"  Activated user: {email}")
            except User.DoesNotExist:
                user = User.objects.create_user(
                    email=email,
                    password="petcareplus",
                    first_name=provider_data['business_name'].split()[0],
                    last_name="Owner",
                    role="service_provider",
                    email_verified=True,
                    is_active=True,
                )
                self.stdout.write(f"  Created user: {email}")
            
            # Get location
            location = CITIES[i % len(CITIES)]
            
            # Determine category
            type_to_category = {
                "foster": "foster-care",
                "vet": "veterinary",
                "trainer": "training",
                "groomer": "grooming",
                "sitter": "pet-sitting",
            }
            category = categories[type_to_category[provider_data['type']]]
            
            # Create or update service provider
            provider, created = ServiceProvider.objects.update_or_create(
                user=user,
                defaults={
                    "business_name": provider_data['business_name'],
                    "category": category,
                    "description": provider_data['description'],
                    "phone": f"+1-555-{1000 + i:04d}",
                    "email": email,
                    "address_line1": f"{100 + i} Main Street",
                    "city": location['city'],
                    "state": location['state'],
                    "zip_code": location['zip'],
                    "latitude": Decimal(str(location['lat'])),
                    "longitude": Decimal(str(location['lng'])),
                    "license_number": f"LIC-{10000 + i}",
                    "insurance_info": "Fully insured with $1M liability coverage",
                    "verification_status": "verified",
                    "application_status": "approved",
                }
            )
            self.stdout.write(f"  {'Created' if created else 'Updated'} provider: {provider.business_name}")
            
            # Create business hours
            if not provider.hours.exists():
                self.create_business_hours(provider)
                self.stdout.write(f"  Created business hours")
            
            # Add media
            ServiceMedia.objects.filter(provider=provider).delete()
            for idx, img_url in enumerate(IMAGES):
                is_primary = (idx == (i % len(IMAGES)))
                ServiceMedia.objects.create(
                    provider=provider,
                    file_url=img_url,
                    is_primary=is_primary,
                    alt_text=f"{provider.business_name} facility photo {idx + 1}"
                )
            self.stdout.write(f"  Added {len(IMAGES)} media files")
            
            # Create type-specific details
            if provider_data['type'] == 'foster':
                foster, created = FosterService.objects.update_or_create(
                    provider=provider,
                    defaults={
                        "capacity": provider_data['capacity'],
                        "current_count": random.randint(0, provider_data['capacity'] - 1),
                        "current_availability": "available",
                        "daily_rate": provider_data['daily_rate'],
                        "weekly_discount": provider_data['weekly_discount'],
                        "monthly_rate": provider_data['monthly_rate'],
                        "environment_details": {
                            "indoor_space": "500 sq ft",
                            "outdoor_space": "Fenced yard 1000 sq ft",
                            "climate_control": True,
                            "separate_areas": True,
                        },
                        "care_standards": {
                            "feeding_schedule": "Twice daily",
                            "exercise": "Daily walks and playtime",
                            "socialization": "Regular interaction",
                        },
                    }
                )
                foster.species_accepted.set([species_list['Dog'], species_list['Cat']])
                self.stdout.write(f"  Created foster service details")
                
            elif provider_data['type'] == 'vet':
                vet, created = VeterinaryClinic.objects.update_or_create(
                    provider=provider,
                    defaults={
                        "clinic_type": provider_data['clinic_type'],
                        "pricing_info": provider_data['pricing_info'],
                        "emergency_services": provider_data['emergency_services'],
                        "amenities": ["Digital X-Ray", "Ultrasound", "In-house Lab", "Surgical Suite", "Pharmacy"],
                    }
                )
                # Add services and species
                vet_services = [v for k, v in service_options.items() if k.startswith('veterinary_')]
                vet.services_offered.set(vet_services[:4])
                vet.species_treated.set([species_list['Dog'], species_list['Cat'], species_list['Bird']])
                self.stdout.write(f"  Created veterinary clinic details")
                
            elif provider_data['type'] == 'trainer':
                trainer, created = TrainerService.objects.update_or_create(
                    provider=provider,
                    defaults={
                        "primary_method": provider_data['primary_method'],
                        "training_philosophy": "We believe in building trust and communication through positive reinforcement, creating lasting behavioral change.",
                        "years_experience": provider_data['years_experience'],
                        "private_session_rate": provider_data['private_session_rate'],
                        "group_class_rate": provider_data.get('group_class_rate'),
                        "offers_private_sessions": True,
                        "offers_group_classes": provider_data.get('group_class_rate') is not None,
                        "offers_board_and_train": random.choice([True, False]),
                        "offers_virtual_training": True,
                        "max_clients": 15,
                        "current_client_count": random.randint(5, 12),
                        "accepting_new_clients": True,
                        "certifications": [
                            {"name": "CPDT-KA", "year": 2018},
                            {"name": "KPA CTP", "year": 2019},
                        ],
                        "package_options": [
                            {"name": "Basic Obedience Package", "sessions": 6, "price": 450},
                            {"name": "Behavior Modification Package", "sessions": 10, "price": 1000},
                        ],
                    }
                )
                # Add specializations and species
                training_specs = [v for k, v in specializations.items() if k.startswith('training_')]
                trainer.specializations.set(training_specs[:2])
                trainer.species_trained.set([species_list['Dog']])
                self.stdout.write(f"  Created trainer service details")
                
            elif provider_data['type'] == 'groomer':
                groomer, created = GroomerService.objects.update_or_create(
                    provider=provider,
                    defaults={
                        "salon_type": provider_data['salon_type'],
                        "base_price": provider_data['base_price'],
                        "service_menu": [
                            {"name": "Full Groom", "price": 65, "description": "Bath, haircut, nails, ears"},
                            {"name": "Bath & Brush", "price": 45, "description": "Bath, blow dry, brush out"},
                            {"name": "Nail Trim", "price": 15, "description": "Nail trimming and filing"},
                            {"name": "De-shedding Treatment", "price": 35, "description": "Special treatment to reduce shedding"},
                        ],
                        "amenities": ["Hypoallergenic Products", "Breed-Specific Cuts", "Gentle Handling", "One-on-One Attention"],
                    }
                )
                groomer.species_accepted.set([species_list['Dog'], species_list['Cat']])
                self.stdout.write(f"  Created groomer service details")
                
            elif provider_data['type'] == 'sitter':
                sitter, created = PetSitterService.objects.update_or_create(
                    provider=provider,
                    defaults={
                        "offers_dog_walking": True,
                        "offers_house_sitting": True,
                        "offers_drop_in_visits": True,
                        "walking_rate": provider_data['walking_rate'],
                        "house_sitting_rate": provider_data['house_sitting_rate'],
                        "drop_in_rate": provider_data['drop_in_rate'],
                        "years_experience": provider_data['years_experience'],
                        "is_insured": True,
                        "has_transport": True,
                        "service_radius_km": 15,
                    }
                )
                sitter.species_accepted.set([species_list['Dog'], species_list['Cat'], species_list['Rabbit']])
                self.stdout.write(f"  Created pet sitter service details")
        
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS(f"Database population completed successfully!"))
        self.stdout.write(self.style.SUCCESS(f"Created/Updated {len(PROVIDERS)} service providers"))
        self.stdout.write(self.style.SUCCESS(f"Password for all accounts: petcareplus"))
        self.stdout.write("="*50)
