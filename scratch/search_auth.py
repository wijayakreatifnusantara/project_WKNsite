
import os

filepath = r'e:\project_website_database_gaji\js\main.js'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'isAuthenticated' in line:
        print(f"{i+1}: {line.strip()}")
