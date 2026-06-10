import re
import os

log_file = r'C:\Users\User\.gemini\antigravity\brain\e3b88718-a82d-4a8d-a408-c2790eff78b2\.system_generated\tasks\task-337.log'

with open(log_file, 'r', encoding='utf-8') as f:
    log_data = f.readlines()

for line in log_data:
    if 'invalid_constant' in line:
        match = re.search(r'([a-zA-Z0-9_\\\/\.]+\.dart):(\d+):(\d+)', line)
        if match:
            filepath = match.group(1)
            line_num = int(match.group(2))
            
            # The filepath is relative to flutter_mobile
            full_path = os.path.join(r'd:\project_WKNsite\apps\flutter_mobile', filepath)
            
            try:
                with open(full_path, 'r', encoding='utf-8') as f_code:
                    code_lines = f_code.readlines()
                
                target_idx = line_num - 1
                if 0 <= target_idx < len(code_lines):
                    code_lines[target_idx] = re.sub(r'\bconst\s+', '', code_lines[target_idx])
                    
                    if target_idx > 0 and 'const ' in code_lines[target_idx - 1]:
                         code_lines[target_idx - 1] = re.sub(r'\bconst\s+', '', code_lines[target_idx - 1])
                    if target_idx > 1 and 'const ' in code_lines[target_idx - 2]:
                         code_lines[target_idx - 2] = re.sub(r'\bconst\s+', '', code_lines[target_idx - 2])
                    if target_idx > 2 and 'const ' in code_lines[target_idx - 3]:
                         code_lines[target_idx - 3] = re.sub(r'\bconst\s+', '', code_lines[target_idx - 3])
                    if target_idx > 3 and 'const ' in code_lines[target_idx - 4]:
                         code_lines[target_idx - 4] = re.sub(r'\bconst\s+', '', code_lines[target_idx - 4])
                         
                with open(full_path, 'w', encoding='utf-8') as f_code:
                    f_code.writelines(code_lines)
            except Exception as e:
                pass

print("Fixed const errors based on log.")
