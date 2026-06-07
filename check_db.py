import os
from dotenv import load_dotenv
load_dotenv('apps/server/.env')
from supabase import create_client

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_KEY'])
res = supabase.table('leave_requests').select('*').limit(1).execute()
if res.data:
    print(res.data[0].keys())
else:
    print("Empty table")
