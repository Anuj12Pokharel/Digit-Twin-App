import sys, os, traceback

# Open a file for output since stdout seems to be redirected
log = open(r'C:\Users\hp\Desktop\anuj\diag_output.txt', 'w')

def w(msg):
    log.write(msg + '\n')
    log.flush()

w(f"Python: {sys.version}")
w(f"CWD: {os.getcwd()}")

steps = [
    ("backend", "import backend"),
    ("backend.database", "import backend.database"),
    ("backend.models", "import backend.models"),
    ("backend.schemas", "import backend.schemas"),
    ("backend.auth", "import backend.auth"),
    ("backend.tools", "import backend.tools"),
    ("backend.services.knowledge_service", "from backend.services import knowledge_service"),
    ("backend.services.jira_service", "from backend.services import jira_service"),
    ("backend.services.google_calendar_service", "from backend.services import google_calendar_service"),
    ("backend.main", "import backend.main"),
]

for name, stmt in steps:
    try:
        exec(stmt)
        w(f"OK: {name}")
    except Exception as e:
        w(f"FAIL: {name} -> {type(e).__name__}: {e}")
        w(traceback.format_exc())
        break

log.close()
