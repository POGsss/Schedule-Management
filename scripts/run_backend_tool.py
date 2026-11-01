"""Run a Python quality tool from the project virtual environment."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    executable = root / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    if not executable.is_file():
        print(
            "Project virtual environment missing. Create .venv and install requirements-dev.txt.",
            file=sys.stderr,
        )
        return 2
    if not sys.argv[1:]:
        print("Usage: python scripts/run_backend_tool.py <tool> [arguments...]", file=sys.stderr)
        return 2
    if sys.argv[1] == "pytest" and not any((root / "backend/app").rglob("*.py")):
        print("Backend application source is not implemented yet; tests will be required later.")
        return 0
    return subprocess.call([str(executable), "-m", *sys.argv[1:]], cwd=root)


if __name__ == "__main__":
    raise SystemExit(main())
