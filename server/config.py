import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# Base directory = project root (where instance/ folder lives)
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Security
    SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(basedir, 'instance', 'chama.db')}"
)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

    # Database: prefer DATABASE_URL from .env, fallback to local SQLite in /instance/chama.db
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Mail settings
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() in ("true", "1", "t", "yes")
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False").lower() in ("true", "1", "t", "yes")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
   
    # Frontend base URL
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Debug mode for development
    DEBUG = True
