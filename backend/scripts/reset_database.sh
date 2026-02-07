#!/bin/bash

# PetCarePlus Database Reset and Migration Script
# This script resets the database, creates fresh migrations, and populates with seed data

set -e  # Exit on error

echo "================================================"
echo "PetCarePlus Database Reset and Migration Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to backend root
cd "$(dirname "$0")/.."

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Backup database (optional, commented out by default)
# echo -e "${YELLOW}Creating database backup...${NC}"
# python manage.py dumpdata > backup_$(date +%Y%m%d_%H%M%S).json
# echo -e "${GREEN}✓ Backup created${NC}"

# Resetting database
echo -e "${YELLOW}Resetting database...${NC}"
read -p "This will DELETE all data. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Operation cancelled.${NC}"
    exit 1
fi

# Get database name from .env file
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)

echo -e "${YELLOW}Dropping database: $DB_NAME${NC}"
dropdb --if-exists $DB_NAME -U $DB_USER || true

echo -e "${YELLOW}Creating fresh database: $DB_NAME${NC}"
createdb $DB_NAME -U $DB_USER

echo -e "${GREEN}✓ Database reset complete${NC}"

# Delete all migration files except __init__.py
echo -e "${YELLOW}Deleting old migrations...${NC}"
find apps -path "*/migrations/*.py" -not -name "__init__.py" -delete
find apps -path "*/migrations/*.pyc" -delete
rm -rf apps/*/migrations/__pycache__
echo -e "${GREEN}✓ Old migrations deleted${NC}"

# Create fresh migrations
echo -e "${YELLOW}Creating fresh migrations...${NC}"
python manage.py makemigrations
echo -e "${GREEN}✓ Migrations created${NC}"

# Apply migrations
echo -e "${YELLOW}Applying migrations...${NC}"
python manage.py migrate
echo -e "${GREEN}✓ Migrations applied${NC}"

# Create superuser
echo -e "${YELLOW}Creating superuser...${NC}"
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@petcareplus.com', 'admin123', first_name='Admin', last_name='User') if not User.objects.filter(email='admin@petcareplus.com').exists() else None" | python manage.py shell
echo -e "${GREEN}✓ Superuser created (email: admin@petcareplus.com, password: admin123)${NC}"

# Run the population scripts
# Ensure the python path includes the current directory
export PYTHONPATH=$PYTHONPATH:.

echo "Populating default data..."
python scripts/populate_defaults.py

echo "Populating services data..."
python scripts/populate_services.py

echo "Populating full dummy data..."
python scripts/populate_full_data.py seed_database --users 50 --listings 50 --applications 30
echo -e "${GREEN}✓ Seed data populated${NC}"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Database setup complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Superuser credentials:"
echo -e "  Email: ${YELLOW}admin@petcareplus.com${NC}"
echo -e "  Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "You can now run: ${YELLOW}python manage.py runserver${NC}"
echo ""
