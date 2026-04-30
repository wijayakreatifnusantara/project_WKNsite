import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

creds_path = "marine-cable-494919-u9-bc542c0991b5.json"
spreadsheet_id = "1d5KFGs1bSjlNhmC2cX8sAVCANhC2HdRe42Ka5Vm8TJk"

def audit_data():
    try:
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
        )
        service = build('sheets', 'v4', credentials=creds)
        
        # Get spreadsheet info to see sheet names
        sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = sheet_metadata.get('sheets', [])
        
        print("SHEETS FOUND:")
        sheet_names = [s.get('properties', {}).get('title') for s in sheets]
        for name in sheet_names:
            print(f"- {name}")
            
        # Try to read 'Data_Karyawan' or similar (common in this project)
        # We'll check the first sheet if we don't know the exact name
        target_sheet = sheet_names[0]
        for name in ['Salary_Data', 'Data_Karyawan', 'Sheet1']:
            if name in sheet_names:
                target_sheet = name
                break
                
        print(f"\nREADING DATA FROM: {target_sheet}")
        range_name = f"'{target_sheet}'!A1:Z2" # Just first 2 rows to see headers and one sample
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id, range=range_name
        ).execute()
        
        values = result.get('values', [])
        if not values:
            print("No data found in the sheet.")
            return

        headers = values[0]
        print("\nCOLUMNS FOUND:")
        for i, h in enumerate(headers):
            print(f"{i+1}. {h}")
            
        if len(values) > 1:
            print("\nSAMPLE DATA (Row 2):")
            print(values[1])
        else:
            print("\nNo sample data rows found.")

    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    audit_data()
