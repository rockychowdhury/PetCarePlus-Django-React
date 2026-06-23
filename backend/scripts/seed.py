"""
PetCarePlus — Production Seed Data
===================================
Run with: python manage.py shell < seed_data.py
Or create a management command that calls seed_animal_types() and seed_resources()

Tables seeded:
  - AnimalType  (8 entries)
  - Resource    (govt livestock offices by division + thematic resources)
  
All resources include bilingual content (English + Bangla).
Govt livestock officer resources are area-scoped by division with
realistic contact info and detailed benefit/support descriptions.
"""

from apps.animals.models import AnimalType
from apps.resources.models import Resource


# ──────────────────────────────────────────────────────────────────────────────
#  ANIMAL TYPES
# ──────────────────────────────────────────────────────────────────────────────

def seed_animal_types():
    animals = [
        # ── Companion pets ──────────────────────────────────────────────────
        {
            "name_en": "Cat",
            "name_bn": "বিড়াল",
            "slug": "cat",
            "category": "companion",
            "icon": "cat",
            "supports_rehoming": True,
            "supports_services": True,
        },
        {
            "name_en": "Dog",
            "name_bn": "কুকুর",
            "slug": "dog",
            "category": "companion",
            "icon": "dog",
            "supports_rehoming": True,
            "supports_services": True,
        },
        {
            "name_en": "Rabbit",
            "name_bn": "খরগোশ",
            "slug": "rabbit",
            "category": "companion",
            "icon": "rabbit",
            "supports_rehoming": False,
            "supports_services": True,
        },
        {
            "name_en": "Bird",
            "name_bn": "পোষা পাখি",
            "slug": "bird",
            "category": "companion",
            "icon": "bird",
            "supports_rehoming": False,
            "supports_services": True,
        },
        # ── Livestock ────────────────────────────────────────────────────────
        {
            "name_en": "Cow",
            "name_bn": "গরু",
            "slug": "cow",
            "category": "livestock",
            "icon": "cow",
            "supports_rehoming": False,
            "supports_services": False,
        },
        {
            "name_en": "Goat",
            "name_bn": "ছাগল",
            "slug": "goat",
            "category": "livestock",
            "icon": "goat",
            "supports_rehoming": False,
            "supports_services": False,
        },
        {
            "name_en": "Chicken",
            "name_bn": "মুরগি",
            "slug": "chicken",
            "category": "livestock",
            "icon": "chicken",
            "supports_rehoming": False,
            "supports_services": False,
        },
        {
            "name_en": "Duck",
            "name_bn": "হাঁস",
            "slug": "duck",
            "category": "livestock",
            "icon": "duck",
            "supports_rehoming": False,
            "supports_services": False,
        },
    ]

    created = 0
    for data in animals:
        obj, new = AnimalType.objects.get_or_create(slug=data["slug"], defaults=data)
        if new:
            created += 1
            print(f"  ✓ Created animal type: {obj.name_en}")
        else:
            print(f"  – Already exists: {obj.name_en}")

    print(f"\nAnimal types seeded: {created} new / {len(animals) - created} existing\n")


# ──────────────────────────────────────────────────────────────────────────────
#  RESOURCES
# ──────────────────────────────────────────────────────────────────────────────

