#!/bin/bash
# Quick fix script for two typos in model files

echo "Fixing typo 1: models.JSON Field -> models.JSONField in services/models.py"
sed -i 's/models\.JSON Field(/models.JSONField(/g' /home/rocky/Projects/Pet-Adoption-Platform-Django-React/backend/apps/services/models.py

echo "Fixing typo 2: Indentation in messaging/models.py"
# This is line 166, needs to change from 7 spaces to 8 spaces
sed -i '166s/^       return/        return/' /home/rocky/Projects/Pet-Adoption-Platform-Django-React/backend/apps/messaging/models.py

echo "✅ Typos fixed!"
echo ""
echo "Next steps:"
echo "1. Activate your virtual environment"
echo "2. Run: python manage.py makemigrations"
echo "3. Run: python manage.py migrate"
