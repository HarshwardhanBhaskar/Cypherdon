import sys
import os
import pytest
from unittest.mock import patch, MagicMock

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.agent.tools import ToolRegistry, TOOL_DEFINITIONS
from services.agent.engine import CypherdonCareerAgent


def test_tool_definitions_registry():
    """Verify that all 6 autonomous tools are registered with schemas."""
    assert len(TOOL_DEFINITIONS) == 6
    names = [t["name"] for t in TOOL_DEFINITIONS]
    assert "parse_resume" in names
    assert "search_jobs" in names
    assert "score_match" in names
    assert "generate_email" in names
    assert "critique_output" in names
    assert "save_result" in names


def test_tool_parse_resume_extraction():
    """Verify parse_resume extracts candidate technical keywords."""
    import asyncio
    async def _run():
        registry = ToolRegistry()
        resume_text = (
            "Harshwardhan Bhaskar - Senior Full Stack Developer. Experience with Python, "
            "FastAPI, React, PostgreSQL, Docker, and distributed systems."
        )
        result = await registry.execute("parse_resume", {
            "resume_text": resume_text,
            "target_role": "Backend Engineer"
        })
        assert result["status"] == "success"
        profile = result["profile"]
        assert len(profile["skills"]) > 0
        assert profile["ats_baseline_score"] >= 35
    asyncio.run(_run())


def test_tool_score_match_algorithm():
    """Verify score_match calculates ATS gap and compatibility score."""
    import asyncio
    async def _run():
        registry = ToolRegistry()
        result = await registry.execute("score_match", {
            "candidate_skills": ["Python", "FastAPI", "PostgreSQL"],
            "candidate_role": "Backend Developer",
            "job_title": "Senior Python Backend Engineer",
            "job_description": "We are seeking a Backend Developer proficient in Python, PostgreSQL, and Docker.",
            "required_skills": ["Python", "PostgreSQL", "Docker"]
        })
        assert result["status"] == "success"
        assert "score" in result
        assert 0 <= result["score"] <= 100
        assert "Docker" in result["missing_skills"] or "docker" in [s.lower() for s in result["missing_skills"]]
    asyncio.run(_run())


def test_tool_critique_output_quality_gate():
    """Verify critique_output evaluates quality gates and flags brevity/metrics."""
    import asyncio
    async def _run():
        registry = ToolRegistry()
        good_email = (
            "Hi Hiring Team,\n\nI am applying for the Backend Engineer role. "
            "I recently optimized our queue latency by 45%, processing 10k+ requests/sec with Python.\n\n"
            "Best regards,\nHarshwardhan"
        )
        result = await registry.execute("critique_output", {
            "content_type": "cold_email",
            "content_body": good_email,
            "target_role": "Backend Engineer",
            "target_company": "Acme Corp"
        })
        assert result["status"] == "success"
        assert result["quality_score"] >= 70
        assert result["verdict"] == "APPROVED"
    asyncio.run(_run())


def test_agent_react_loop_execution():
    """Verify CypherdonCareerAgent executes autonomous multi-step loop and generates artifacts."""
    import asyncio
    async def _run():
        events = []

        async def event_collector(event):
            events.append(event["event_type"])

        agent = CypherdonCareerAgent(
            user_id="test-user-999",
            goal="Find 2 Backend roles and generate tailored applications",
            event_callback=event_collector,
            max_iterations=4
        )

        result = await agent.run()

        # Verify event progression
        assert "START" in events
        assert "PLAN" in events
        assert "THOUGHT" in events
        assert "COMPLETED" in events

        # Verify deliverable structure
        assert result["status"] == "COMPLETED"
        assert result["total_applications"] >= 1
        assert "summary" in result
        assert result["execution_metrics"]["cycles_executed"] >= 1
    asyncio.run(_run())
