import os
import argparse
from dotenv import load_dotenv, dotenv_values
from huggingface_hub import HfApi, login

def upload_secrets(repo_id, env_path=".env"):
    """
    Uploads ALL secrets from a .env file to a Hugging Face Space.
    Requires HF_TOKEN to be set in the .env file or environment.
    """
    if not os.path.exists(env_path):
        print(f"Error: {env_path} not found.")
        return

    # Use dotenv_values to get all keys without necessarily loading them into env
    config = dotenv_values(env_path)
    
    hf_token = config.get("HF_TOKEN") or os.getenv("HF_TOKEN")
    if not hf_token:
        print("Error: HF_TOKEN not found in environment or .env file.")
        print("Please create one at https://huggingface.co/settings/tokens (Write access).")
        return

    api = HfApi(token=hf_token)

    # Keys to exclude from upload
    exclude = ["HF_TOKEN"]

    print(f"Syncing ALL secrets from {env_path} to Space: {repo_id}")
    for secret_name, value in config.items():
        if secret_name in exclude:
            continue
        
        if value:
            # Rewrite hostnames for single-container deployment on Hugging Face
            if secret_name == 'DATABASE_URL':
                value = value.replace('@postgres:5432', '@localhost:5432')
            elif secret_name == 'REDIS_URL':
                value = value.replace('redis://redis:6379', 'redis://localhost:6379')
            elif secret_name == 'MINIO_ENDPOINT':
                value = value.replace('minio:9000', 'localhost:9000')

            try:
                # Add secret to Space (overwrites if exists)
                api.add_space_secret(repo_id=repo_id, key=secret_name, value=value)
                print(f"DONE: Successfully synced {secret_name}")
            except Exception as e:
                print(f"ERROR: Failed to sync {secret_name}: {e}")
        else:
            print(f"SKIP: {secret_name} has no value")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload secrets to Hugging Face Space")
    parser.add_argument("--repo", default="keyral/talentlens", help="Hugging Face Space repository ID")
    parser.add_argument("--env", default=".env", help="Path to .env file")
    
    args = parser.parse_args()
    upload_secrets(args.repo, args.env)
