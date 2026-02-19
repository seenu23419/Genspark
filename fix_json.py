
import json
import os

file_path = r'c:\Users\DELL\OneDrive\Desktop\gens\data\curriculum\c.json'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Identify the problematic Lesson 6 content
lesson_6_start_marker = '"id": "c6",'
lesson_6_end_marker = '"id": "c7",' # Or the end of the lessons array

try:
    # This is a bit risky if markers are not unique, but in this file they should be.
    # Actually, let's find the start of lesson 6 "content" field.
    content_key = '"content": "'
    
    # We know the approximate location and the damage.
    # The damage involves literal backslashes and newlines inside the JSON string.
    
    # Let's try to find the start of Lesson 6 again
    l6_pos = content.find('"id": "c6"')
    if l6_pos == -1:
        print("Could not find Lesson 6 start")
        exit(1)
        
    start_content_pos = content.find('"content": "', l6_pos)
    if start_content_pos == -1:
        print("Could not find content key")
        exit(1)
    
    start_val_pos = start_content_pos + len('"content": "')
    
    # Find the end of the content string (it ends with '"}') or similar.
    # In lesson 1-5, it ends with '",\n                "quizQuestions":'
    end_val_marker = '",\n                "quizQuestions":'
    end_val_pos = content.find(end_val_marker, start_val_pos)
    
    if end_val_pos == -1:
        # Try variation
        end_val_marker = '","quizQuestions":'
        end_val_pos = content.find(end_val_marker, start_val_pos)
        
    if end_val_pos == -1:
        print("Could not find content end marker")
        # Let's see what's there
        print("Context around L6 start:", content[l6_pos:l6_pos+500])
        exit(1)

    # The new content we WANT
    new_l6_content = r"""**Welcome to Lesson 6!** In this lesson, we will explore the symbols that perform operations on variables and values: **Operators**.\n\n---\n\n## Types of Operators in C\n\nOperators are grouped based on the type of operation they perform.\n\n### Arithmetic Operators\n\nUsed to perform mathematical calculations like addition, subtraction, and multiplication.\n\n| Operator | Name | Example |\n| :--- | :--- | :--- |\n| `+` | Addition | `a + b` |\n| `-` | Subtraction | `a - b` |\n| `*` | Multiplication | `a * b` |\n| `/` | Division | `a / b` |\n| `%` | Modulo | `a % b` |\n\n---\n\n## Relational Operators\n\nUsed to compare two values. They return either `1` (true) or `0` (false).\n\n| Operator | Name | Example |\n| :--- | :--- | :--- |\n| `==` | Equal to | `a == b` |\n| `!=` | Not equal to | `a != b` |\n| `>` | Greater than | `a > b` |\n| `<` | Less than | `a < b` |\n| `>=` | Greater than or equal to | `a >= b` |\n| `<=` | Less than or equal to | `a <= b` |\n\n---\n\n## Logical Operators\n\nUsed to combine multiple conditions.\n\n| Operator | Name | Example |\n| :--- | :--- | :--- |\n| `&&` | Logical AND | `a && b` |\n| `||` | Logical OR | `a || b` |\n| `!` | Logical NOT | `!a` |\n\n---\n\n## Assignment Operators\n\nUsed to assign values to variables.\n\n| Operator | Name | Example |\n| :--- | :--- | :--- |\n| `=` | Simple Assignment | `a = 10` |\n| `+=` | Add and Assign | `a += 5` (a = a + 5) |\n| `-=` | Subtract and Assign | `a -= 5` (a = a - 5) |\n\n---\n\n## Increment and Decrement Operators\n\nUsed to increase or decrease the value of a variable by `1`.\n\n| Operator | Name | Example |\n| :--- | :--- | :--- |\n| `++` | Increment | `++a` or `a++` |\n| `--` | Decrement | `--a` or `a--` |\n\n---\n\n## Your Next Steps\n\n1. **Start with:** Decision Making in C\n2. **Then:** Master `if` and `else` statements\n3. **Finally:** Take the Quiz below to test your knowledge!"""

    # Reconstruct the file
    new_content = content[:start_val_pos] + new_l6_content + content[end_val_pos:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Successfully fixed c.json")

except Exception as e:
    print(f"Error: {e}")
    exit(1)
