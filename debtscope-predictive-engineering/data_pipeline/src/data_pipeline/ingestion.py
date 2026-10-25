"""
Data Ingestion Module
Handles loading, schema validation, batch tracking, and staging of raw engineering datasets.
"""

import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from .data_generator import generate_controlled_dataset

REQUIRED_RAW_FILES = [
    "repositories.json",
    "files.json",
    "developers.json",
    "commits.json",
    "commit_file_changes.json",
    "pull_requests.json",
    "issues.json",
    "defects.json",
    "releases.json",
    "dependencies.json",
    "business_context.json"
]

class IngestionEngine:
    """
    Ingests engineering data from raw storage, validates availability,
    records batch metadata, and provides staged access.
    """
    def __init__(self, raw_data_dir: str = "data/raw", auto_generate: bool = True):
        self.raw_data_dir = raw_data_dir
        self.auto_generate = auto_generate
        self.batch_id = f"batch-{uuid.uuid4().hex[:8]}"
        self.ingestion_timestamp = datetime.utcnow().isoformat() + "Z"
        
    def ensure_data_available(self) -> Dict[str, Any]:
        """
        Verifies that all required raw data files exist. If missing and auto_generate
        is True, generates the controlled dataset.
        """
        missing_files = []
        for filename in REQUIRED_RAW_FILES:
            filepath = os.path.join(self.raw_data_dir, filename)
            if not os.path.exists(filepath):
                missing_files.append(filename)
                
        if missing_files and self.auto_generate:
            os.makedirs(self.raw_data_dir, exist_ok=True)
            generate_controlled_dataset(self.raw_data_dir, inject_anomalies=True)
            missing_files = []
            
        if missing_files:
            raise FileNotFoundError(f"Missing required raw files: {missing_files}")
            
        return {
            "status": "READY",
            "batch_id": self.batch_id,
            "raw_dir": self.raw_data_dir,
            "timestamp": self.ingestion_timestamp
        }
        
    def load_raw_dataset(self, filename: str) -> List[Dict[str, Any]]:
        """
        Loads a specific raw JSON file.
        """
        filepath = os.path.join(self.raw_data_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Raw file not found: {filepath}")
            
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        if not isinstance(data, list):
            raise ValueError(f"Expected list of records in {filename}, got {type(data).__name__}")
            
        return data

    def load_all(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Loads all required raw datasets into an in-memory dictionary.
        """
        self.ensure_data_available()
        all_data = {}
        for fname in REQUIRED_RAW_FILES:
            entity_name = fname.replace(".json", "")
            all_data[entity_name] = self.load_raw_dataset(fname)
        return all_data

if __name__ == "__main__":
    engine = IngestionEngine("data/raw", auto_generate=True)
    summary = engine.ensure_data_available()
    print("Ingestion initialization:", summary)
    data = engine.load_all()
    print(f"Loaded {len(data)} entities successfully.")
