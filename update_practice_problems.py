#!/usr/bin/env python3
"""Add estimatedTime, relatedLesson, and commonMistake to all practice problems"""

import json
import re

# Read the file
with open(r'c:\Users\DELL\OneDrive\Desktop\gens\data\practiceProblems.ts', 'r') as f:
    content = f.read()

# Define replacements for each problem
replacements = [
    {
        "id": "intro-2",
        "fields": """                estimatedTime: 1,
                relatedLesson: 'Introduction → Program Structure',
                commonMistake: 'Missing the main() function or misunderstanding the return statement'"""
    },
    {
        "id": "intro-3",
        "fields": """                estimatedTime: 2,
                relatedLesson: 'Introduction → Code Comments',
                commonMistake: 'Nesting /* */ comments or using wrong comment syntax'"""
    },
    {
        "id": "p3",
        "fields": """                estimatedTime: 2,
                relatedLesson: 'Flow Control → if-else statements',
                commonMistake: 'Using = instead of == in the condition, or forgetting the modulus operator'"""
    },
    {
        "id": "p4",
        "fields": """                estimatedTime: 3,
                relatedLesson: 'Functions → Function Definition & Calling',
                commonMistake: 'Forgetting the return type or passing wrong number of arguments'"""
    },
    {
        "id": "p5",
        "fields": """                estimatedTime: 3,
                relatedLesson: 'Arrays → Array Iteration',
                commonMistake: 'Off-by-one error in loop or forgetting to initialize sum to 0'"""
    },
    {
        "id": "p6",
        "fields": """                estimatedTime: 4,
                relatedLesson: 'Pointers → Pointer Dereferencing',
                commonMistake: 'Forgetting the * operator for dereferencing or passing values instead of addresses'"""
    },
    {
        "id": "p7",
        "fields": """                estimatedTime: 3,
                relatedLesson: 'Strings → String Termination',
                commonMistake: 'Missing the null terminator check or incrementing the wrong variable'"""
    },
    {
        "id": "p8",
        "fields": """                estimatedTime: 3,
                relatedLesson: 'Structures → Struct Definition & Access',
                commonMistake: 'Using wrong syntax for struct member access or forgetting the semicolon after struct definition'"""
    },
    {
        "id": "p9",
        "fields": """                estimatedTime: 4,
                relatedLesson: 'File I/O → File Operations',
                commonMistake: 'Forgetting to close the file or not checking if fopen() succeeded'"""
    }
]

# For each problem, add the fields before the closing brace
for replacement in replacements:
    problem_id = replacement["id"]
    new_fields = replacement["fields"]
    
    # Find the problem block and add fields before }
    pattern = rf"(\{{[\s\S]*?id:\s*['\"]?{problem_id}['\"]?[\s\S]*?)(\n\s*\}})"
    
    def add_fields(match):
        return match.group(1) + ",\n" + new_fields + match.group(2)
    
    content = re.sub(pattern, add_fields, content, count=1)

# Write back
with open(r'c:\Users\DELL\OneDrive\Desktop\gens\data\practiceProblems.ts', 'w') as f:
    f.write(content)

print("✓ Updated practice problems with estimatedTime, relatedLesson, and commonMistake")