def seed_resources():
    """
    Resource categories seeded:
      1.  Govt Livestock Officer offices — one per division (8 divisions)
      2.  Department of Livestock Services (DLS) — national
      3.  Bangladesh Veterinary Council (BVC) — national
      4.  Emergency disease outbreak contacts
      5.  Vaccination schedule information (livestock)
      6.  Vaccination schedule information (companion pets)
      7.  Cattle disease quick reference
      8.  Poultry disease quick reference
      9.  Goat disease quick reference
      10. Animal welfare and shelter (companion pets)
      11. Feed and nutrition guidelines
    """

    # ── Helper: fetch animal type slugs ─────────────────────────────────────
    def at(*slugs):
        return list(AnimalType.objects.filter(slug__in=slugs))

    all_livestock  = at("cow", "goat", "chicken", "duck")
    all_companion  = at("cat", "dog", "rabbit", "bird")
    all_animals    = all_livestock + all_companion
    cow_goat       = at("cow", "goat")
    poultry        = at("chicken", "duck")
    cat_dog        = at("cat", "dog")

    resources = []

    # ══════════════════════════════════════════════════════════════════════════
    #  SECTION 1 — GOVT LIVESTOCK OFFICER OFFICES (one per division)
    # ══════════════════════════════════════════════════════════════════════════

    divisional_offices = [
        {
            "title_en": "Divisional Livestock Officer — Dhaka Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — ঢাকা বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "The Divisional Livestock Office in Dhaka coordinates animal health, "
                "breeding, and extension services across all districts of Dhaka Division "
                "(Dhaka, Gazipur, Narayanganj, Narsingdi, Manikganj, Munshiganj, Tangail, "
                "Kishoreganj, Netrokona, Mymensingh, Jamalpur, Sherpur).\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Free or subsidised veterinary treatment at Upazila Livestock Offices — "
                "medicines dispensed at government-fixed prices, often 50–70% cheaper than private clinics.\n"
                "• Artificial Insemination (AI) service for cattle — improved breeds (Friesian cross, "
                "Sahiwal cross) to increase milk yield. Service fee is nominal (৳50–150 per visit).\n"
                "• Vaccination campaigns for Foot and Mouth Disease (FMD), Haemorrhagic Septicaemia "
                "(HS), Black Quarter (BQ), and Brucellosis — organised twice yearly, free of charge.\n"
                "• Livestock Extension Officers visit registered farms to advise on housing, feed "
                "management, and biosecurity practices.\n"
                "• Poultry vaccination drives against Newcastle Disease (Ranikhet), Fowl Pox, "
                "Gumboro (IBD), and Avian Influenza — coordinated through Upazila offices.\n"
                "• Emergency disease response — rapid field veterinary teams are dispatched "
                "during outbreak events. Report outbreaks immediately to receive priority support.\n"
                "• Training programmes for farmers on improved husbandry, seasonal disease "
                "prevention, and income diversification through goat and poultry rearing.\n"
                "• Linkage to government microloan and subsidy schemes for small and marginal "
                "livestock farmers through the Department of Livestock Services (DLS).\n\n"
                "OFFICE ADDRESS: Khamarbari, Farmgate, Dhaka-1215\n"
                "PHONE: 02-9111061\n"
                "EMAIL: dlo.dhaka@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "ঢাকা বিভাগের বিভাগীয় প্রাণিসম্পদ অফিস ঢাকা বিভাগের সকল জেলায় পশু স্বাস্থ্য, "
                "প্রজনন ও সম্প্রসারণ সেবা সমন্বয় করে।\n\n"
                "কৃষক ও পশু মালিকদের জন্য সুবিধা ও সেবাসমূহ:\n"
                "• উপজেলা প্রাণিসম্পদ অফিসে বিনামূল্যে বা ভর্তুকি মূল্যে পশু চিকিৎসা সেবা — "
                "সরকার নির্ধারিত মূল্যে ওষুধ প্রদান, বেসরকারি ক্লিনিকের তুলনায় ৫০-৭০% সাশ্রয়ী।\n"
                "• গরুর কৃত্রিম প্রজনন (এআই) সেবা — উন্নত জাতের (ফ্রিজিয়ান ক্রস, সাহিওয়াল ক্রস) "
                "মাধ্যমে দুধের উৎপাদন বৃদ্ধি। নামমাত্র ফি (৳৫০-১৫০)।\n"
                "• ক্ষুরারোগ (এফএমডি), গলাফোলা, তড়কা ও ব্রুসেলোসিস রোগের বিরুদ্ধে টিকাদান অভিযান "
                "— বছরে দুইবার, বিনামূল্যে।\n"
                "• প্রাণিসম্পদ সম্প্রসারণ কর্মকর্তারা নিবন্ধিত খামার পরিদর্শন করে আবাসন, "
                "খাদ্য ব্যবস্থাপনা ও জৈব নিরাপত্তা বিষয়ে পরামর্শ দেন।\n"
                "• হাঁস-মুরগির রোগের বিরুদ্ধে টিকাদান — নিউক্যাসল রোগ, ফাউল পক্স, গামবোরো ও "
                "বার্ড ফ্লু প্রতিরোধে উপজেলা অফিসের মাধ্যমে সমন্বিত।\n"
                "• রোগ প্রাদুর্ভাবে জরুরি সাড়া — দ্রুত মাঠ পশু চিকিৎসা দল প্রেরণ।\n"
                "• উন্নত পশুপালন, মৌসুমী রোগ প্রতিরোধ ও আয় বৈচিত্র্যকরণে কৃষক প্রশিক্ষণ।\n\n"
                "অফিস ঠিকানা: খামারবাড়ি, ফার্মগেট, ঢাকা-১২১৫\n"
                "ফোন: ০২-৯১১১০৬১\n"
                "ইমেইল: dlo.dhaka@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Divisional Livestock Officer — Chittagong Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — চট্টগ্রাম বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "The Chittagong Divisional Livestock Office oversees animal health services "
                "for Chittagong, Cox's Bazar, Feni, Noakhali, Lakshmipur, Comilla, "
                "Chandpur, Brahmanbaria, Khagrachari, Rangamati, and Bandarban districts.\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Free veterinary first aid and disease diagnosis at all Upazila Livestock Offices "
                "in the division. Referral to district or divisional animal hospital for complex cases.\n"
                "• Cattle breeding improvement through AI — Brahman cross and Friesian cross strains "
                "are available, recommended for the hilly and coastal climate of this region.\n"
                "• Vaccination against FMD, HS, and BQ — particularly important in coastal belt "
                "districts (Cox's Bazar, Noakhali) where animal movement is high.\n"
                "• Poultry disease surveillance — Avian Influenza monitoring is active in live "
                "bird market areas. Farmers near markets should report unusual mortality immediately.\n"
                "• Special extension programme for the Chittagong Hill Tracts (CHT) — "
                "mobile veterinary teams operate in Khagrachari, Rangamati, and Bandarban "
                "to reach remote farming communities without fixed office access.\n"
                "• Goat rearing promotion — Black Bengal goat, a high-value breed native to "
                "Bangladesh, is supported through subsidised breeding bucks and farmer training.\n"
                "• Disaster response support — after cyclones or floods, emergency feed "
                "and medicine kits are distributed to affected livestock farmers.\n"
                "• Small-scale dairy development support for peri-urban Chittagong "
                "City farmers through the Dairy Development Board (DDB) linkage.\n\n"
                "OFFICE ADDRESS: Dampara, Chittagong-4000\n"
                "PHONE: 031-636070\n"
                "EMAIL: dlo.chittagong@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "চট্টগ্রাম বিভাগীয় প্রাণিসম্পদ অফিস চট্টগ্রাম, কক্সবাজার, ফেনী, নোয়াখালী, "
                "লক্ষ্মীপুর, কুমিল্লা, চাঁদপুর, ব্রাহ্মণবাড়িয়া, খাগড়াছড়ি, রাঙ্গামাটি ও "
                "বান্দরবান জেলার প্রাণিসম্পদ স্বাস্থ্য সেবা তদারকি করে।\n\n"
                "কৃষকদের জন্য সুবিধাসমূহ:\n"
                "• বিভাগের সকল উপজেলা প্রাণিসম্পদ অফিসে বিনামূল্যে প্রাথমিক চিকিৎসা ও রোগ নির্ণয়।\n"
                "• কৃত্রিম প্রজননের মাধ্যমে গরুর জাত উন্নয়ন — ব্রাহ্মণ ক্রস ও ফ্রিজিয়ান ক্রস।\n"
                "• ক্ষুরারোগ, গলাফোলা ও তড়কার বিরুদ্ধে টিকাদান।\n"
                "• উপকূলীয় অঞ্চলে বার্ড ফ্লু নজরদারি — বাজার এলাকার কাছের কৃষকরা অস্বাভাবিক "
                "মৃত্যু অবিলম্বে জানাবেন।\n"
                "• পার্বত্য চট্টগ্রামে ভ্রাম্যমাণ পশু চিকিৎসা দল।\n"
                "• ব্ল্যাক বেঙ্গল ছাগল পালনে উৎসাহিতকরণ — ভর্তুকি মূল্যে প্রজনন পাঁঠা ও প্রশিক্ষণ।\n"
                "• দুর্যোগ পরবর্তী জরুরি খাদ্য ও ওষুধ বিতরণ।\n\n"
                "অফিস ঠিকানা: দামপাড়া, চট্টগ্রাম-৪০০০\n"
                "ফোন: ০৩১-৬৩৬০৭০\n"
                "ইমেইল: dlo.chittagong@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Divisional Livestock Officer — Rajshahi Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — রাজশাহী বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "Rajshahi Divisional Livestock Office serves Rajshahi, Natore, Naogaon, "
                "Chapainawabganj, Pabna, Sirajganj, Bogura, and Joypurhat districts.\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Rajshahi and Sirajganj are among Bangladesh's most important cattle-rearing "
                "districts. The divisional office runs an expanded AI programme covering over "
                "60 upazilas with daily AI services from registered Livestock Field Assistants (LFAs).\n"
                "• Milk collection and cooperative linkage support — farmers in Sirajganj and Pabna "
                "are linked to BRAC Dairy, Milk Vita, and local cooperatives through extension services.\n"
                "• Fattening programme support — seasonal cattle fattening before Eid ul-Adha is "
                "supported with technical guidance on feed formulation, de-worming, and health checks.\n"
                "• Vaccination — HS, FMD, and BQ vaccines are critical in this high-density "
                "cattle zone. Vaccination drives are conducted in all eight districts biannually.\n"
                "• Poultry rearing support — layer and broiler farm registration and technical support "
                "available for commercial poultry farmers.\n"
                "• Feed analysis support — samples can be sent to the Regional Feed Testing Laboratory "
                "to verify nutritional value of locally purchased feed.\n"
                "• Zoonotic disease surveillance — Brucellosis and Anthrax monitoring is active "
                "given the high cattle density in this region.\n\n"
                "OFFICE ADDRESS: Rajshahi Government Livestock Office, Rajshahi-6000\n"
                "PHONE: 0721-772315\n"
                "EMAIL: dlo.rajshahi@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "রাজশাহী বিভাগীয় প্রাণিসম্পদ অফিস রাজশাহী, নাটোর, নওগাঁ, চাঁপাইনবাবগঞ্জ, "
                "পাবনা, সিরাজগঞ্জ, বগুড়া ও জয়পুরহাট জেলায় সেবা প্রদান করে।\n\n"
                "কৃষকদের জন্য সুবিধাসমূহ:\n"
                "• রাজশাহী ও সিরাজগঞ্জে সম্প্রসারিত কৃত্রিম প্রজনন কর্মসূচি — ৬০টিরও বেশি "
                "উপজেলায় নিবন্ধিত প্রাণিসম্পদ মাঠ সহকারী (এলএফএ) দ্বারা দৈনিক সেবা।\n"
                "• দুধ সংগ্রহ ও সমবায় সংযোগ — ব্র্যাক ডেইরি, মিল্ক ভিটা ও স্থানীয় সমবায়ের সাথে "
                "সিরাজগঞ্জ ও পাবনার কৃষকদের সংযুক্তি।\n"
                "• ঈদুল আযহার আগে গরু মোটাতাজাকরণ কর্মসূচিতে প্রযুক্তিগত সহায়তা।\n"
                "• গলাফোলা, ক্ষুরারোগ ও তড়কার টিকাদান — বছরে দুইবার সকল জেলায়।\n"
                "• লেয়ার ও ব্রয়লার ফার্ম নিবন্ধন ও প্রযুক্তিগত সহায়তা।\n"
                "• আঞ্চলিক ফিড পরীক্ষাগারে পশু খাদ্যের পুষ্টিমান নির্ণয়।\n\n"
                "অফিস ঠিকানা: রাজশাহী সরকারি প্রাণিসম্পদ অফিস, রাজশাহী-৬০০০\n"
                "ফোন: ০৭২১-৭৭২৩১৫\n"
                "ইমেইল: dlo.rajshahi@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Divisional Livestock Officer — Khulna Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — খুলনা বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "Khulna Divisional Livestock Office serves Khulna, Bagerhat, Satkhira, "
                "Jessore, Narail, Magura, Jhenaidah, Chuadanga, Meherpur, and Kushtia districts.\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Duck rearing is particularly common in the low-lying haor and beel areas "
                "of Khulna division. The office provides specialised extension support for "
                "duck farmers, including disease management and market linkage.\n"
                "• Sundarban-adjacent districts (Bagerhat, Satkhira) face unique disease "
                "pressures from wildlife contact. Emergency veterinary support is available "
                "for livestock attacked or affected by wildlife exposure.\n"
                "• Shrimp-livestock integration support — many farmers in this region combine "
                "shrimp farming with livestock rearing. The office provides guidance on "
                "preventing cross-contamination and managing health in integrated systems.\n"
                "• Goat vaccination and Black Bengal promotion — this breed thrives in the "
                "coastal belt climate. Subsidised vaccination against PPR (Peste des Petits "
                "Ruminants) and enterotoxaemia available through Upazila offices.\n"
                "• Cyclone and flood emergency livestock kits — distributed to registered "
                "farmers in Satkhira, Khulna, and Bagerhat after major weather events.\n"
                "• Mobile veterinary unit operating in Sundarbans-adjacent upazilas where "
                "road access makes fixed office visits impractical.\n\n"
                "OFFICE ADDRESS: Sonadanga, Khulna-9100\n"
                "PHONE: 041-730711\n"
                "EMAIL: dlo.khulna@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "খুলনা বিভাগীয় প্রাণিসম্পদ অফিস খুলনা, বাগেরহাট, সাতক্ষীরা, যশোর, নড়াইল, "
                "মাগুরা, ঝিনাইদহ, চুয়াডাঙ্গা, মেহেরপুর ও কুষ্টিয়া জেলায় সেবা দেয়।\n\n"
                "কৃষকদের জন্য সুবিধাসমূহ:\n"
                "• খুলনার হাওর ও বিল এলাকায় হাঁস পালনে বিশেষ সম্প্রসারণ সহায়তা — রোগ ব্যবস্থাপনা "
                "ও বাজার সংযোগ সহ।\n"
                "• সুন্দরবন সংলগ্ন জেলায় বন্যপ্রাণীর সংস্পর্শে আক্রান্ত পশুর জন্য জরুরি পশু চিকিৎসা।\n"
                "• চিংড়ি-পশুপালন সমন্বিত খামারে স্বাস্থ্য ব্যবস্থাপনায় পরামর্শ।\n"
                "• ব্ল্যাক বেঙ্গল ছাগলের জন্য পিপিআর ও এন্টারোটক্সিমিয়ার টিকা — উপজেলা "
                "অফিসের মাধ্যমে ভর্তুকি মূল্যে।\n"
                "• ঘূর্ণিঝড় ও বন্যার পর নিবন্ধিত কৃষকদের জরুরি পশু চিকিৎসা কিট বিতরণ।\n"
                "• দুর্গম সুন্দরবন সংলগ্ন উপজেলায় ভ্রাম্যমাণ পশু চিকিৎসা ইউনিট।\n\n"
                "অফিস ঠিকানা: সোনাডাঙ্গা, খুলনা-৯১০০\n"
                "ফোন: ০৪১-৭৩০৭১১\n"
                "ইমেইল: dlo.khulna@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Divisional Livestock Officer — Sylhet Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — সিলেট বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "Sylhet Divisional Livestock Office serves Sylhet, Moulvibazar, Habiganj, "
                "and Sunamganj districts.\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Tea garden livestock support — many tea estate workers maintain cattle "
                "and poultry. The divisional office coordinates with the Bangladesh Tea Board "
                "to provide veterinary extension services inside estate areas.\n"
                "• Haor-area duck and fish-integrated farming support in Sunamganj and "
                "Habiganj — seasonal extension visits during dry season when haors recede.\n"
                "• AI services for dairy cattle — Sylhet's hilly terrain means many farmers "
                "cannot transport cows to AI centres. Field-based AI service is available "
                "through LFAs in all four districts.\n"
                "• PPR vaccination for goats — Black Bengal and mixed breed goats are common "
                "in the region. PPR is a major risk; vaccination is available free at Upazila offices.\n"
                "• Avian Influenza monitoring in live bird markets — Sylhet city and Moulvibazar "
                "border areas are priority surveillance zones given cross-border poultry movement.\n"
                "• Cattle rescue coordination after flash floods — the Haor districts "
                "(Sunamganj, Habiganj) face annual flooding. Emergency livestock evacuation "
                "support is coordinated through the Upazila Livestock Officer network.\n\n"
                "OFFICE ADDRESS: Sylhet Livestock Complex, Tilagarh, Sylhet-3100\n"
                "PHONE: 0821-716038\n"
                "EMAIL: dlo.sylhet@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "সিলেট বিভাগীয় প্রাণিসম্পদ অফিস সিলেট, মৌলভীবাজার, হবিগঞ্জ ও সুনামগঞ্জ "
                "জেলায় সেবা দেয়।\n\n"
                "কৃষকদের জন্য সুবিধাসমূহ:\n"
                "• চা বাগান এলাকায় গরু ও হাঁস-মুরগি পালনকারীদের জন্য বাংলাদেশ চা বোর্ডের "
                "সাথে সমন্বিত পশু চিকিৎসা সম্প্রসারণ সেবা।\n"
                "• সুনামগঞ্জ ও হবিগঞ্জের হাওর এলাকায় হাঁস ও মাছ চাষের সমন্বিত খামারে সহায়তা।\n"
                "• প্রত্যন্ত পাহাড়ি এলাকায় মাঠ পর্যায়ে কৃত্রিম প্রজনন সেবা।\n"
                "• ছাগলের পিপিআর টিকা — উপজেলা অফিসে বিনামূল্যে।\n"
                "• সীমান্তবর্তী এলাকায় বার্ড ফ্লু নজরদারি।\n"
                "• হাওর এলাকায় বন্যাকালীন পশুসম্পদ উদ্ধার ও জরুরি সহায়তা।\n\n"
                "অফিস ঠিকানা: সিলেট প্রাণিসম্পদ কমপ্লেক্স, তিলাগড়, সিলেট-৩১০০\n"
                "ফোন: ০৮২১-৭১৬০৩৮\n"
                "ইমেইল: dlo.sylhet@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Divisional Livestock Officer — Barisal Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — বরিশাল বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "Barisal Divisional Livestock Office serves Barisal, Bhola, Patuakhali, "
                "Pirojpur, Jhalokathi, and Barguna districts.\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Island and char-area livestock support — Bhola and Patuakhali have large "
                "char populations with cattle and goat herds. Mobile veterinary teams reach "
                "these communities by boat during regular field visits.\n"
                "• Duck farming extension — the delta region is ideal for duck rearing. "
                "Support includes disease management, feeding guides, and market linkage "
                "to Barisal city processors.\n"
                "• Cyclone Preparedness Programme — livestock farmers in coastal upazilas "
                "are registered for priority post-disaster support. Emergency feed banks "
                "and medicine stockpiles are maintained at district livestock offices.\n"
                "• FMD and HS vaccination critical in this region due to cattle trade "
                "movement through river routes — biannual campaigns cover all six districts.\n"
                "• Goat PPR vaccination — free at Upazila offices, with additional field "
                "camps in remote island upazilas twice yearly.\n"
                "• Income diversification support — the office promotes backyard poultry "
                "and goat rearing as a livelihood strategy for coastal fisherfolk families.\n\n"
                "OFFICE ADDRESS: Barisal Sadar, Barisal-8200\n"
                "PHONE: 0431-62395\n"
                "EMAIL: dlo.barisal@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "বরিশাল বিভাগীয় প্রাণিসম্পদ অফিস বরিশাল, ভোলা, পটুয়াখালী, পিরোজপুর, "
                "ঝালকাঠি ও বরগুনা জেলায় সেবা দেয়।\n\n"
                "কৃষকদের জন্য সুবিধাসমূহ:\n"
                "• ভোলা ও পটুয়াখালীর চরাঞ্চলে নৌকাযোগে পৌঁছানো ভ্রাম্যমাণ পশু চিকিৎসা দল।\n"
                "• ব-দ্বীপ অঞ্চলে হাঁস পালনে সম্প্রসারণ সহায়তা — রোগ ব্যবস্থাপনা, খাদ্য "
                "নির্দেশিকা ও বাজার সংযোগ।\n"
                "• উপকূলীয় উপজেলায় দুর্যোগ প্রস্তুতি কর্মসূচি — পূর্ব নিবন্ধিত কৃষকরা "
                "দুর্যোগ পরবর্তী অগ্রাধিকার ভিত্তিতে সহায়তা পাবেন।\n"
                "• ক্ষুরারোগ ও গলাফোলার টিকাদান — বছরে দুইবার।\n"
                "• দ্বীপ উপজেলায় বছরে দুইবার ছাগলের পিপিআর টিকাদান শিবির।\n"
                "• মৎস্যজীবী পরিবারের জন্য পশুপালনকে জীবিকা হিসেবে উৎসাহিতকরণ।\n\n"
                "অফিস ঠিকানা: বরিশাল সদর, বরিশাল-৮২০০\n"
                "ফোন: ০৪৩১-৬২৩৯৫\n"
                "ইমেইল: dlo.barisal@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Divisional Livestock Officer — Rangpur Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — রংপুর বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "Rangpur Divisional Livestock Office serves Rangpur, Gaibandha, Kurigram, "
                "Lalmonirhat, Nilphamari, Dinajpur, Thakurgaon, and Panchagarh districts.\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Northern Bangladesh's monga-prone districts (Kurigram, Gaibandha) "
                "depend heavily on goat and poultry rearing as lean-season income. "
                "The office runs targeted support programmes for marginal farmers in these areas.\n"
                "• Cattle fattening support — Rangpur division has significant fattening "
                "activity ahead of Eid ul-Adha. Technical support on balanced feed rations, "
                "vitamin supplementation, and health screening is available free of charge.\n"
                "• Milk Vita dairy cooperative linkage — Rangpur and Dinajpur farmers can "
                "register with Milk Vita collection points through the divisional office.\n"
                "• AI services expanded in Dinajpur, Thakurgaon, and Panchagarh — high-yield "
                "dairy breeds (Friesian, Jersey cross) are recommended for this cooler climate.\n"
                "• Char area livestock support in Kurigram and Gaibandha — seasonal field "
                "camps by boat or temporary road access after floods recede.\n"
                "• Vaccination drives — FMD, HS, BQ, and PPR, biannually across all 8 districts.\n"
                "• Poultry disease surveillance in Dinajpur — the district has significant "
                "commercial poultry activity; AI monitoring and biosecurity guidance ongoing.\n\n"
                "OFFICE ADDRESS: Rangpur Livestock Complex, Rangpur-5400\n"
                "PHONE: 0521-63452\n"
                "EMAIL: dlo.rangpur@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "রংপুর বিভাগীয় প্রাণিসম্পদ অফিস রংপুর, গাইবান্ধা, কুড়িগ্রাম, লালমনিরহাট, "
                "নীলফামারী, দিনাজপুর, ঠাকুরগাঁও ও পঞ্চগড় জেলায় সেবা দেয়।\n\n"
                "কৃষকদের জন্য সুবিধাসমূহ:\n"
                "• মঙ্গাপ্রবণ জেলায় প্রান্তিক কৃষকদের জন্য ছাগল ও হাঁস-মুরগি পালনে বিশেষ কর্মসূচি।\n"
                "• ঈদুল আযহার আগে গরু মোটাতাজাকরণে বিনামূল্যে প্রযুক্তিগত সহায়তা।\n"
                "• মিল্ক ভিটা সমবায়ের সাথে রংপুর ও দিনাজপুরের কৃষকদের নিবন্ধন সহায়তা।\n"
                "• শীতল আবহাওয়ায় উপযোগী ফ্রিজিয়ান ও জার্সি ক্রস জাতের কৃত্রিম প্রজনন।\n"
                "• কুড়িগ্রাম ও গাইবান্ধার চরাঞ্চলে মৌসুমী পশু চিকিৎসা শিবির।\n"
                "• সকল ৮ জেলায় বছরে দুইবার টিকাদান।\n\n"
                "অফিস ঠিকানা: রংপুর প্রাণিসম্পদ কমপ্লেক্স, রংপুর-৫৪০০\n"
                "ফোন: ০৫২১-৬৩৪৫২\n"
                "ইমেইল: dlo.rangpur@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Divisional Livestock Officer — Mymensingh Division",
            "title_bn": "বিভাগীয় প্রাণিসম্পদ কর্মকর্তা — ময়মনসিংহ বিভাগ",
            "resource_type": "govt",
            "description_en": (
                "Mymensingh Divisional Livestock Office serves Mymensingh, Sherpur, "
                "Jamalpur, and Netrokona districts.\n\n"
                "SERVICES AND BENEFITS FOR FARMERS:\n"
                "• Bangladesh Agricultural University (BAU), Mymensingh — the country's "
                "leading veterinary institution — is located in this division. Farmers can "
                "access the BAU Veterinary Teaching Hospital for complex or specialist cases "
                "at a very low cost (student-supervised, qualified vet-overseen).\n"
                "• Cattle breeding excellence — Mymensingh has historically been a hub for "
                "dairy cattle development. AI programme coverage is among the highest in the "
                "country; AI success rates and breed data are tracked in a divisional database.\n"
                "• Goat rearing in haor areas of Netrokona — extension support for Black "
                "Bengal and Jamunapari crossbreeds, with PPR and goat pox vaccination available.\n"
                "• Poultry training centre — the divisional livestock office runs a dedicated "
                "training facility for poultry farmers on biosecurity, vaccination schedules, "
                "layer and broiler management, and disease identification.\n"
                "• Research-linked extension — proximity to BAU means new best practices from "
                "veterinary research are adopted into extension programmes faster here than "
                "in other divisions.\n"
                "• FMD, HS, BQ vaccination coverage across all four districts biannually.\n\n"
                "OFFICE ADDRESS: Mymensingh Livestock Complex, Mymensingh-2200\n"
                "PHONE: 091-66061\n"
                "EMAIL: dlo.mymensingh@dls.gov.bd\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "ময়মনসিংহ বিভাগীয় প্রাণিসম্পদ অফিস ময়মনসিংহ, শেরপুর, জামালপুর ও "
                "নেত্রকোনা জেলায় সেবা দেয়।\n\n"
                "কৃষকদের জন্য সুবিধাসমূহ:\n"
                "• বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (বাকৃবি) পশু চিকিৎসা শিক্ষা হাসপাতালে জটিল রোগীদের "
                "স্বল্পমূল্যে বিশেষজ্ঞ চিকিৎসা সুবিধা।\n"
                "• দেশের অন্যতম শ্রেষ্ঠ কৃত্রিম প্রজনন কর্মসূচি — বিভাগীয় ডেটাবেজে জাত ও "
                "সাফল্যের হার সংরক্ষণ।\n"
                "• নেত্রকোনার হাওর এলাকায় ব্ল্যাক বেঙ্গল ও যমুনাপারি ছাগলে পিপিআর ও ছাগলবসন্ত "
                "টিকাদান।\n"
                "• হাঁস-মুরগি প্রশিক্ষণ কেন্দ্র — জৈব নিরাপত্তা, টিকাদান সময়সূচি ও রোগ "
                "শনাক্তকরণে কৃষক প্রশিক্ষণ।\n"
                "• বাকৃবির গবেষণার সাথে সংযুক্ত সম্প্রসারণ কর্মসূচি।\n"
                "• সকল ৪ জেলায় বছরে দুইবার টিকাদান।\n\n"
                "অফিস ঠিকানা: ময়মনসিংহ প্রাণিসম্পদ কমপ্লেক্স, ময়মনসিংহ-২২০০\n"
                "ফোন: ০৯১-৬৬০৬১\n"
                "ইমেইল: dlo.mymensingh@dls.gov.bd\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
    ]

    for d in divisional_offices:
        resources.append(d)

    # ══════════════════════════════════════════════════════════════════════════
    #  SECTION 2 — NATIONAL BODIES
    # ══════════════════════════════════════════════════════════════════════════

    resources += [
        {
            "title_en": "Department of Livestock Services (DLS) — National Headquarters",
            "title_bn": "প্রাণিসম্পদ অধিদফতর — জাতীয় সদর দফতর",
            "resource_type": "govt",
            "description_en": (
                "The Department of Livestock Services (DLS) is the primary government body "
                "responsible for all livestock and veterinary services in Bangladesh under the "
                "Ministry of Fisheries and Livestock.\n\n"
                "NATIONAL SERVICES:\n"
                "• Policy and programme oversight for all 8 divisional and 64 district "
                "livestock offices. Complaints about local office services can be escalated here.\n"
                "• National Livestock Disease Surveillance — tracks and responds to disease "
                "outbreaks across the country. Farmers can report unusual mass animal deaths "
                "directly to the national hotline.\n"
                "• Livestock subsidy and input support programmes — periodic government "
                "schemes providing subsidised vaccines, feed, and equipment to registered farmers.\n"
                "• Farmer registration database — registering with the local Upazila office "
                "makes you eligible for national scheme benefits distributed through DLS.\n"
                "• Information on artificial insemination charges, vaccine schedules, and "
                "government-fixed medicine prices available on the DLS website.\n"
                "• Coordination with FAO, OIE (WOAH), and international bodies on disease "
                "prevention and livestock development programmes.\n\n"
                "WEBSITE: https://dls.gov.bd\n"
                "NATIONAL HOTLINE: 16358 (Krishi Call Centre — also covers livestock)\n"
                "HEAD OFFICE: Khamarbari, Farmgate, Dhaka-1215\n"
                "PHONE: 02-9111061\n"
                "OFFICE HOURS: Sunday–Thursday, 9:00 AM – 5:00 PM"
            ),
            "description_bn": (
                "প্রাণিসম্পদ অধিদফতর (ডিএলএস) মৎস্য ও প্রাণিসম্পদ মন্ত্রণালয়ের অধীনে "
                "বাংলাদেশের সকল পশুসম্পদ ও পশু চিকিৎসা সেবার প্রধান সরকারি সংস্থা।\n\n"
                "জাতীয় সেবাসমূহ:\n"
                "• সকল ৮টি বিভাগীয় ও ৬৪টি জেলা প্রাণিসম্পদ অফিসের নীতি ও কার্যক্রম তদারকি।\n"
                "• জাতীয় পশু রোগ নজরদারি — অস্বাভাবিক গণ পশু মৃত্যু হলে সরাসরি হটলাইনে জানান।\n"
                "• ভর্তুকি মূল্যে টিকা, খাদ্য ও সরঞ্জাম সহায়তা কর্মসূচি।\n"
                "• উপজেলা অফিসে নিবন্ধন করলে জাতীয় সুবিধা প্রকল্পের আওতায় আসা যায়।\n"
                "• কৃত্রিম প্রজনন চার্জ, টিকার সময়সূচি ও সরকার নির্ধারিত ওষুধের মূল্য তালিকা "
                "ডিএলএস ওয়েবসাইটে পাওয়া যায়।\n\n"
                "ওয়েবসাইট: https://dls.gov.bd\n"
                "জাতীয় হটলাইন: ১৬৩৫৮ (কৃষি কল সেন্টার)\n"
                "প্রধান অফিস: খামারবাড়ি, ফার্মগেট, ঢাকা-১২১৫\n"
                "ফোন: ০২-৯১১১০৬১\n"
                "অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯:০০ – বিকাল ৫:০০"
            ),
            "animal_types": all_livestock,
        },
        {
            "title_en": "Bangladesh Veterinary Council (BVC) — Vet Verification",
            "title_bn": "বাংলাদেশ ভেটেরিনারি কাউন্সিল (বিভিসি) — পশুচিকিৎসক যাচাই",
            "resource_type": "govt",
            "description_en": (
                "The Bangladesh Veterinary Council (BVC) is the statutory regulatory body "
                "for the veterinary profession in Bangladesh. It maintains the official register "
                "of licensed veterinarians.\n\n"
                "HOW THIS HELPS YOU:\n"
                "• Before engaging any private veterinarian, you can verify their BVC "
                "registration number on the official BVC database to confirm they are licensed.\n"
                "• If you receive substandard or harmful treatment from a licensed vet, you "
                "can file a formal complaint with the BVC for investigation.\n"
                "• BVC registration is required for any veterinarian operating legally in "
                "Bangladesh — unregistered practitioners can be reported to the BVC.\n"
                "• The BVC sets minimum standards of care and professional conduct "
                "for the veterinary profession.\n\n"
                "WEBSITE: https://bvc.gov.bd\n"
                "ADDRESS: Khamarbari, Farmgate, Dhaka-1215\n"
                "PHONE: 02-9111040"
            ),
            "description_bn": (
                "বাংলাদেশ ভেটেরিনারি কাউন্সিল (বিভিসি) বাংলাদেশে পশু চিকিৎসা পেশার সংবিধিবদ্ধ "
                "নিয়ন্ত্রক সংস্থা। এটি লাইসেন্সপ্রাপ্ত পশু চিকিৎসকদের সরকারি নিবন্ধন "
                "রেজিস্টার পরিচালনা করে।\n\n"
                "এটি আপনার কাজে কীভাবে আসে:\n"
                "• যেকোনো বেসরকারি পশু চিকিৎসক নিয়োগের আগে বিভিসি ডেটাবেজে তাঁর নিবন্ধন নম্বর "
                "যাচাই করুন।\n"
                "• নিবন্ধিত পশু চিকিৎসকের কাছ থেকে অসন্তোষজনক বা ক্ষতিকর চিকিৎসা পেলে "
                "বিভিসিতে আনুষ্ঠানিক অভিযোগ দায়ের করতে পারবেন।\n"
                "• অনিবন্ধিত চিকিৎসকের বিরুদ্ধেও বিভিসিতে অভিযোগ জানানো যায়।\n\n"
                "ওয়েবসাইট: https://bvc.gov.bd\n"
                "ঠিকানা: খামারবাড়ি, ফার্মগেট, ঢাকা-১২১৫\n"
                "ফোন: ০২-৯১১১০৪০"
            ),
            "animal_types": all_animals,
        },
    ]

    # ══════════════════════════════════════════════════════════════════════════
    #  SECTION 3 — EMERGENCY CONTACTS
    # ══════════════════════════════════════════════════════════════════════════

    resources += [
        {
            "title_en": "Krishi Call Centre — National Agricultural and Livestock Helpline",
            "title_bn": "কৃষি কল সেন্টার — জাতীয় কৃষি ও প্রাণিসম্পদ হেল্পলাইন",
            "resource_type": "emergency",
            "description_en": (
                "The Krishi Call Centre (hotline: 16358) is a national, toll-free helpline "
                "operated 24/7 by the Ministry of Agriculture, covering both crop farming "
                "and livestock.\n\n"
                "WHAT YOU CAN GET BY CALLING 16358:\n"
                "• Immediate advice from an on-call agricultural/livestock extension officer "
                "about a sick animal, disease symptom, or emergency.\n"
                "• Contact details for the nearest Upazila Livestock Officer.\n"
                "• Information about ongoing vaccination campaigns and how to register.\n"
                "• Guidance on reporting a suspected disease outbreak in your area.\n"
                "• Basic first-aid advice for common livestock and poultry emergencies while "
                "you wait for a vet to arrive.\n\n"
                "CALL: 16358 (toll-free, 24/7)\n"
                "ALSO AVAILABLE: WhatsApp and Facebook — search 'Krishi Call Centre Bangladesh'"
            ),
            "description_bn": (
                "কৃষি কল সেন্টার (হটলাইন: ১৬৩৫৮) কৃষি মন্ত্রণালয় পরিচালিত একটি জাতীয়, "
                "বিনামূল্যে হেল্পলাইন — ২৪ ঘণ্টা, ৭ দিন চালু।\n\n"
                "১৬৩৫৮ নম্বরে ফোন করে যা পাবেন:\n"
                "• অসুস্থ পশু, রোগের লক্ষণ বা জরুরি অবস্থায় ডিউটি কর্মকর্তার তাৎক্ষণিক পরামর্শ।\n"
                "• নিকটতম উপজেলা প্রাণিসম্পদ কর্মকর্তার যোগাযোগ তথ্য।\n"
                "• চলমান টিকাদান অভিযান ও নিবন্ধন তথ্য।\n"
                "• এলাকায় রোগ প্রাদুর্ভাবের সন্দেহ হলে রিপোর্ট করার নির্দেশনা।\n"
                "• পশু চিকিৎসক আসার আগে সাধারণ জরুরি প্রাথমিক চিকিৎসার পরামর্শ।\n\n"
                "কল করুন: ১৬৩৫৮ (বিনামূল্যে, ২৪/৭)\n"
                "হোয়াটসঅ্যাপ ও ফেসবুকেও পাওয়া যায়: 'Krishi Call Centre Bangladesh'"
            ),
            "animal_types": all_animals,
        },
        {
            "title_en": "Emergency: Suspected Animal Disease Outbreak — Reporting Guide",
            "title_bn": "জরুরি: পশু রোগের প্রাদুর্ভাব সন্দেহ — রিপোর্ট করার নির্দেশিকা",
            "resource_type": "emergency",
            "description_en": (
                "If multiple animals in your farm or neighbourhood are dying or showing "
                "serious symptoms within a short period, this may indicate a disease outbreak. "
                "Act immediately.\n\n"
                "WHAT TO DO:\n"
                "1. Do NOT move sick or dead animals — this spreads disease to other farms.\n"
                "2. Separate sick animals from healthy ones immediately.\n"
                "3. Call 16358 (Krishi Call Centre) or your Upazila Livestock Officer directly.\n"
                "4. Do not slaughter or sell meat from sick animals — this is illegal "
                "and creates serious public health risk.\n"
                "5. Note the symptoms, how many animals are affected, and when it started — "
                "this information helps the vet team respond faster.\n"
                "6. For poultry: if you see sudden high mortality (many birds dying within hours), "
                "this may indicate Avian Influenza — report immediately and do not move birds.\n\n"
                "REPORTABLE DISEASES IN BANGLADESH:\n"
                "Foot and Mouth Disease (FMD), Haemorrhagic Septicaemia (HS), "
                "Anthrax, Avian Influenza (H5N1), Newcastle Disease, Brucellosis, "
                "Rabies (dogs and cats), Glanders (horses).\n\n"
                "Reporting a disease outbreak is your legal duty under the Animal Diseases "
                "Act. Early reporting saves your animals and protects your neighbours."
            ),
            "description_bn": (
                "আপনার খামারে বা আশেপাশে অল্প সময়ের মধ্যে একাধিক পশু মারা যাচ্ছে বা গুরুতর "
                "লক্ষণ দেখা যাচ্ছে? এটি রোগের প্রাদুর্ভাবের ইঙ্গিত হতে পারে। এখনই পদক্ষেপ নিন।\n\n"
                "কী করবেন:\n"
                "১. অসুস্থ বা মৃত পশু সরাবেন না — এতে রোগ ছড়িয়ে পড়ে।\n"
                "২. অবিলম্বে অসুস্থ পশুকে সুস্থ পশু থেকে আলাদা করুন।\n"
                "৩. ১৬৩৫৮ (কৃষি কল সেন্টার) অথবা উপজেলা প্রাণিসম্পদ কর্মকর্তাকে সরাসরি ফোন করুন।\n"
                "৪. অসুস্থ পশু জবাই বা মাংস বিক্রি করবেন না — এটি বেআইনি এবং মারাত্মক স্বাস্থ্য ঝুঁকি।\n"
                "৫. লক্ষণ, আক্রান্ত পশুর সংখ্যা ও শুরুর সময় নোট করুন।\n"
                "৬. হাঁস-মুরগিতে হঠাৎ ব্যাপক মৃত্যু দেখলে (কয়েক ঘণ্টায় বহু পাখি মৃত) "
                "এটি বার্ড ফ্লু হতে পারে — অবিলম্বে রিপোর্ট করুন, পাখি স্থানান্তর করবেন না।\n\n"
                "রোগের প্রাদুর্ভাব রিপোর্ট করা পশু রোগ আইনের অধীনে আপনার আইনি দায়িত্ব।"
            ),
            "animal_types": all_animals,
        },
    ]

    # ══════════════════════════════════════════════════════════════════════════
    #  SECTION 4 — VACCINATION SCHEDULES
    # ══════════════════════════════════════════════════════════════════════════

    resources += [
        {
            "title_en": "Livestock Vaccination Schedule — Cattle and Goats",
            "title_bn": "পশুসম্পদ টিকাদান সময়সূচি — গরু ও ছাগল",
            "resource_type": "vaccination",
            "description_en": (
                "CATTLE VACCINATION SCHEDULE (recommended by DLS Bangladesh):\n\n"
                "Foot and Mouth Disease (FMD / ক্ষুরারোগ):\n"
                "  - First dose: Calves at 4 months old\n"
                "  - Booster: Every 6 months throughout life\n"
                "  - Campaign: Government drives in March and September\n"
                "  - Cost: Free during government campaigns; ৳50–80 at Upazila office\n\n"
                "Haemorrhagic Septicaemia (HS / গলাফোলা):\n"
                "  - Annual vaccination, ideally before monsoon season (April–May)\n"
                "  - Cost: Free during campaigns; ৳40–60 at Upazila office\n\n"
                "Black Quarter (BQ / তড়কা):\n"
                "  - Annual vaccination, before onset of monsoon\n"
                "  - Particularly important in low-lying districts\n"
                "  - Cost: Free during campaigns\n\n"
                "Brucellosis:\n"
                "  - Heifers (female calves) vaccinated once between 4–8 months\n"
                "  - Not recommended after first pregnancy\n\n"
                "Anthrax:\n"
                "  - Only in endemic areas (some districts in Rajshahi, Sirajganj)\n"
                "  - Annual vaccination if you are in a known Anthrax zone\n\n"
                "GOAT VACCINATION SCHEDULE:\n\n"
                "PPR (Peste des Petits Ruminants / পিপিআর / ছাগলের মহামারী):\n"
                "  - Kids: Vaccinated from 4 months old\n"
                "  - Booster every 3 years\n"
                "  - Cost: Free at government campaigns; ৳30–50 at Upazila office\n\n"
                "Goat Pox (ছাগলবসন্ত):\n"
                "  - Annual vaccination recommended\n"
                "  - Especially important for Black Bengal goats\n\n"
                "Enterotoxaemia:\n"
                "  - Kids vaccinated at weaning\n"
                "  - Booster every 6 months for adults in high-risk areas"
            ),
            "description_bn": (
                "গরুর টিকাদান সময়সূচি (ডিএলএস বাংলাদেশ অনুমোদিত):\n\n"
                "ক্ষুরারোগ (FMD):\n"
                "  - প্রথম ডোজ: ৪ মাস বয়সী বাছুরে\n"
                "  - বুস্টার: সারাজীবন প্রতি ৬ মাসে\n"
                "  - সরকারি অভিযান: মার্চ ও সেপ্টেম্বর মাসে\n"
                "  - মূল্য: সরকারি অভিযানে বিনামূল্যে; উপজেলা অফিসে ৳৫০-৮০\n\n"
                "গলাফোলা (HS):\n"
                "  - বার্ষিক টিকা, বর্ষার আগে (এপ্রিল-মে)\n"
                "  - মূল্য: অভিযানে বিনামূল্যে; ৳৪০-৬০\n\n"
                "তড়কা (BQ):\n"
                "  - বার্ষিক টিকা, বর্ষার আগে\n"
                "  - নিচু এলাকায় বিশেষ গুরুত্বপূর্ণ\n\n"
                "ব্রুসেলোসিস:\n"
                "  - ৪-৮ মাস বয়সী বকনা বাছুরকে একবার\n\n"
                "ছাগলের টিকাদান সময়সূচি:\n\n"
                "পিপিআর:\n"
                "  - ৪ মাস বয়স থেকে\n"
                "  - প্রতি ৩ বছরে বুস্টার\n"
                "  - মূল্য: বিনামূল্যে অথবা ৳৩০-৫০\n\n"
                "ছাগলবসন্ত:\n"
                "  - বার্ষিক টিকা, বিশেষত ব্ল্যাক বেঙ্গল ছাগলের জন্য\n\n"
                "এন্টারোটক্সিমিয়া:\n"
                "  - দুধ ছাড়ানো বাচ্চায় প্রথম ডোজ\n"
                "  - প্রাপ্তবয়স্কে প্রতি ৬ মাসে বুস্টার"
            ),
            "animal_types": cow_goat,
        },
        {
            "title_en": "Poultry Vaccination Schedule — Chicken and Duck",
            "title_bn": "হাঁস-মুরগির টিকাদান সময়সূচি — মুরগি ও হাঁস",
            "resource_type": "vaccination",
            "description_en": (
                "CHICKEN VACCINATION SCHEDULE:\n\n"
                "Newcastle Disease (Ranikhet / রানিক্ষেত রোগ):\n"
                "  - Day 1 (hatchery): HVT or Marek's + ND combo (commercial farms)\n"
                "  - Day 7: F-strain (eye drop or drinking water)\n"
                "  - Day 21: Lasota (drinking water or spray)\n"
                "  - Day 42: Killed ND vaccine (injection) — if high-risk area\n"
                "  - Ongoing: Lasota booster every 2 months for backyard flocks\n\n"
                "Gumboro / IBD (গামবোরো রোগ):\n"
                "  - Day 14: Mild strain in drinking water\n"
                "  - Day 21: Intermediate strain in drinking water\n\n"
                "Fowl Pox (মুরগিবসন্ত):\n"
                "  - From 4–6 weeks old, wing-web stab method\n"
                "  - Repeat annually for breeder flocks\n\n"
                "Avian Influenza (AI / বার্ড ফ্লু):\n"
                "  - Government-controlled vaccine — only administered by licensed vets "
                "  or government officers during authorised campaigns.\n"
                "  - Report any suspected AI immediately to 16358.\n\n"
                "DUCK VACCINATION SCHEDULE:\n\n"
                "Duck Plague (Duck Virus Enteritis / হাঁসের প্লেগ):\n"
                "  - Ducklings from 3 weeks old: first dose\n"
                "  - Booster at 3 months\n"
                "  - Annual booster throughout life\n\n"
                "Duck Cholera (Fowl Cholera / হাঁসের কলেরা):\n"
                "  - First dose from 6 weeks old\n"
                "  - Repeat every 6 months\n\n"
                "NOTE: Ducks are natural carriers of Avian Influenza. If you keep ducks "
                "near chickens, maintain strict separation and report unusual mortality."
            ),
            "description_bn": (
                "মুরগির টিকাদান সময়সূচি:\n\n"
                "রানিক্ষেত রোগ (Newcastle Disease):\n"
                "  - ১ম দিন: বাণিজ্যিক ফার্মে হ্যাচারিতে ভ্যাকসিন\n"
                "  - ৭ম দিন: এফ-স্ট্রেইন (চোখে বা পানিতে)\n"
                "  - ২১তম দিন: লাসোটা (পানিতে বা স্প্রে)\n"
                "  - পারিবারিক মুরগিতে প্রতি ২ মাসে লাসোটা বুস্টার\n\n"
                "গামবোরো (IBD):\n"
                "  - ১৪তম দিন ও ২১তম দিন: পানিতে মিশিয়ে\n\n"
                "মুরগিবসন্ত (Fowl Pox):\n"
                "  - ৪-৬ সপ্তাহ বয়স থেকে ডানার পর্দায় ইনজেকশন\n\n"
                "বার্ড ফ্লু (AI):\n"
                "  - শুধুমাত্র সরকারি অভিযানে লাইসেন্সপ্রাপ্ত ভেটের মাধ্যমে প্রদান।\n"
                "  - সন্দেহ হলে ১৬৩৫৮ নম্বরে অবিলম্বে জানান।\n\n"
                "হাঁসের টিকাদান সময়সূচি:\n\n"
                "হাঁসের প্লেগ (Duck Plague):\n"
                "  - ৩ সপ্তাহ বয়স থেকে প্রথম ডোজ\n"
                "  - ৩ মাসে বুস্টার, এরপর বার্ষিক\n\n"
                "হাঁসের কলেরা (Duck Cholera):\n"
                "  - ৬ সপ্তাহ বয়স থেকে, প্রতি ৬ মাসে\n\n"
                "বিঃদ্রঃ হাঁস বার্ড ফ্লুর প্রাকৃতিক বাহক। মুরগির পাশে হাঁস রাখলে কঠোর বিচ্ছিন্নতা বজায় রাখুন।"
            ),
            "animal_types": poultry,
        },
        {
            "title_en": "Companion Pet Vaccination Guide — Cat and Dog",
            "title_bn": "পোষা প্রাণীর টিকাদান নির্দেশিকা — বিড়াল ও কুকুর",
            "resource_type": "vaccination",
            "description_en": (
                "DOG VACCINATION SCHEDULE:\n\n"
                "Core vaccines (required for all dogs):\n"
                "  - DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza):\n"
                "      Puppy series: 6–8 weeks, 10–12 weeks, 14–16 weeks\n"
                "      Booster: 1 year after puppy series, then every 3 years\n\n"
                "  - Rabies (জলাতঙ্ক — কুকুর):\n"
                "      First dose: 12 weeks old\n"
                "      Booster: 1 year later, then every 1–3 years (annual recommended in BD)\n"
                "      IMPORTANT: Rabies is fatal and transmissible to humans. Vaccination "
                "      is mandatory in Bangladesh. If your dog bites someone, it must be "
                "      quarantined for 10 days.\n\n"
                "Non-core (recommended):\n"
                "  - Leptospirosis: Annual, especially for dogs with outdoor or water exposure\n"
                "  - Bordetella (kennel cough): If dog is boarded or in contact with other dogs\n\n"
                "CAT VACCINATION SCHEDULE:\n\n"
                "Core vaccines:\n"
                "  - FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia):\n"
                "      Kitten series: 8 weeks, 12 weeks, 16 weeks\n"
                "      Booster: 1 year after, then every 3 years\n\n"
                "  - Rabies (বিড়ালের জলাতঙ্ক):\n"
                "      First dose: 12 weeks\n"
                "      Annual booster recommended\n\n"
                "Non-core:\n"
                "  - FeLV (Feline Leukaemia Virus): Recommended for outdoor cats\n\n"
                "WHERE TO VACCINATE IN BANGLADESH:\n"
                "• Private veterinary clinics in Dhaka, Chittagong, Sylhet, Rajshahi, Khulna\n"
                "• Bangladesh Veterinary Hospital, Dhaka (Government — low cost)\n"
                "• District Livestock Offices (limited companion pet services in some areas)"
            ),
            "description_bn": (
                "কুকুরের টিকাদান সময়সূচি:\n\n"
                "মূল টিকা (সকল কুকুরের জন্য):\n"
                "  - ডিএইচপিপি (ডিসটেম্পার, হেপাটাইটিস, পারভোভাইরাস, প্যারাইনফ্লুয়েঞ্জা):\n"
                "      বাচ্চা: ৬-৮ সপ্তাহ, ১০-১২ সপ্তাহ, ১৪-১৬ সপ্তাহ\n"
                "      বুস্টার: ১ বছর পর, এরপর প্রতি ৩ বছরে\n\n"
                "  - জলাতঙ্ক (Rabies):\n"
                "      প্রথম ডোজ: ১২ সপ্তাহ বয়সে\n"
                "      বুস্টার: ১ বছর পর, এরপর বার্ষিক\n"
                "      গুরুত্বপূর্ণ: জলাতঙ্ক মানুষে সংক্রামক ও মারাত্মক। "
                "      কুকুর কামড় দিলে ১০ দিন কোয়ারেন্টিনে রাখুন।\n\n"
                "বিড়ালের টিকাদান সময়সূচি:\n\n"
                "  - এফভিআরসিপি (ভাইরাল রাইনোট্রাকিয়াইটিস, ক্যালিসিভাইরাস, প্যানলিউকোপেনিয়া):\n"
                "      বাচ্চা: ৮, ১২, ১৬ সপ্তাহ বয়সে\n"
                "      বুস্টার: ১ বছর পর, এরপর প্রতি ৩ বছরে\n\n"
                "  - জলাতঙ্ক: ১২ সপ্তাহে প্রথম ডোজ, বার্ষিক বুস্টার\n\n"
                "বাংলাদেশে কোথায় টিকা দেওয়াবেন:\n"
                "• ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী, খুলনার বেসরকারি পশু চিকিৎসা ক্লিনিক\n"
                "• বাংলাদেশ ভেটেরিনারি হাসপাতাল, ঢাকা (সরকারি — কম খরচ)"
            ),
            "animal_types": cat_dog,
        },
    ]

    # ══════════════════════════════════════════════════════════════════════════
    #  SECTION 5 — DISEASE QUICK REFERENCES
    # ══════════════════════════════════════════════════════════════════════════

    resources += [
        {
            "title_en": "Common Cattle Diseases — Symptoms and When to Call a Vet",
            "title_bn": "গরুর সাধারণ রোগ — লক্ষণ ও কখন পশু চিকিৎসক ডাকবেন",
            "resource_type": "diseases",
            "description_en": (
                "FOOT AND MOUTH DISEASE (FMD / ক্ষুরারোগ):\n"
                "Symptoms: Blisters and sores on mouth, tongue, gums, and between hooves; "
                "excessive drooling; lameness; reduced milk production.\n"
                "Action: Isolate immediately. Call Upazila Livestock Officer. Do not move animal. "
                "Report to 16358 — this is a notifiable disease.\n\n"
                "HAEMORRHAGIC SEPTICAEMIA (গলাফোলা):\n"
                "Symptoms: Sudden high fever (41–42°C), swelling of the throat and neck, "
                "difficulty breathing, nasal discharge, death within 24–48 hours without treatment.\n"
                "Action: EMERGENCY — call vet immediately. Penicillin-based antibiotics are "
                "effective if given very early. Vaccinate remaining herd immediately.\n\n"
                "BLACK QUARTER (তড়কা):\n"
                "Symptoms: Sudden lameness, swelling of large muscle groups (hip, shoulder, neck), "
                "crackling sound when you press the swelling, high fever, rapid death.\n"
                "Action: EMERGENCY — mortality very high without fast treatment. Call vet now. "
                "Dead animals must be buried deeply with lime, not slaughtered.\n\n"
                "BLOAT (টাইমপ্যানি / পেট ফাঁপা):\n"
                "Symptoms: Distended left abdomen, difficulty breathing, animal in distress.\n"
                "Action: Walk the animal slowly. Call vet. Avoid lush green fodder on empty stomach.\n\n"
                "MILK FEVER (দুধ জ্বর — দুগ্ধবতী গাভীতে):\n"
                "Symptoms: Within 48 hours of calving — weakness, inability to stand, "
                "cold ears and legs, muscle tremors.\n"
                "Action: Call vet immediately. Calcium injection is highly effective."
            ),
            "description_bn": (
                "ক্ষুরারোগ:\n"
                "লক্ষণ: মুখ, জিহ্বা, মাড়ি ও পায়ের ক্ষুরের মাঝে ফোসকা ও ঘা; অতিরিক্ত লালা; "
                "খুঁড়িয়ে চলা; দুধ উৎপাদন কমে যাওয়া।\n"
                "করণীয়: অবিলম্বে আলাদা করুন। উপজেলা প্রাণিসম্পদ কর্মকর্তাকে ডাকুন। ১৬৩৫৮-এ জানান।\n\n"
                "গলাফোলা:\n"
                "লক্ষণ: হঠাৎ তীব্র জ্বর (৪১-৪২°C), গলা ও ঘাড়ে ফোলা, শ্বাসকষ্ট, নাক দিয়ে পানি — "
                "চিকিৎসা না করলে ২৪-৪৮ ঘণ্টায় মৃত্যু।\n"
                "করণীয়: জরুরি — এখনই পশু চিকিৎসক ডাকুন।\n\n"
                "তড়কা:\n"
                "লক্ষণ: হঠাৎ খোঁড়া হওয়া, বড় পেশীতে ফোলা, ফোলায় চাপ দিলে মড়মড় শব্দ, তীব্র জ্বর।\n"
                "করণীয়: জরুরি — মৃত্যুর হার অত্যন্ত বেশি, অবিলম্বে পশু চিকিৎসক ডাকুন।\n\n"
                "পেট ফাঁপা (টাইমপ্যানি):\n"
                "লক্ষণ: বাম পেট ফুলে ওঠা, শ্বাসকষ্ট।\n"
                "করণীয়: ধীরে হাঁটান, পশু চিকিৎসক ডাকুন।\n\n"
                "দুধ জ্বর (মিল্ক ফিভার):\n"
                "লক্ষণ: বাচ্চা দেওয়ার ৪৮ ঘণ্টার মধ্যে দুর্বলতা, উঠতে না পারা, কান ও পা ঠান্ডা।\n"
                "করণীয়: অবিলম্বে পশু চিকিৎসক ডাকুন — ক্যালসিয়াম ইনজেকশনে দ্রুত উপকার।"
            ),
            "animal_types": at("cow"),
        },
        {
            "title_en": "Common Poultry Diseases — Symptoms and Urgent Actions",
            "title_bn": "হাঁস-মুরগির সাধারণ রোগ — লক্ষণ ও জরুরি পদক্ষেপ",
            "resource_type": "diseases",
            "description_en": (
                "NEWCASTLE DISEASE (রানিক্ষেত রোগ):\n"
                "Symptoms: Twisting of neck, paralysis of legs and wings, greenish watery diarrhoea, "
                "respiratory distress, sudden high mortality in unvaccinated flock.\n"
                "Action: No treatment. Vaccinate remaining birds immediately. Cull severely affected "
                "birds. Disinfect housing. Report if mortality is high.\n\n"
                "GUMBORO / IBD (গামবোরো):\n"
                "Symptoms: Chicks 3–6 weeks old: lethargy, ruffled feathers, whitish diarrhoea, "
                "reluctance to move, mortality spike.\n"
                "Action: Improve hygiene, reduce stress. Supportive care (electrolytes in water). "
                "Prevent with vaccination at Day 14 and Day 21.\n\n"
                "FOWL CHOLERA (কলেরা):\n"
                "Symptoms: Sudden death in healthy-looking birds, greenish diarrhoea, swollen wattles.\n"
                "Action: Antibiotics (prescribed by vet). Vaccinate survivors. Dispose of carcasses safely.\n\n"
                "AVIAN INFLUENZA (বার্ড ফ্লু — H5N1):\n"
                "Symptoms: Very sudden mass death, blue discolouration of combs and wattles, "
                "severe respiratory distress, neurological signs.\n"
                "Action: EMERGENCY — do not move birds or sell. Call 16358 immediately. "
                "This is a zoonotic disease (can infect humans). Do not slaughter or consume birds.\n\n"
                "COCCIDIOSIS (রক্ত আমাশয় — বাচ্চা মুরগিতে):\n"
                "Symptoms: Bloody diarrhoea, weakness, loss of appetite in chicks under 8 weeks.\n"
                "Action: Anti-coccidial medicine (Amprolium) in water. Clean and dry the litter."
            ),
            "description_bn": (
                "রানিক্ষেত রোগ:\n"
                "লক্ষণ: ঘাড় বাঁকা হওয়া, পা ও ডানা অবশ, সবুজাভ পাতলা পায়খানা, শ্বাসকষ্ট।\n"
                "করণীয়: কোনো চিকিৎসা নেই — বাকি মুরগিকে অবিলম্বে টিকা দিন।\n\n"
                "গামবোরো (IBD):\n"
                "লক্ষণ: ৩-৬ সপ্তাহ বয়সী বাচ্চায় অলসতা, সাদাটে পাতলা পায়খানা।\n"
                "করণীয়: স্বাস্থ্যবিধি উন্নত করুন, পানিতে ইলেক্ট্রোলাইট দিন।\n\n"
                "কলেরা:\n"
                "লক্ষণ: সুস্থ দেখতে পাখির হঠাৎ মৃত্যু, সবুজ পায়খানা।\n"
                "করণীয়: পশু চিকিৎসকের পরামর্শে অ্যান্টিবায়োটিক।\n\n"
                "বার্ড ফ্লু (H5N1):\n"
                "লক্ষণ: ব্যাপক হঠাৎ মৃত্যু, ঝুঁটি নীল হওয়া, শ্বাসকষ্ট।\n"
                "করণীয়: জরুরি — পাখি সরাবেন না। ১৬৩৫৮-এ অবিলম্বে কল করুন। "
                "এটি মানুষেও সংক্রমিত হতে পারে।\n\n"
                "রক্ত আমাশয় (Coccidiosis):\n"
                "লক্ষণ: ৮ সপ্তাহের কম বয়সী বাচ্চায় রক্ত মেশানো পায়খানা।\n"
                "করণীয়: পানিতে অ্যাম্প্রোলিয়াম, লিটার শুকনো ও পরিষ্কার রাখুন।"
            ),
            "animal_types": poultry,
        },
        {
            "title_en": "Common Goat Diseases — Symptoms and Care Guide",
            "title_bn": "ছাগলের সাধারণ রোগ — লক্ষণ ও পরিচর্যা নির্দেশিকা",
            "resource_type": "diseases",
            "description_en": (
                "PPR — PESTE DES PETITS RUMINANTS (ছাগলের মহামারী / পিপিআর):\n"
                "Symptoms: High fever (40–42°C), nasal and eye discharge, painful mouth sores, "
                "severe diarrhoea, pneumonia, rapid death — mortality can reach 80% in unvaccinated herds.\n"
                "Action: No cure — prevention by vaccination is essential. "
                "Isolate affected animals. Call vet for supportive care.\n\n"
                "GOAT POX (ছাগলবসন্ত):\n"
                "Symptoms: Raised skin lesions and scabs on face, ears, and hairless body areas.\n"
                "Action: Supportive care, wound dressing. Vaccinate the healthy herd immediately.\n\n"
                "FOOT ROT (পায়ের পচা রোগ):\n"
                "Symptoms: Severe lameness, foul-smelling rot between the toes, especially in wet season.\n"
                "Action: Clean and trim hooves. Antibiotic spray (oxytetracycline). Improve drainage. "
                "Zinc sulfate foot bath helps prevent reinfection.\n\n"
                "WORM INFESTATION (কৃমি সংক্রমণ):\n"
                "Symptoms: Gradual weight loss, bottle jaw (fluid under chin), pale gums, diarrhoea.\n"
                "Action: De-worming with Albendazole or Levamisole. "
                "Rotate grazing areas. De-worm every 3–4 months.\n\n"
                "ENTEROTOXAEMIA (এন্টারোটক্সিমিয়া):\n"
                "Symptoms: Sudden death of the best-conditioned animals, convulsions, "
                "bloat — often after change in feed to richer diet.\n"
                "Action: Penicillin injection. Prevent with vaccination. Avoid sudden diet changes."
            ),
            "description_bn": (
                "পিপিআর:\n"
                "লক্ষণ: তীব্র জ্বর (৪০-৪২°C), নাক ও চোখ দিয়ে পানি, মুখে ঘা, পাতলা পায়খানা, "
                "নিউমোনিয়া — টিকাবিহীন পালে মৃত্যুহার ৮০% পর্যন্ত।\n"
                "করণীয়: চিকিৎসা নেই, টিকাই একমাত্র সুরক্ষা। অসুস্থ ছাগল আলাদা করুন।\n\n"
                "ছাগলবসন্ত:\n"
                "লক্ষণ: মুখ, কান ও লোমহীন জায়গায় উঁচু গুটি ও খোসা।\n"
                "করণীয়: সহায়ক পরিচর্যা, সুস্থ ছাগলকে অবিলম্বে টিকা দিন।\n\n"
                "পায়ের পচা রোগ:\n"
                "লক্ষণ: তীব্র খোঁড়া হওয়া, ক্ষুরের মাঝে পচন ও দুর্গন্ধ।\n"
                "করণীয়: ক্ষুর পরিষ্কার ও ছাঁটুন, অ্যান্টিবায়োটিক স্প্রে, নিষ্কাশন উন্নত করুন।\n\n"
                "কৃমি সংক্রমণ:\n"
                "লক্ষণ: ধীরে ওজন কমা, থুতনির নিচে পানি (বটল জ), ফ্যাকাশে মাড়ি।\n"
                "করণীয়: অ্যালবেন্ডাজল বা লেভামিসল দিয়ে কৃমিনাশ — প্রতি ৩-৪ মাসে।\n\n"
                "এন্টারোটক্সিমিয়া:\n"
                "লক্ষণ: সবচেয়ে সুস্থ-সবল ছাগলের হঠাৎ মৃত্যু, খিঁচুনি।\n"
                "করণীয়: পেনিসিলিন ইনজেকশন। টিকা দিন। হঠাৎ খাদ্য পরিবর্তন করবেন না।"
            ),
            "animal_types": at("goat"),
        },
    ]

    # ══════════════════════════════════════════════════════════════════════════
    #  SECTION 6 — ANIMAL WELFARE (COMPANION PETS)
    # ══════════════════════════════════════════════════════════════════════════

    resources += [
        {
            "title_en": "Obhoyaronyo Animal Welfare Foundation — Dhaka",
            "title_bn": "অভয়ারণ্য এনিমাল ওয়েলফেয়ার ফাউন্ডেশন — ঢাকা",
            "resource_type": "shelter",
            "description_en": (
                "Obhoyaronyo is one of Bangladesh's leading animal welfare organisations, "
                "based in Dhaka. It operates a shelter and provides veterinary care for stray "
                "and abandoned companion animals.\n\n"
                "SERVICES:\n"
                "• Emergency rescue and sheltering for injured or abandoned cats and dogs\n"
                "• Low-cost veterinary treatment for stray animals brought in by the public\n"
                "• Adoption facilitation — animals ready for adoption can be listed\n"
                "• Spay/neuter programme for community animals to control stray populations\n"
                "• Rabies vaccination drives for street dogs\n"
                "• Public education on responsible pet ownership\n\n"
                "CONTACT: +880 1711-XXXXXX (verify current number at their Facebook page)\n"
                "FACEBOOK: facebook.com/ObhoyaronyoBD\n"
                "LOCATION: Dhaka (exact shelter address available on Facebook)"
            ),
            "description_bn": (
                "অভয়ারণ্য বাংলাদেশের অন্যতম শীর্ষস্থানীয় পশু কল্যাণ সংগঠন, ঢাকায় অবস্থিত। "
                "এটি একটি আশ্রয়কেন্দ্র পরিচালনা করে এবং রাস্তার ও পরিত্যক্ত পোষা প্রাণীদের "
                "পশু চিকিৎসা সেবা দেয়।\n\n"
                "সেবাসমূহ:\n"
                "• আহত বা পরিত্যক্ত বিড়াল ও কুকুরের জরুরি উদ্ধার ও আশ্রয়\n"
                "• জনসাধারণের নিয়ে আসা রাস্তার পশুদের কম খরচে চিকিৎসা\n"
                "• দত্তক প্রদান সহায়তা\n"
                "• বন্ধ্যাকরণ কর্মসূচি\n"
                "• রাস্তার কুকুরের জলাতঙ্ক টিকাদান\n\n"
                "যোগাযোগ: ফেসবুক পেজে যাচাই করুন\n"
                "ফেসবুক: facebook.com/ObhoyaronyoBD"
            ),
            "animal_types": cat_dog,
        },
        {
            "title_en": "Responsible Pet Ownership — Key Guidelines for Bangladesh",
            "title_bn": "দায়িত্বশীল পোষা প্রাণী পালন — বাংলাদেশের জন্য মূল নির্দেশিকা",
            "resource_type": "information",
            "description_en": (
                "REGISTRATION:\n"
                "• Dogs must be registered with your local City Corporation or Paurashava "
                "office. Some city corporations (DNCC, DSCC in Dhaka) require annual registration "
                "and rabies vaccination proof.\n\n"
                "RABIES PREVENTION:\n"
                "• Vaccinate dogs and cats against rabies annually.\n"
                "• If a dog bites a person, quarantine the animal for 10 days and observe for signs.\n"
                "• If bitten by an unknown dog, wash the wound immediately with soap and water for "
                "15 minutes and seek post-exposure prophylaxis (PEP) from the nearest hospital.\n\n"
                "PUBLIC SAFETY:\n"
                "• Keep dogs on a leash in public spaces.\n"
                "• Do not leave pets unattended in vehicles in Bangladesh's heat.\n\n"
                "SPAYING AND NEUTERING:\n"
                "• Spaying females prevents uterine infections and reduces the number of "
                "unwanted animals. It is strongly recommended for cats and dogs not used for breeding.\n\n"
                "FEEDING:\n"
                "• Do not feed dogs cooked bones (splinter hazard), onions, garlic, or chocolate.\n"
                "• Do not feed cats dog food as their primary diet — cats require taurine "
                "which is absent in dog food.\n\n"
                "HEAT STRESS:\n"
                "• In Bangladesh's summer (April–June), never leave pets outdoors without shade "
                "and water. Flat-faced breeds (Persian cats, Pugs, Bulldogs) are especially at risk."
            ),
            "description_bn": (
                "নিবন্ধন:\n"
                "• কুকুরকে স্থানীয় সিটি কর্পোরেশন বা পৌরসভায় নিবন্ধন করুন। ঢাকায় বার্ষিক "
                "নিবন্ধন ও জলাতঙ্ক টিকার প্রমাণ দরকার হতে পারে।\n\n"
                "জলাতঙ্ক প্রতিরোধ:\n"
                "• কুকুর ও বিড়ালকে বার্ষিক জলাতঙ্ক টিকা দিন।\n"
                "• কুকুর কামড় দিলে ১০ দিন পর্যবেক্ষণে রাখুন।\n"
                "• অজানা কুকুর কামড়ালে ক্ষতস্থান সাবান-পানি দিয়ে ১৫ মিনিট ধুয়ে দ্রুত হাসপাতালে যান।\n\n"
                "সর্বজনীন নিরাপত্তা:\n"
                "• প্রকাশ্য স্থানে কুকুরকে শিকলে রাখুন।\n\n"
                "বন্ধ্যাকরণ:\n"
                "• প্রজননে ব্যবহৃত না হলে বিড়াল ও কুকুরের বন্ধ্যাকরণ দৃঢ়ভাবে প্রস্তাবিত।\n\n"
                "খাওয়ানো:\n"
                "• কুকুরকে সেদ্ধ হাড়, পেঁয়াজ, রসুন বা চকোলেট দেবেন না।\n"
                "• বিড়ালকে কুকুরের খাবার মূল খাদ্য হিসেবে দেবেন না।\n\n"
                "তাপ:\n"
                "• গ্রীষ্মে (এপ্রিল-জুন) পোষা প্রাণীকে ছায়া ও পানি ছাড়া বাইরে রাখবেন না।"
            ),
            "animal_types": all_companion,
        },
        {
            "title_en": "Feed and Nutrition Guide — Cattle, Goat, Chicken",
            "title_bn": "খাদ্য ও পুষ্টি নির্দেশিকা — গরু, ছাগল, মুরগি",
            "resource_type": "food",
            "description_en": (
                "CATTLE NUTRITION (Daily requirements for a 200–250 kg cow):\n"
                "• Dry matter intake: 6–8 kg/day\n"
                "• Green fodder: 20–25 kg (napier grass, para grass, maize silage)\n"
                "• Dry fodder: 3–5 kg (rice straw, wheat straw)\n"
                "• Concentrate: 1–2 kg per day for dry cows; 1 kg extra per 3 litres of milk produced\n"
                "• Salt: 30–50 g/day (mineral salt block recommended)\n"
                "• Water: minimum 30–40 litres per day; more in summer\n\n"
                "GOAT NUTRITION:\n"
                "• Goats are browsers, not grazers — they prefer leaves and shrubs over grass.\n"
                "• Daily green fodder: 1.5–2 kg for adult goat\n"
                "• Concentrate supplement: 100–200 g per day for pregnant or lactating does\n"
                "• Avoid: moist, fermenting, or mouldy fodder — causes bloat and enterotoxaemia\n"
                "• Mineral blocks recommended: prevent deficiency diseases common in Bangladesh\n\n"
                "CHICKEN (Layer) NUTRITION:\n"
                "• Commercial layer feed: 110–120 g per bird per day\n"
                "• Calcium is critical for eggshell formation — limestone or oyster shell supplement\n"
                "• Water: 250–300 ml per bird per day; increases in heat\n"
                "• Avoid: mouldy grain (aflatoxin poisoning is a serious risk in Bangladesh's humid climate)\n\n"
                "BROILER CHICKEN:\n"
                "• Starter feed (Days 1–21): high protein (22–24%)\n"
                "• Grower feed (Days 22–35): medium protein (18–20%)\n"
                "• Finisher feed (Days 36+): lower protein (16–18%), higher energy\n\n"
                "TIP: Feed testing services are available through DLS regional labs "
                "and Bangladesh Agricultural University (BAU), Mymensingh."
            ),
            "description_bn": (
                "গরুর পুষ্টি (২০০-২৫০ কেজি গরুর দৈনিক চাহিদা):\n"
                "• শুষ্ক পদার্থ গ্রহণ: ৬-৮ কেজি/দিন\n"
                "• সবুজ ঘাস: ২০-২৫ কেজি (নেপিয়ার, পারা ঘাস, ভুট্টা সাইলেজ)\n"
                "• শুকনো খাবার: ৩-৫ কেজি (ধানের খড়)\n"
                "• দানাদার: শুকনো গাভীতে ১-২ কেজি; প্রতি ৩ লিটার দুধের জন্য অতিরিক্ত ১ কেজি\n"
                "• লবণ: ৩০-৫০ গ্রাম/দিন (মিনারেল ব্লক প্রস্তাবিত)\n"
                "• পানি: কমপক্ষে ৩০-৪০ লিটার; গ্রীষ্মে আরও বেশি\n\n"
                "ছাগলের পুষ্টি:\n"
                "• ছাগল পাতা ও গুল্ম পছন্দ করে, শুধু ঘাস নয়।\n"
                "• দৈনিক সবুজ খাবার: ১.৫-২ কেজি\n"
                "• গর্ভবতী বা দুগ্ধবতী ছাগলে দানাদার সম্পূরক: ১০০-২০০ গ্রাম\n"
                "• এড়িয়ে চলুন: ভেজা, পচা বা ছাতাপড়া খাবার\n\n"
                "মুরগির পুষ্টি (লেয়ার):\n"
                "• বাণিজ্যিক লেয়ার ফিড: প্রতি মুরগিতে ১১০-১২০ গ্রাম/দিন\n"
                "• চুনাপাথর বা ঝিনুকের খোল: ডিমের খোসার জন্য ক্যালসিয়াম\n"
                "• পানি: প্রতি মুরগিতে ২৫০-৩০০ মি.লি./দিন\n\n"
                "ব্রয়লার মুরগি:\n"
                "• ১-২১ দিন: স্টার্টার ফিড (উচ্চ প্রোটিন ২২-২৪%)\n"
                "• ২২-৩৫ দিন: গ্রোয়ার ফিড (১৮-২০% প্রোটিন)\n"
                "• ৩৬ দিনের পর: ফিনিশার ফিড (১৬-১৮% প্রোটিন)"
            ),
            "animal_types": all_livestock,
        },
    ]

    # ── Seed all resources ───────────────────────────────────────────────────
    created = 0
    for data in resources:
        animals_for_resource = data.pop("animal_types", [])
        obj, new = Resource.objects.get_or_create(
            title_en=data["title_en"],
            defaults=data
        )
        if new:
            obj.animal_types.set(animals_for_resource)
            created += 1
            print(f"  ✓ Created resource: {obj.title_en[:60]}")
        else:
            print(f"  – Already exists: {obj.title_en[:60]}")

    print(f"\nResources seeded: {created} new / {len(resources) - created} existing\n")


# ──────────────────────────────────────────────────────────────────────────────
#  RUN
# ──────────────────────────────────────────────────────────────────────────────

print("=" * 60)
print("PetCarePlus — Seeding animal types...")
print("=" * 60)
seed_animal_types()

print("=" * 60)
print("PetCarePlus — Seeding resources...")
print("=" * 60)
seed_resources()

print("=" * 60)
print("Seeding complete.")
print("=" * 60)