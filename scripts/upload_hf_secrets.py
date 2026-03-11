import os
import argparse
from dotenv import load_dotenv
from huggingface_hub import HfApi, login

def upload_secrets(repo_id, env_path=".env"):
    """
    Uploads secrets from a .env file to a Hugging Face Space.
    Requires HF_TOKEN to be set in the .env file or environment.
    """
    if not os.path.exists(env_path):
        print(f"Error: {env_path} not found.")
        return

    load_dotenv(env_path)
    
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        print("Error: HF_TOKEN not found in environment or .env file.")
        print("Please create one at https://huggingface.co/settings/tokens (Write access).")
        return

    api = HfApi(token=hf_token)

    # Secrets to upload
    secrets = [
        "GEMINI_API_KEY",
        "JWT_SECRET_KEY",
        "INTERNAL_API_KEY",
        "POSTGRES_PASSWORD",
        "MINIO_ROOT_PASSWORD"
    ]

    print(f"Uploading secrets to Space: {repo_id}")
    for secret_name in secrets:
        value = os.getenv(secret_name)
        if value:
            try:
                api.add_space_secret(repo_id=repo_id, key=secret_name, value=value)
                print(f"DONE: Successfully uploaded {secret_name}")
            except Exception as e:
                print(f"ERROR: Failed to upload {secret_name}: {e}")
        else:
            print(f"SKIP: {secret_name} not found in .env")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload secrets to Hugging Face Space")
    parser.add_argument("--repo", default="keyral/talentlens", help="Hugging Face Space repository ID")
    parser.add_argument("--env", default=".env", help="Path to .env file")
    
    args = parser.parse_args()
    upload_secrets(args.repo, args.env)
