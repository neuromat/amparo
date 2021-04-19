# amparo
This repository contains the source code for AMPARO's Network website

AMPARO's Network is an initiative that aims to promote an improvement in the quality of life of people living with Parkinson's disease in Brazil and their families. 

## Simple step-by-step deploy:
```bash
# Clone the repository
git clone https://github.com/neuromat/amparo
cd amparo
 
# Create and activate a virtual environment:
virtualenv -p python2 venv
source venv/bin/activate
 
# Install the required dependencies:
pip install -r requirements.txt


# Make sure that the necessary settings variables are set:
cat <<-EOF > website/settings_local.py 
	import os
	
	SECRET_KEY = '$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w ${1:-32} | head -n1)'
	BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
	DEBUG = True
	ALLOWED_HOSTS = ["*"]
	STATICFILES_DIRS = [
	   os.path.join(BASE_DIR, 'static/')
	]
	DATABASES = {
	    'default': {
	        'ENGINE': 'django.db.backends.sqlite3',
	        'NAME': 'mydatabase',
	    }
	}
EOF

# Initialize the database structure:
python manage.py migrate

# Finally, run the server
python manage.py runserver --insecure -v3
```
