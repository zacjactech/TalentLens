from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import io

class MinioStorage:
    def __init__(self):
        self._client = None
        self.bucket = "resumes"

    @property
    def client(self):
        if self._client is None:
            self._client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=False
            )
            self._ensure_bucket()
        return self._client

    def _ensure_bucket(self):
        try:
            if not self._client.bucket_exists(self.bucket):
                self._client.make_bucket(self.bucket)
        except S3Error as e:
            print(f"MinIO error during bucket check: {e}")
            # Don't raise here, allow client to be returned but operations will fail later
            # which is better than crashing on import

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
        except Exception as e:
            print(f"Upload error: {e}")
            raise e

storage_client = MinioStorage()
