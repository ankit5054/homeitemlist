import json
import signal
import sys
import os

items = []

def save_and_exit(signum, frame):
    if os.path.exists('items.json'):
        with open('items.json', 'r') as f:
            existing_items = json.load(f)
        existing_items.extend(items)
    else:
        existing_items = items
    
    with open('items.json', 'w') as f:
        json.dump(existing_items, f, indent=2)
    print(f"\nAdded {len(items)} items to items.json")
    sys.exit(0)

signal.signal(signal.SIGINT, save_and_exit)
signal.signal(signal.SIGTERM, save_and_exit)

print("Enter items (Ctrl+C to save and exit):")

while True:
    try:
        user_input = input("Item and units: ").strip()
        
        if not user_input:
            continue
        
        parts = [part.strip() for part in user_input.split(',')]
        item_name = parts[0]
        units = parts[1:] if len(parts) > 1 else []
        
        items.append({"item": item_name, "unit": units})
        
    except EOFError:
        save_and_exit(None, None)