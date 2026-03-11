from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import io

class MinioStorage:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False
        )
        self.bucket = "resumes"
        self._ensure_bucket()

    def _ensure_bucket(self):
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except S3Error as e:
            print(f"MinIO error: {e}")

    def upload_file(self, file_name: str, file_data: bytes, content_type: str = "application/pdf") -> str:
        try:
            self.client.put_object(
                self.bucket,
                file_name,
                io.BytesIO(file_data),
                len(file_data),
                content_type=content_type
            )
            return file_name
        except S3Error as e:
            print(f"Upload error: {e}")
            raise e

storage_client = MinioStorage()
