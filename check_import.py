import sys
import traceback

print("Starting import check...")
try:
    import backend.main
    print("Import succeeded!")
except Exception as e:
    print("Exception caught:")
    traceback.print_exc()
    sys.exit(2)
