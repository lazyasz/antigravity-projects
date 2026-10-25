#!/usr/bin/env python3
"""
Predictive Engineering Intelligence Platform - Main Pipeline Runner
Execute this script to run the complete data engineering & Big Data pipeline.
"""

import sys
import os

# Add root directory and src to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from src.data_pipeline.pipeline_runner import PipelineOrchestrator

def main():
    orchestrator = PipelineOrchestrator()
    result = orchestrator.run()
    if result["status"] == "SUCCESS":
        print("Pipeline execution verified.")
        sys.exit(0)
    else:
        print("Pipeline execution failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
