"""
Cloudflare R2 / AWS S3 Artifacts Client
=======================================
Provides zero-egress artifact synchronization for stateless cloud containers (Render, Fly.io, AWS).
Downloads Gold lakehouse features and trained ML models on container startup if not locally present.
"""

import os
from typing import Optional, List

class R2StorageClient:
    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        access_key_id: Optional[str] = None,
        secret_access_key: Optional[str] = None,
        bucket_name: Optional[str] = None
    ):
        self.endpoint_url = endpoint_url or os.getenv("R2_ENDPOINT_URL")
        self.access_key_id = access_key_id or os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = secret_access_key or os.getenv("R2_SECRET_ACCESS_KEY")
        self.bucket_name = bucket_name or os.getenv("R2_BUCKET_NAME", "pei-lakehouse")
        
        self.s3_client = None
        if self.endpoint_url and self.access_key_id and self.secret_access_key:
            try:
                import boto3
                from botocore.config import Config
                self.s3_client = boto3.client(
                    "s3",
                    endpoint_url=self.endpoint_url,
                    aws_access_key_id=self.access_key_id,
                    aws_secret_access_key=self.secret_access_key,
                    config=Config(signature_version="s3v4")
                )
            except Exception as e:
                print(f"[-] R2 Client Init Note (boto3 optional in local dev): {e}")

    def is_configured(self) -> bool:
        return self.s3_client is not None

    def download_artifact(self, object_key: str, local_dest: str) -> bool:
        """Downloads an object from R2 bucket to local filesystem."""
        if not self.is_configured():
            return False
            
        os.makedirs(os.path.dirname(os.path.abspath(local_dest)), exist_ok=True)
        try:
            print(f"[*] Downloading {object_key} from R2 bucket `{self.bucket_name}` -> {local_dest}...")
            self.s3_client.download_file(self.bucket_name, object_key, local_dest)
            print(f"[+] Successfully downloaded {object_key} ({os.path.getsize(local_dest):,} bytes)")
            return True
        except Exception as e:
            print(f"[-] Failed to download {object_key} from R2: {e}")
            return False

    def upload_artifact(self, local_path: str, object_key: str) -> bool:
        """Uploads a local file to R2 bucket."""
        if not self.is_configured() or not os.path.exists(local_path):
            return False
            
        try:
            print(f"[*] Uploading {local_path} -> R2 `{self.bucket_name}/{object_key}`...")
            self.s3_client.upload_file(local_path, self.bucket_name, object_key)
            print(f"[+] Successfully uploaded {object_key}")
            return True
        except Exception as e:
            print(f"[-] Failed to upload {object_key} to R2: {e}")
            return False

    def sync_startup_artifacts(self):
        """Ensures Gold features and model artifacts exist at runtime."""
        artifacts = [
            ("gold/engineering_features.parquet", "data/lakehouse/gold/engineering_features.parquet"),
            ("gold/project_health_summary.parquet", "data/lakehouse/gold/project_health_summary.parquet"),
            ("models/real_defect_predictor.pkl", "ml_engine/models/real_defect_predictor.pkl"),
            ("models/metrics_report.json", "ml_engine/models/metrics_report.json"),
            ("audit/data_quality_audit.parquet", "data/lakehouse/audit/data_quality_audit.parquet")
        ]

        if not self.is_configured():
            return

        for remote_key, local_path in artifacts:
            if not os.path.exists(local_path) or os.path.getsize(local_path) == 0:
                self.download_artifact(remote_key, local_path)
