import sys
import traceback

print("Python:", sys.version)
print("CWD:", __import__('os').getcwd())

try:
    import backend.main
    print("SUCCESS: app =", backend.main.app)
except ImportError as e:
    print("IMPORT ERROR:", e)
    traceback.print_exc()
except Exception as e:
    print("GENERAL ERROR:", e)
    traceback.print_exc()
