import sys, os, traceback

log = open(r'C:\Users\hp\Desktop\anuj\diag_output.txt', 'w')
def w(msg):
    log.write(msg + '\n')
    log.flush()

w(f"Python: {sys.version}")
w(f"CWD: {os.getcwd()}")

# Test each module individually
tests = [
    ("backend.tools - step1: jira import", "from backend.services.jira_service import JiraService"),
    ("backend.tools - step2: google import", "from backend.services.google_calendar_service import GoogleCalendarService"),
    ("backend.tools - step3: knowledge import", "from backend.services.knowledge_service import knowledge_base"),
    ("backend.tools", "import backend.tools"),
    ("backend.main", "import backend.main"),
]

for name, stmt in tests:
    try:
        exec(stmt)
        w(f"OK: {name}")
    except Exception as e:
        w(f"FAIL: {name}")
        w(f"  Error: {type(e).__name__}: {e}")
        w(traceback.format_exc())

log.close()
print("done - check diag_output.txt")
