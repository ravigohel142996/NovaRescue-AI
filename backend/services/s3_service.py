"""
AWS S3 Service for NovaRescue AI.

Handles file uploads to S3 for disaster images and reports.
"""

import os
import uuid
from typing import Optional, Tuple

from utils.logger import setup_logger

logger = setup_logger(__name__)

S3_BUCKET = os.getenv("S3_BUCKET_NAME", "novarescue-uploads")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
SIMULATION_MODE = os.getenv("SIMULATION_MODE", "true").lower() == "true"


class S3Service:
    """
    Service for interacting with AWS S3.
    Provides upload and URL generation capabilities.
    """

    def __init__(self, simulation_mode: bool = True):
        self.simulation_mode = simulation_mode or SIMULATION_MODE
        self._client = None

        if not self.simulation_mode:
            self._init_client()

    def _init_client(self):
        """Initialize the S3 client."""
        try:
            import boto3

            self._client = boto3.client(
                "s3",
                region_name=S3_REGION,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            logger.info("✅ S3 client initialized (bucket: %s)", S3_BUCKET)
        except ImportError:
            logger.error("boto3 not installed.")
            raise
        except Exception as exc:
            logger.error("Failed to initialize S3 client: %s", exc)
            raise

    def upload_file(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
        folder: str = "uploads",
    ) -> Tuple[bool, str]:
        """
        Upload a file to S3.

        Args:
            file_bytes: File content as bytes
            filename: Original filename
            content_type: MIME type of the file
            folder: S3 folder prefix

        Returns:
            Tuple of (success: bool, s3_key: str)
        """
        if self.simulation_mode:
            sim_key = f"{folder}/sim-{uuid.uuid4().hex[:8]}-{filename}"
            logger.debug("SIMULATION: Would upload to s3://%s/%s", S3_BUCKET, sim_key)
            return True, sim_key

        key = f"{folder}/{uuid.uuid4().hex[:8]}-{filename}"
        try:
            self._client.put_object(
                Bucket=S3_BUCKET,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
            logger.info("Uploaded file to s3://%s/%s", S3_BUCKET, key)
            return True, key
        except Exception as exc:
            logger.error("S3 upload failed: %s", exc)
            return False, str(exc)

    def generate_presigned_url(self, key: str, expiry_seconds: int = 3600) -> Optional[str]:
        """Generate a presigned URL for downloading a file."""
        if self.simulation_mode:
            return f"https://simulation.s3.amazonaws.com/{key}"

        try:
            url = self._client.generate_presigned_url(
                "get_object",
                Params={"Bucket": S3_BUCKET, "Key": key},
                ExpiresIn=expiry_seconds,
            )
            return url
        except Exception as exc:
            logger.error("Failed to generate presigned URL: %s", exc)
            return None
