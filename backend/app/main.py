"""FastAPI application and production static asset serving."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api.health import readiness
from backend.app.persistence.database import engine

app = FastAPI(title="School Schedule Management", version="0.1.0")


@app.get("/api/health/ready", include_in_schema=False)
def readiness_route() -> dict[str, str]:
    """Inject the configured engine into the readiness check."""
    return readiness(engine)


FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def frontend(path: str) -> FileResponse:
        """Serve the SPA entry point for browser routes after the production build."""
        del path
        return FileResponse(FRONTEND_DIST / "index.html")
