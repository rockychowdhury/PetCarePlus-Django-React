import os
import sys
import django

# Setup Django
# Adjust path to point to backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "PetCarePlus.settings")
django.setup()

from django.core.management import call_command
from django.dispatch import Signal

# Patch Signal.send to do nothing to prevent side effects (emails, redis calls, etc)
def noop_send(self, sender, **named):
    return []

original_send = Signal.send
original_send_robust = Signal.send_robust

Signal.send = noop_send
Signal.send_robust = noop_send

print("Signals disabled. Starting data load...")
try:
    call_command('loaddata', 'data_dump.json', verbosity=3)
    print("Data load complete.")
except Exception as e:
    print(f"Error loading data: {e}")
finally:
    # Restore (not strictly necessary as script ends, but good practice)
    Signal.send = original_send
    Signal.send_robust = original_send_robust
