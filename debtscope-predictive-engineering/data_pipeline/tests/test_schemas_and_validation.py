"""
Tests for Data Schemas, Type Validation, and Boundary Conditions.
Verifies schema guards, handling of empty datasets, and unexpected types.
"""

import os
import pytest
from src.data_pipeline.ingestion import IngestionEngine
from src.data_pipeline.cleaning import DataCleaningPipeline
from src.data_pipeline.spark_processor import SparkDataProcessor

def test_empty_dataset_handling(tmp_path):
    """Verifies that cleaning pipeline handles empty collections without throwing exceptions."""
    cleaner = DataCleaningPipeline(processed_dir=str(tmp_path / "processed"))
    empty_data = {
        "files": [],
        "commits": [],
        "commit_file_changes": [],
        "issues": [],
        "defects": [],
        "dependencies": [],
        "repositories": [],
        "developers": [],
        "pull_requests": [],
        "releases": [],
        "business_context": []
    }
    cleaned_data, audit = cleaner.clean_all(empty_data)
    assert isinstance(cleaned_data, dict)
    assert len(cleaned_data["files"]) == 0
    assert audit["duplicates_removed"] == 0

def test_unexpected_data_types_in_cleaning(tmp_path):
    """Verifies cleaning layer coerces or sanitizes non-standard data types."""
    cleaner = DataCleaningPipeline(processed_dir=str(tmp_path / "processed"))
    dirty_changes = [
        {"id": "cfc1", "commit_id": "c1", "file_id": "f1", "additions": "45", "deletions": None, "churn": None}
    ]
    # additions as string should be handled or cast cleanly
    cleaned = cleaner.clean_commit_file_changes(dirty_changes)
    assert cleaned[0]["additions"] == 45
    assert cleaned[0]["deletions"] == 0
    assert cleaned[0]["churn"] == 45

def test_missing_required_files_detection(tmp_path):
    """Verifies IngestionEngine raises FileNotFoundError when required files are missing and auto_generate=False."""
    empty_dir = tmp_path / "empty_raw"
    empty_dir.mkdir()
    engine = IngestionEngine(raw_data_dir=str(empty_dir), auto_generate=False)
    with pytest.raises(FileNotFoundError):
        engine.ensure_data_available()

def test_spark_processor_schemas_definition():
    """Verifies Spark schemas match required columns and expected types."""
    processor = SparkDataProcessor(app_name="SchemaTest")
    try:
        schemas = processor.get_schemas()
        assert "files" in schemas
        assert "commits" in schemas
        assert "commit_file_changes" in schemas
        assert "issues" in schemas
        assert "business_context" in schemas
        
        file_fields = {f.name: f.dataType.simpleString() for f in schemas["files"].fields}
        assert file_fields["id"] == "string"
        assert file_fields["loc"] == "bigint"
        assert file_fields["cyclomatic_complexity"] == "double"
    finally:
        processor.stop()
