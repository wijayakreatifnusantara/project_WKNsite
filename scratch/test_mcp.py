import os
import json
import asyncio
from mcp_google_sheets.server import serve

# This script is just to check if the package can be imported and initialized
# Since serve() is a blocking call for the MCP server, we just test the import first.

try:
    import mcp_google_sheets
    print("SUCCESS: mcp_google_sheets package is installed and importable.")
    
    # Check if credentials file exists
    creds_path = "marine-cable-494919-u9-bc542c0991b5.json"
    if os.path.exists(creds_path):
        print(f"SUCCESS: Credentials file found: {creds_path}")
        with open(creds_path) as f:
            creds = json.load(f)
            print(f"Project ID: {creds.get('project_id')}")
            print(f"Service Account Email: {creds.get('client_email')}")
    else:
        print(f"ERROR: Credentials file NOT found: {creds_path}")

except Exception as e:
    print(f"ERROR: {str(e)}")
