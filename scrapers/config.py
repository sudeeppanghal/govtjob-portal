import os
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

# Load environment variables from .env file (if present)
load_dotenv()

# Supabase Credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Gemini API Credentials
GEMINI_API_KEYS = []
keys_env = os.getenv("GEMINI_API_KEYS") or os.getenv("GEMINI_API_KEY")
if keys_env:
    GEMINI_API_KEYS = [k.strip() for k in keys_env.split(",") if k.strip()]

# Validate required configuration
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is missing!")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is missing!")
if not GEMINI_API_KEYS:
    print("Warning: GEMINI_API_KEYS is empty. Scrapers will use Groq or template fallbacks.")

# Initialize Supabase Client
# Using service role key to bypass RLS policies for database inserts
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

