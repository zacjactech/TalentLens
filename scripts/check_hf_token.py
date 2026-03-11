import os
from dotenv import load_dotenv
from huggingface_hub import HfApi

def check_token():
    load_dotenv()
    token = os.getenv("HF_TOKEN")
    if not token:
        print("HF_TOKEN missing in .env")
        return
    
    api = HfApi(token=token)
    try:
        user_info = api.whoami()
        print(f"Logged in as: {user_info['name']}")
        print(f"Token permissions: {user_info.get('auth', {}).get('accessToken', {}).get('role', 'unknown')}")
        print(f"Token scopes: {user_info.get('auth', {}).get('accessToken', {}).get('scopes', [])}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_token()
