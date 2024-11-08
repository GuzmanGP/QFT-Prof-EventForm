import os
import json
from datetime import datetime
from google.oauth2 import service_account
import gspread

def init_sheets_client():
    scope = ['https://spreadsheets.google.com/feeds',
             'https://www.googleapis.com/auth/drive']
    
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
        
        # Use form title as sheet name
        try:
            sheet = client.open(form_config.title).sheet1
        except gspread.SpreadsheetNotFound:
            sheet = client.create(form_config.title).sheet1
        
        # Get existing data
        existing_data = sheet.get_all_records()
        
        # Prepare new data
        new_data = {
            'id': form_config.id,
            'category': form_config.category,
            'subcategory': form_config.subcategory,
            'category_metadata': json.dumps(form_config.category_metadata),
            'subcategory_metadata': json.dumps(form_config.subcategory_metadata),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Update or append
        found = False
        for i, row in enumerate(existing_data):
            if row.get('id') == form_config.id:
                sheet.update_cell(i+2, 1, new_data)  # +2 for header row
                found = True
                break
        
        if not found:
            sheet.append_row([new_data[k] for k in new_data.keys()])
            
    except Exception as e:
        print(f"Error syncing to Google Sheets: {str(e)}")
        # Don't raise the error - we don't want to fail form submission if sheets sync fails
        # But we should log it properly in a production environment
