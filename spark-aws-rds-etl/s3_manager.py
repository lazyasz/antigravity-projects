"""
S3 Storage Manager for Cloud ETL Pipeline
Handles bucket creation, raw dataset ingestion, object retrieval, and cloud export.
"""
import logging
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from pathlib import Path
from typing import Optional, List, Dict
import io
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("S3Manager")


class S3Manager:
    def __init__(self, bucket_name: str = config.AWS_S3_BUCKET, region: str = config.AWS_REGION):
        self.bucket_name = bucket_name
        self.region = region
        self.s3_client = self._get_s3_client()

    def _get_s3_client(self):
        try:
            return boto3.client("s3", region_name=self.region)
        except Exception as e:
            logger.warning(f"Could not initialize S3 client: {e}")
            return None

    def ensure_bucket_exists(self) -> bool:
        """Verifies if the S3 bucket exists or creates it in the configured AWS region."""
        if not self.s3_client:
            logger.error("S3 client is not available. Please check your AWS credentials.")
            return False

        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"S3 Bucket '{self.bucket_name}' verified and accessible.")
            return True
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code in ("404", "NoSuchBucket"):
                logger.info(f"Bucket '{self.bucket_name}' not found. Creating in region '{self.region}'...")
                try:
                    if self.region == "us-east-1":
                        self.s3_client.create_bucket(Bucket=self.bucket_name)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=self.bucket_name,
                            CreateBucketConfiguration={"LocationConstraint": self.region}
                        )
                    logger.info(f"Successfully created S3 bucket: '{self.bucket_name}'")
                    return True
                except ClientError as create_err:
                    logger.error(f"Failed to create bucket: {create_err}")
                    return False
            elif error_code == "403":
                logger.warning(f"Bucket '{self.bucket_name}' exists but permission check failed (403). Assuming bucket exists.")
                return True
            else:
                logger.error(f"Error accessing bucket '{self.bucket_name}': {e}")
                return False

    def upload_raw_dataset(self, file_path: Path, s3_key: str = config.AWS_S3_RAW_KEY) -> bool:
        """Uploads a local CSV dataset to Amazon S3."""
        if not file_path.exists():
            logger.error(f"Source file not found at: {file_path}")
            return False

        try:
            logger.info(f"Uploading '{file_path.name}' to 's3://{self.bucket_name}/{s3_key}'...")
            self.s3_client.upload_file(str(file_path), self.bucket_name, s3_key)
            logger.info(f"Upload complete: s3://{self.bucket_name}/{s3_key}")
            return True
        except (ClientError, NoCredentialsError) as e:
            logger.error(f"Failed to upload dataset to S3: {e}")
            return False

    def download_to_local(self, s3_key: str, local_destination: Path) -> bool:
        """Downloads a cloud object from S3 to a local file for PySpark processing."""
        try:
            local_destination.parent.mkdir(parents=True, exist_ok=True)
            logger.info(f"Downloading s3://{self.bucket_name}/{s3_key} to {local_destination}...")
            self.s3_client.download_file(self.bucket_name, s3_key, str(local_destination))
            logger.info("Download completed successfully.")
            return True
        except ClientError as e:
            logger.error(f"Failed to download s3://{self.bucket_name}/{s3_key}: {e}")
            return False

    def read_s3_to_string(self, s3_key: str) -> Optional[str]:
        """Reads S3 file directly into memory as a string."""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=s3_key)
            return response["Body"].read().decode("utf-8")
        except ClientError as e:
            logger.error(f"Error reading s3://{self.bucket_name}/{s3_key}: {e}")
            return None

    def upload_dataframe_as_csv(self, csv_content: str, s3_key: str) -> bool:
        """Uploads text or CSV payload directly to Amazon S3."""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=csv_content.encode("utf-8")
            )
            logger.info(f"Exported processed artifact to s3://{self.bucket_name}/{s3_key}")
            return True
        except ClientError as e:
            logger.error(f"Failed to export to S3: {e}")
            return False

    def list_bucket_objects(self, prefix: str = "") -> List[Dict[str, str]]:
        """Lists objects under the bucket prefix."""
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name, Prefix=prefix)
            contents = response.get("Contents", [])
            return [{"Key": obj["Key"], "Size": obj["Size"], "LastModified": str(obj["LastModified"])} for obj in contents]
        except ClientError as e:
            logger.error(f"Could not list objects: {e}")
            return []


if __name__ == "__main__":
    manager = S3Manager()
    if manager.ensure_bucket_exists():
        manager.upload_raw_dataset(config.SAMPLE_DATA_FILE)
        objects = manager.list_bucket_objects()
        print("S3 Objects in bucket:", objects)
