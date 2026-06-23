import sys
import os

try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

sys.path.append(r"d:\govtjob")
from scrapers.config import supabase

# List of unofficial sources to clean up
unofficial_sources = ["GovtJobsBlog Feed", "Rojgarlive Feed", "NCS"]

print("Starting cleanup of unofficial jobs from database...")

for source in unofficial_sources:
    try:
        # Check count first
        check_res = supabase.table("notifications").select("id").eq("source_name", source).execute()
        count = len(check_res.data) if check_res.data else 0
        if count > 0:
            print(f"Found {count} entries for source '{source}'. Deleting...")
            del_res = supabase.table("notifications").delete().eq("source_name", source).execute()
            print(f"Successfully deleted {count} entries for source '{source}'.")
        else:
            print(f"No entries found for source '{source}'.")
    except Exception as e:
        print(f"Error deleting entries for source '{source}': {e}")

print("Cleanup complete.")
