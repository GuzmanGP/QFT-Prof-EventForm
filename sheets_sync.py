import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime

def init_sheets_client():
    scope = ['https://spreadsheets.google.com/feeds',
             'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file('credentials.json', scopes=scope)
    return gspread.authorize(creds)

def sync_form_to_sheet(form_config):
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
        'category_metadata': form_config.category_metadata,
        'subcategory_metadata': form_config.subcategory_metadata,
        'updated_at': datetime.utcnow().isoformat()
    }
    
    # Update or append
    found = False
    for i, row in enumerate(existing_data):
        if row['id'] == form_config.id:
            sheet.update_cell(i+2, 1, new_data)  # +2 for header row
            found = True
            break
    
    if not found:
        sheet.append_row([new_data[k] for k in new_data.keys()])
