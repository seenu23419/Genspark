import json
import os
import re

file_path = "data/curriculum/c.json"

def clean_curriculum():
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Fix Level 3 (Functions)
    level3 = next((m for m in data if m['id'] == 'c-l3'), None)
    if level3:
        lessons = level3['lessons']
        new_lessons = []
        
        # We know exactly which 6 lessons we want in Level 3
        # Functions in C (c13)
        l13 = next((l for l in lessons if "Functions in C" in l['title'] and "User" not in l['title'] and "Types" not in l['title']), None)
        # User-Defined Functions (c14)
        l14 = next((l for l in lessons if "User-Defined Functions" in l['title']), None)
        # Types of Functions (c15)
        l15 = next((l for l in lessons if "Types of Functions" in l['title']), None)
        # Call by Value vs. Call by Reference (c16) - 35 mins
        l16 = next((l for l in lessons if "Call by Value" in l['title'] and l['duration'] == "35 mins"), None)
        # Recursion in C (c17) - 50 mins
        l17 = next((l for l in lessons if "Recursion" in l['title'] and l['duration'] == "50 mins"), None)
        # Scope of Variables (c18) - 30 mins
        l18 = next((l for l in lessons if "Scope of Variables" in l['title']), None)
        
        if all([l13, l14, l15, l16, l17, l18]):
            new_lessons = [l13, l14, l15, l16, l17, l18]
            level3['lessons'] = new_lessons
            print("Level 3 cleaned successfully.")
        else:
            print("Warning: Could not find all Level 3 lessons. Found:", [bool(x) for x in [l13, l14, l15, l16, l17, l18]])

    # 2. Global Re-indexing
    current_index = 1
    for module in data:
        for lesson in module['lessons']:
            # Assign new ID
            new_id = f"c{current_index}"
            lesson['id'] = new_id
            
            # Update title numbering (e.g. "16. Recursion" -> "17. Recursion")
            # Pattern matches digit(s) followed by a dot and space at the start
            title = lesson['title']
            title = re.sub(r'^\d+\.\s*', f"{current_index}. ", title)
            lesson['title'] = title
            
            current_index += 1

    # 3. Save the result
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"Total lessons re-indexed: {current_index - 1}")

if __name__ == "__main__":
    clean_curriculum()
