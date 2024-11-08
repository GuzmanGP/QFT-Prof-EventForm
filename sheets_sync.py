import os
import json
from datetime import datetime
from google.oauth2 import service_account
import gspread

def init_sheets_client():
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets'
    ]
    
    # Get credentials from environment variable
    creds_json = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')
    if not creds_json:
        raise ValueError("Google Sheets credentials not found in environment")
    
    creds_dict = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(
        creds_dict, 
        scopes=scope
    )
    return gspread.authorize(creds)

def sync_form_to_sheet(form_config):
    try:
        client = init_sheets_client()
        
        try:
            workbook = client.open(form_config.title)
        except gspread.SpreadsheetNotFound:
            try:
                workbook = client.create(form_config.title)
                workbook.share(
                    'form-config-sync@replit-439821.iam.gserviceaccount.com',
                    perm_type='user',
                    role='writer'
                )
            except Exception as e:
                print(f"Error creating/sharing spreadsheet: {str(e)}")
                if "The caller does not have permission" in str(e):
                    print("Please enable Google Drive and Google Sheets APIs in Google Cloud Console")
                elif "API has not been used" in str(e):
                    print("API is not enabled. Please enable Google Drive and Sheets APIs")
                raise
        
        sheet = workbook.sheet1
        
        # Set headers if new sheet
        headers = ['id', 'category', 'subcategory', 'category_metadata', 
                  'subcategory_metadata', 'updated_at']
        if not sheet.row_values(1):
            sheet.insert_row(headers, 1)
        
        # Prepare row data
        row_data = [
            str(form_config.id),
            form_config.category,
            form_config.subcategory or '',
            json.dumps(form_config.category_metadata),
            json.dumps(form_config.subcategory_metadata),
            datetime.utcnow().isoformat()
        ]
        
        # Find existing row or append
        try:
            cell = sheet.find(str(form_config.id))
            sheet.delete_row(cell.row)
            sheet.insert_row(row_data, cell.row)
        except gspread.CellNotFound:
            sheet.append_row(row_data)
            
        return True
            
    except Exception as e:
        print(f"Error syncing to Google Sheets: {str(e)}")
        if "The caller does not have permission" in str(e):
            print("Please enable Google Drive and Google Sheets APIs in Google Cloud Console")
        elif "API has not been used" in str(e):
            print("Please enable Google Drive and Sheets APIs")
        return False
