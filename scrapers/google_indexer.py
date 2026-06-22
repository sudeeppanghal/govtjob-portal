import os
import json
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

# Load credentials from environment variable
# GOOGLE_SERVICE_ACCOUNT_JSON should contain the raw JSON string of your service account key
GOOGLE_SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")

def get_access_token() -> str:
    """Authenticates using service account info and returns a Bearer access token."""
    if not GOOGLE_SERVICE_ACCOUNT_JSON:
        return ""
    
    try:
        info = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
        scopes = ["https://www.googleapis.com/auth/indexing"]
        
        credentials = service_account.Credentials.from_service_account_info(info, scopes=scopes)
        # Refresh credentials to obtain access token
        credentials.refresh(Request())
        return credentials.token
    except Exception as e:
        print(f"Error authenticating service account for Google Indexing API: {e}")
        return ""

def submit_to_google_indexing(url: str, action: str = "URL_UPDATED") -> bool:
    """Submits a URL to the Google Indexing API to notify Googlebot of a new or updated page.
    action can be 'URL_UPDATED' (for publish/update) or 'URL_DELETED'.
    Returns True if successful, False otherwise.
    """
    token = get_access_token()
    if not token:
        print("Google Indexing API: Missing service account credentials. Skipping submission.")
        return False

    endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "url": url,
        "type": action
    }

    try:
        print(f"Submitting URL to Google Indexing API: {url} ({action})")
        response = requests.post(endpoint, json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            print("Successfully submitted URL to Google Indexing API!")
            return True
        else:
            print(f"Google Indexing API call failed. Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        print(f"Error calling Google Indexing API: {e}")
        return False
