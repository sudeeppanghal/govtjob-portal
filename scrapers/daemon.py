import time
import sys
import os
import io
import argparse
from datetime import datetime

# Force UTF-8 encoding on standard output/error to prevent encoding crashes on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    except Exception:
        pass

# Ensure scrapers folder is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.main import main as run_scraper

def daemon_loop(interval_sec: int):
    print(f"[{datetime.now().isoformat()}] Starting Scraper Daemon Loop (Interval: {interval_sec}s)...")
    
    run_count = 0
    while True:
        run_count += 1
        print(f"\n==================================================")
        print(f"[{datetime.now().isoformat()}] DAEMON RUN #{run_count} STARTING")
        print(f"==================================================")
        
        try:
            run_scraper()
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] Daemon encountered error during run: {e}", file=sys.stderr)
            
        print(f"[{datetime.now().isoformat()}] DAEMON RUN #{run_count} FINISHED. Sleeping for {interval_sec} seconds...")
        time.sleep(interval_sec)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Continuous Government Job Scraper Daemon")
    parser.add_argument(
        "--interval",
        type=int,
        default=60,
        help="Interval between scraper runs in seconds (default: 60)"
    )
    args = parser.parse_args()
    
    # Run the loop
    daemon_loop(args.interval)
