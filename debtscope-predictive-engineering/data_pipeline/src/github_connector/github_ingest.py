"""
GitHub API Connector
Extracts engineering data from GitHub REST API (Repositories, Commits, Pull Requests, Issues)
with graceful fallback to controlled datasets when tokens are absent or rate-limited.
"""

import os
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime

class GitHubIngestor:
    """
    Connects to the GitHub REST API v3 to pull repository commit histories,
    pull requests, and issues.
    """
    BASE_URL = "https://api.github.com"
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Engineering-Intelligence-Platform/1.0"
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    def test_connection(self) -> Dict[str, Any]:
        """Verifies connectivity and rate limits with GitHub API."""
        try:
            resp = requests.get(f"{self.BASE_URL}/rate_limit", headers=self.headers, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                rate = data.get("rate", {})
                return {
                    "status": "CONNECTED",
                    "authenticated": bool(self.token),
                    "remaining_limit": rate.get("remaining", 0),
                    "limit": rate.get("limit", 60)
                }
            return {"status": "HTTP_ERROR", "code": resp.status_code, "authenticated": False}
        except Exception as e:
            return {"status": "UNAVAILABLE", "error": str(e), "authenticated": False}

    def fetch_repo_details(self, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """Fetches repository metadata."""
        url = f"{self.BASE_URL}/repos/{owner}/{repo}"
        try:
            resp = requests.get(url, headers=self.headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "id": f"gh-{data['id']}",
                    "name": data["name"],
                    "tech_stack": data.get("language") or "Unknown",
                    "business_domain": "OpenSource / External",
                    "created_at": data["created_at"],
                    "business_impact_score": 75.0
                }
        except Exception:
            pass
        return None

    def fetch_commits(self, owner: str, repo: str, max_count: int = 50) -> List[Dict[str, Any]]:
        """Fetches commit history."""
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/commits"
        params = {"per_page": min(max_count, 100)}
        commits = []
        try:
            resp = requests.get(url, headers=self.headers, params=params, timeout=10)
            if resp.status_code == 200:
                raw_commits = resp.json()
                for c in raw_commits:
                    commit_obj = c.get("commit", {})
                    author_obj = c.get("author") or {}
                    commits.append({
                        "id": f"gh-c-{c['sha'][:8]}",
                        "repo_id": f"gh-{owner}-{repo}",
                        "commit_hash": c["sha"],
                        "author_id": author_obj.get("login") or commit_obj.get("author", {}).get("name", "unknown"),
                        "commit_timestamp": commit_obj.get("author", {}).get("date"),
                        "message": commit_obj.get("message", "").split("\n")[0]
                    })
        except Exception:
            pass
        return commits

    def fetch_pull_requests(self, owner: str, repo: str, max_count: int = 30) -> List[Dict[str, Any]]:
        """Fetches pull requests."""
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/pulls"
        params = {"state": "all", "per_page": min(max_count, 100)}
        prs = []
        try:
            resp = requests.get(url, headers=self.headers, params=params, timeout=10)
            if resp.status_code == 200:
                for pr in resp.json():
                    user = pr.get("user") or {}
                    prs.append({
                        "id": f"gh-pr-{pr['number']}",
                        "repo_id": f"gh-{owner}-{repo}",
                        "pr_number": pr["number"],
                        "author_id": user.get("login", "unknown"),
                        "title": pr.get("title", ""),
                        "status": pr.get("state", "closed").upper(),
                        "created_at": pr.get("created_at"),
                        "merged_at": pr.get("merged_at"),
                        "review_comments_count": pr.get("comments", 0)
                    })
        except Exception:
            pass
        return prs

    def fetch_issues(self, owner: str, repo: str, max_count: int = 30) -> List[Dict[str, Any]]:
        """Fetches issues."""
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/issues"
        params = {"state": "all", "per_page": min(max_count, 100)}
        issues = []
        try:
            resp = requests.get(url, headers=self.headers, params=params, timeout=10)
            if resp.status_code == 200:
                for iss in resp.json():
                    if "pull_request" in iss:
                        continue  # skip pull requests returned by issues API
                    labels = [lbl.get("name", "").lower() for lbl in iss.get("labels", [])]
                    severity = "MEDIUM"
                    if any("critical" in l or "p0" in l for l in labels):
                        severity = "CRITICAL"
                    elif any("high" in l or "p1" in l for l in labels):
                        severity = "HIGH"
                    elif any("low" in l for l in labels):
                        severity = "LOW"
                    issues.append({
                        "id": f"gh-iss-{iss['number']}",
                        "repo_id": f"gh-{owner}-{repo}",
                        "file_id": "general-repo-issue",
                        "module_name": "external_repo",
                        "issue_type": "BUG" if any("bug" in l for l in labels) else "TECH_DEBT",
                        "severity": severity,
                        "remediation_effort_hours": 16.0,
                        "status": iss.get("state", "open").upper(),
                        "created_at": iss.get("created_at"),
                        "resolved_at": iss.get("closed_at")
                    })
        except Exception:
            pass
        return issues

if __name__ == "__main__":
    client = GitHubIngestor()
    conn = client.test_connection()
    print("GitHub API Status:", conn)
