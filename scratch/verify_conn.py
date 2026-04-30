import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

creds_path = "marine-cable-494919-u9-bc542c0991b5.json"

def test_connection():
    if not os.path.exists(creds_path):
        print(f"Error: {creds_path} not found.")
        return

    try:
        # Load credentials
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly']
        )
        
        # Build the Drive API service to list files
        drive_service = build('drive', 'v3', credentials=creds)
        
        # List spreadsheets
        results = drive_service.files().list(
            q="mimeType='application/vnd.google-apps.spreadsheet'",
            pageSize=10, 
            fields="nextPageToken, files(id, name)"
        ).execute()
        
        items = results.get('files', [])

        if not items:
            print("No spreadsheets found. (Did you share the file with the service account email?)")
        else:
            print(f"SUCCESS! Connected to Google Drive. Found {len(items)} spreadsheet(s):")
            for item in items:
                print(f"- {item['name']} (ID: {item['id']})")
                
    except Exception as e:
        print(f"ERROR connecting to Google Sheets: {str(e)}")

if __name__ == "__main__":
    test_connection()
