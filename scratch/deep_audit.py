import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

creds_path = "marine-cable-494919-u9-bc542c0991b5.json"
spreadsheet_id = "1d5KFGs1bSjlNhmC2cX8sAVCANhC2HdRe42Ka5Vm8TJk"

def deep_audit():
    try:
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
        )
        service = build('sheets', 'v4', credentials=creds)
        
        for target_sheet in ['Employee_Data', 'Attendance_Data']:
            print(f"\n--- AUDITING SHEET: {target_sheet} ---")
            range_name = f"'{target_sheet}'!A1:Z2"
            result = service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id, range=range_name
            ).execute()
            
            values = result.get('values', [])
            if not values:
                print(f"No data found in {target_sheet}.")
                continue

            headers = values[0]
            print("COLUMNS:")
            for i, h in enumerate(headers):
                print(f"  {i+1}. {h}")
            
            if len(values) > 1:
                print("SAMPLE DATA:")
                print(f"  {values[1]}")

    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    deep_audit()
