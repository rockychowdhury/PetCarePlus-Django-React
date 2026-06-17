@echo off
echo Starting PetCarePlus Backend in Dev Mode...

:: Start the background task processor in a new window
start "PetCarePlus Background Tasks" cmd /k "call venv\Scripts\activate.bat && python manage.py process_tasks"

:: Start the Django development server in the current window
call venv\Scripts\activate.bat
python manage.py runserver
