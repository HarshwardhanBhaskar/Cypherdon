"""
FastAPI Router for Cypherdon Agentic AI
---------------------------------------
Endpoints:
- POST /api/agent/run        : Launch autonomous ReAct agent with natural language goal
- GET  /api/agent/status/{id}: Poll current agent status, events, and final artifacts
- WS   /api/agent/ws/{id}    : Live real-time WebSocket thought & tool execution streaming
- GET  /api/agent/tools      : Inspect the agent's 6-tool autonomous registry
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks

from services.agent.engine import CypherdonCareerAgent
from services.agent.tools import TOOL_DEFINITIONS

logger = logging.getLogger("routers.agent")

router = APIRouter()

# In-memory storage for active and completed agent runs
_agent_tasks: Dict[str, Dict[str, Any]] = {}
# Active WebSocket connections per task_id
_agent_connections: Dict[str, List[WebSocket]] = {}


class AgentRunRequest(BaseModel):
    goal: str
    resume_text: Optional[str] = None
    user_id: Optional[str] = "demo-user"


class AgentRunResponse(BaseModel):
    task_id: str
    status: str
    goal: str
    message: str


async def _broadcast_event(task_id: str, event: Dict[str, Any]):
    """Store event in task history and push to connected WebSockets."""
    if task_id in _agent_tasks:
        _agent_tasks[task_id]["events"].append(event)
        if event.get("event_type") == "COMPLETED":
            _agent_tasks[task_id]["status"] = "COMPLETED"
            _agent_tasks[task_id]["result"] = event.get("result")

    connections = _agent_connections.get(task_id, [])
    stale_connections = []
    for ws in connections:
        try:
            await ws.send_json(event)
        except Exception:
            stale_connections.append(ws)

    for dead_ws in stale_connections:
        if dead_ws in connections:
            connections.remove(dead_ws)


async def _run_agent_background(task_id: str, agent: CypherdonCareerAgent):
    """Background runner for the agent."""
    try:
        _agent_tasks[task_id]["status"] = "RUNNING"
        result = await agent.run()
        _agent_tasks[task_id]["status"] = "COMPLETED"
        _agent_tasks[task_id]["result"] = result
    except Exception as e:
        logger.error("Agent execution failed for task %s: %s", task_id, e, exc_info=True)
        _agent_tasks[task_id]["status"] = "FAILED"
        _agent_tasks[task_id]["error"] = str(e)
        await _broadcast_event(task_id, {
            "event_type": "ERROR",
            "message": f"Agent encountered error: {str(e)}"
        })


@router.post("/run", response_model=AgentRunResponse)
async def run_career_agent(req: AgentRunRequest, background_tasks: BackgroundTasks):
    """
    Launch an autonomous career agent with a high-level natural language goal.
    Returns task_id to track live progress via WebSocket or status polling.
    """
    if not req.goal or len(req.goal.strip()) < 5:
        raise HTTPException(status_code=400, detail="Please provide a descriptive goal (at least 5 characters).")

    # Define callback that routes to _broadcast_event
    agent = CypherdonCareerAgent(
        user_id=req.user_id or "user",
        goal=req.goal.strip(),
        resume_text=req.resume_text,
        event_callback=lambda event: _broadcast_event(agent.task_id, event)
    )

    task_id = agent.task_id
    _agent_tasks[task_id] = {
        "task_id": task_id,
        "goal": req.goal,
        "status": "INITIALIZING",
        "created_at": None,
        "events": [],
        "result": None,
        "error": None
    }
    _agent_connections[task_id] = []

    # Launch agent asynchronously in background
    background_tasks.add_task(_run_agent_background, task_id, agent)

    return AgentRunResponse(
        task_id=task_id,
        status="RUNNING",
        goal=req.goal,
        message="Agent launched. Stream thoughts via WebSocket /api/agent/ws/" + task_id
    )


@router.get("/status/{task_id}")
async def get_agent_status(task_id: str):
    """Fetch current status, thought history, and artifacts for an agent run."""
    task = _agent_tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Agent task not found.")
    return task


@router.get("/tools")
async def get_agent_tools():
    """Retrieve the catalog of autonomous tools available in the agent registry."""
    return {
        "tools_count": len(TOOL_DEFINITIONS),
        "tools": TOOL_DEFINITIONS
    }


@router.websocket("/ws/{task_id}")
async def agent_thought_stream(websocket: WebSocket, task_id: str):
    """
    WebSocket endpoint for real-time live streaming of the agent's thought process,
    tool calls, observations, reflections, and final synthesis.
    """
    await websocket.accept()

    if task_id not in _agent_connections:
        _agent_connections[task_id] = []
    _agent_connections[task_id].append(websocket)

    # Replay past events so the client immediately catches up with previous thoughts
    if task_id in _agent_tasks:
        for past_event in _agent_tasks[task_id]["events"]:
            try:
                await websocket.send_json(past_event)
            except Exception:
                break

    try:
        while True:
            # Keep socket open and await any client ping/message
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for task: %s", task_id)
    except Exception as e:
        logger.warning("WebSocket exception for task %s: %s", task_id, e)
    finally:
        if task_id in _agent_connections and websocket in _agent_connections[task_id]:
            _agent_connections[task_id].remove(websocket)
