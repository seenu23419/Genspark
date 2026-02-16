
import json
import os

file_path = r'C:\Users\DELL\OneDrive\Desktop\gens\data\curriculum\c.json'
temp_path = file_path + '.tmp'

# Correct content for Level 2 transition and lessons
# I will use a placeholder in the file to find the start of Level 2 corruption.

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The corruption starts specifically where Level 1 problems end or Level 2 begins.
# Let's find Lesson 6 (c6) and Level 1 problems (c-l1-p1) to anchor.

# I will define the WHOLE segment from c-l1-p1 through c9.
correct_segment = """        "problems": [
            {
                "id": "c-l1-p1",
                "title": "Hello GenSpark",
                "difficulty": "easy",
                "description": "Write a C program that prints 'Hello GenSpark' followed by a newline.",
                "starter_code": "#include <stdio.h>\\n\\nint main() {\\n    // Your code here\\n    printf(\\"Hello GenSpark\\\\n\\");\\n    return 0;\\n}",
                "test_cases": [
                    {
                        "stdin": "",
                        "expected_output": "Hello GenSpark\\n"
                    }
                ]
            },
            {
                "id": "c-l1-p2",
                "title": "Sum of Two Numbers",
                "difficulty": "easy",
                "description": "Write a program that takes two integers as input and prints their sum.",
                "starter_code": "#include <stdio.h>\\n\\nint main() {\\n    int a, b;\\n    // Input two numbers using scanf\\n    // Print the sum\\n    return 0;\\n}",
                "test_cases": [
                    {
                        "stdin": "10 20",
                        "expected_output": "30"
                    },
                    {
                        "stdin": "5 -3",
                        "expected_output": "2"
                    }
                ]
            },
            {
                "id": "c-l1-p3",
                "title": "Circle Area",
                "difficulty": "easy",
                "description": "Calculate the area of a circle given its radius. Use 3.14 for PI. Area = PI * r * r. Print result with 2 decimal places.",
                "starter_code": "#include <stdio.h>\\n\\nint main() {\\n    float radius, area;\\n    // Read radius\\n    // Calculate and print area\\n    return 0;\\n}",
                "test_cases": [
                    {
                        "stdin": "5",
                        "expected_output": "78.50"
                    }
                ]
            },
            {
                "id": "c-l1-p4",
                "title": "Celsius to Fahrenheit",
                "difficulty": "easy",
                "description": "Convert temperature from Celsius to Fahrenheit. Formula: F = (C * 9/5) + 32. Print result with 2 decimal places.",
                "starter_code": "#include <stdio.h>\\n\\nint main() {\\n    float celsius, fahrenheit;\\n    // Read celsius\\n    // Calculate and print fahrenheit\\n    return 0;\\n}",
                "test_cases": [
                    {
                        "stdin": "37",
                        "expected_output": "98.60"
                    }
                ]
            },
            {
                "id": "c-l1-p5",
                "title": "Print ASCII Value",
                "difficulty": "easy",
                "description": "Read a character from the user and print its ASCII value.",
                "starter_code": "#include <stdio.h>\\n\\nint main() {\\n    char ch;\\n    // Read character\\n    // Print ASCII value\\n    return 0;\\n}",
                "test_cases": [
                    {
                        "stdin": "A",
                        "expected_output": "65"
                    }
                ]
            }
        ]
    },
    {
        "id": "c-l2",
        "title": "LEVEL 2: Flow Control",
        "lessons": [
            {
                "id": "c7",
                "title": "7. C Control Flow: `if` and `else` ",
                "duration": "30 mins",
                "content": "# C Control Flow (`if` / `else`)\\n\\nPrograms aren't just a list of instructions; they need to make decisions. Control flow allows your code to choose different paths based on conditions.\\n\\n---\\n\\n## 1. The `if` Statement\\n\\n### ➤ Purpose\\nChecks a condition. If it is **True (Non-Zero)**, the code block runs. If **False (Zero)**, it is skipped.\\n\\n### ➤ Syntax\\n```c\\nif (condition) {\\n    // Code runs if condition is true\\n}\\n```\\n\\n### ⚡ Example\\n```c\\nint score = 85;\\nif (score >= 50) {\\n    printf(\\"You Passed!\\\\n\\");\\n}\\n```\\n\\n### Expected Output\\n```text\\nYou Passed!\\n```\\n\\n---\\n\\n## 2. The `else` Clause\\n\\n### ➤ Purpose\\nProvides a \\"Plan B\\". If the `if` condition is false, the `else` block executes.\\n\\n### ⚡ Example\\n```c\\nint age = 16;\\nif (age >= 18) {\\n    printf(\\"Adult\\\\n\\");\\n} else {\\n    printf(\\"Minor\\\\n\\");\\n}\\n```\\n\\n### Expected Output\\n```text\\nMinor\\n```\\n\\n---\\n\\n## 3. The `else if` Ladder\\n\\n### ➤ Purpose\\nUsed for multiple mutually exclusive conditions. The program checks them in order and only runs the **first** one that is true.\\n\\n### ⚡ Example\\n```c\\nint temp = 25;\\nif (temp > 30) {\\n    printf(\\"Hot\\\\n\\");\\n} else if (temp > 20) {\\n    printf(\\"Warm\\\\n\\");\\n} else {\\n    printf(\\"Cold\\\\n\\");\\n}\\n```\\n\\n### Expected Output\\n```text\\nWarm\\n```\\n\\n> [!IMPORTANT]\\n> **Compiler Insight: The Truth About True**\\n> In C, there is no built-in \\"Boolean\\" type in the core language logic. Instead, C treats **0 as False** and **any non-zero value (1, 100, -5) as True**.\\n\\n---\\n\\n## 4. Nested Conditions\\n\\n### ➤ Purpose\\nPlacing an `if` inside another `if`. This is used for complex, multi-layered decisions.\\n\\n### ⚡ Example\\n```c\\nint salary = 50000, credit_score = 750;\\nif (salary >= 40000) {\\n    if (credit_score > 700) {\\n        printf(\\"Loan Approved\\\\n\\");\\n    } else {\\n        printf(\\"Low Credit Score\\\\n\\");\\n    }\\n}\\n```\\n\\n---\\n\\n## 5. Complete Example: The Number Filter\\n\\n```c\\n#include <stdio.h>\\n\\nint main() {\\n    int num;\\n    printf(\\"Enter a number: \\");\\n    scanf(\\"%d\\", &num);\\n\\n    if (num > 0) {\\n        printf(\\"%d is Positive.\\\\n\\", num);\\n    } else if (num < 0) {\\n        printf(\\"%d is Negative.\\\\n\\", num);\\n    } else {\\n        printf(\\"The number is Zero.\\\\n\\");\\n    }\\n\\n    return 0;\\n}\\n```\\n\\n### Expected Output (If input is -5)\\n```text\\nEnter a number: -5\\n-5 is Negative.\\n```\\n\\n### ➤ How it Works?\\n1.  **Wait for Input**: The program pauses at `scanf` for the user to type a number.\\n2.  **Primary Check**: It first tests `num > 0`. Since -5 is not greater than 0, it skips to the next step.\\n3.  **Secondary Check**: It tests `num < 0`. This is **True**, so it executes this block and prints \\"Negative\\".\\n4.  **Exit**: Because a true condition was found in the ladder, it skips the final `else` and finishes.\\n\\n---\\n\\n## 6. Pro Tips & Gotchas\\n\\n> [!CAUTION]\\n> **The Assignment Danger**\\n> Writing `if (x = 5)` instead of `if (x == 5)` is a common bug! The first one *assigns* 5 to x, and since 5 is non-zero, it is always treated as **True**.\\n\\n> [!TIP]\\n> **The Dangling Else**\\n> An `else` always belongs to the **nearest** `if` above it, unless you use curly braces `{}` to specify otherwise. Always use braces to keep your logic clear!","
                "quizQuestions": [
                    {
                        "id": 1,
                        "text": "In C, what does the following condition evaluate to?\\n`if (-5)`Standard output is truncated.",
                "options": [
                    "True",
                    "False",
                    "Error",
                    "Undefined"
                ],
                "correctAnswer": 0,
                "explanation": "In C, any non-zero value (including negative numbers) is treated as True. Only exactly 0 is False."
            },
            {
                "id": 2,
                "text": "What is wrong with this code?\\n\\n```c\\nif (x == 10);\\n{\\n    printf(\\"Hello\\");\\n}\\n```",
                "options": [
                    "Missing quotes",
                    "Semicolon after 'if' terminates it",
                    "Invalid comparison",
                    "Nothing is wrong"
                ],
                "correctAnswer": 1,
                "explanation": "Putting a semicolon immediately after `if(...)` creates an empty statement. The printf() block will then execute every time, regardless of the condition."
            },
            {
                "id": 3,
                "text": "Which statement is used to check multiple conditions sequentially until one is found true?",
                "options": [
                    "if-else",
                    "else if ladder",
                    "while",
                    "nested if"
                ],
                "correctAnswer": 1,
                "explanation": "The 'else if' ladder allows checking multiple conditions in sequence, stopping as soon as one match is found."
            },
            {
                "id": 4,
                "text": "What will be the output if `age = 15`?\\n\\n```c\\nif (age > 10)\\n    if (age > 20)\\n        printf(\\"A\\");\\nelse\\n    printf(\\"B\\");\\n```",
                "options": [
                    "A",
                    "B",
                    "No output",
                    "Error"
                ],
                "correctAnswer": 1,
                "explanation": "Dangling Else Rule: The 'else' belongs to the nearest 'if' (age > 20). Since (age > 10) is true, it checks (age > 20). 15 > 20 is false, so it runs its else: 'B'."
            },
            {
                "id": 5,
                "text": "What happens if you use `if (x = 0)` in C?",
                "options": [
                    "Checks if x is 0",
                    "Sets x to 0 and evaluates to False",
                    "Sets x to 0 and evaluates to True",
                    "Compiler Error"
                ],
                "correctAnswer": 1,
                "explanation": "The single `=` is assignment. It sets x to 0. Since the result of the whole expression is 0, C treats it as False."
            }
        ]
    },
    {
        "id": "c8",
        "title": "8. switch Statement",
        "duration": "25 mins",
        "content": "# C Switch-Case Statement\\n\\nThe `switch` statement is a multi-way selection statement. It's a cleaner way to handle multiple conditions compared to a long `if-else if` ladder.\\n\\nIt allows you to test a variable against a list of values called **cases**.\\n\\n---\\n\\n## Key Keywords\\n\\n- **switch**: Starts the block and evaluates the variable.\\n- **case**: A specific value to check against.\\n- **break**: Exits the switch block (very important!).\\n- **default**: Runs if no case matches (optional but recommended).\\n\\n---\\n\\n## Syntax\\n\\n```c\\nswitch (expression) {\\n    case value1:\\n        // code\\n        break;\\n    case value2:\\n        // code\\n        break;\\n    default:\\n        // code if no match\\n}\\n```\\n\\n---\\n\\n## Example 1: Menu Program\\n\\n```c\\n#include <stdio.h>\\n\\nint main() {\\n    int choice = 2;\\n\\n    printf(\\"1. Coffee\\\\n2. Tea\\\\n3. Juice\\\\n\\");\\n    printf(\\"Enter choice: \\");\\n\\n    switch(choice) {\\n        case 1:\\n            printf(\\"You selected Coffee\\\\n\\");\\n            break;\\n        case 2:\\n            printf(\\"You selected Tea\\\\n\\");\\n            break;\\n        case 3:\\n            printf(\\"You selected Juice\\\\n\\");\\n            break;\\n        default:\\n            printf(\\"Invalid choice\\\\n\\");\\n    }\\n\\n    return 0;\\n}\\n```\\n\\n### Expected Output\\n```text\\n1. Coffee\\n2. Tea\\n3. Juice\\nEnter choice: \\nYou selected Tea\\n```\\n\\n**How it Works?**\\n> **Step 1**: The `switch` evaluates the variable `choice` (which is 2).\\n> **Step 2**: It jumps directly to `case 2$.\\n> **Step 3**: It prints \\"You selected Tea\\".\\n> **Step 4**: The `break` statement tells the program to exit the switch completely and stop checking other cases.\\n\\n---\\n\\n## Example 2: Fall-through (No break)\\n\\nIf you forget the `break`, C will execute **all** subsequent cases until it hits a break or the end of the switch. This is called **Fall-through**.\\n\\n```c\\nchar grade = 'B';\\n\\nswitch(grade) {\\n    case 'A': printf(\\"Excellent \\");\\n    case 'B': printf(\\"Good \\");\\n    case 'C': printf(\\"Average \\");\\n    break;\\n}\\n```\\n\\n### Expected Output\\n```text\\nGood Average\\n```\\n\\n**How it Works?**\\n> Since `grade` is 'B', the program starts at `case 'B'`. Because there is no `break` after \\"Good\\", it \\"falls through\\" and also executes `case 'C'`, printing \\"Average\\". It finally stops at the `break` in case 'C'.\\n\\n---\\\\n\\\\n## Important Rules\\\\n\\\\n1.  **Data Types**: Switch only works with **Integers** (`int`) and **Characters** (`char`). You cannot use `float` or `double`.\\\\n2.  **Break**: Always use `break` unless you intentionally want a fall-through effect.\\\\n3.  **Default**: Place `default` at the end to handle unexpected inputs.\\\\n4.  **Constants**: Case values must be constants (like 1, 10, or 'A'), not variables.\",\\n                \"quizQuestions\": [\\n                    {\\n                        \"id\": 1,\\n                        \"text\": \"What happens if a `break` statement is missing in a switch case?\",\\n                        \"options\": [\\n                            \"The program crashes\",\\n                            \"Execution falls through to the next case\",\\n                            \"The switch immediately exits\",\\n                            \"A compilation error occurs\"\\n                        ],\\n                        \"correctAnswer\": 1,\\n                        \"explanation\": \"Without a break, C continues executing the next cases sequentially until it encounters a break or the end of the block.\"\\n                    },\\n                    {\\n                        \"id\": 2,\\n                        \"text\": \"Which of these data types is NOT allowed in a switch expression?\",\\n                        \"options\": [\\n                            \"int\",\\n                            \"char\",\\n                            \"float\",\\n                            \"short\"\\n                        ],\\n                        \"correctAnswer\": 2,\\n                        \"explanation\": \"Switch statements in C do not support floating-point numbers (float/double) because they require exact comparisons.\"\\n                    },\\n                    {\\n                        \"id\": 3,\\n                        \"text\": \"What is the output of this code?\\\\n\\\\n```c\\\\nint x = 2;\\\\nswitch(x) {\\\\n    case 1: printf(\\\\\\\"One \\\\\\\");\\\\n    case 2: printf(\\\\\\\"Two \\\\\\\");\\\\n    case 3: printf(\\\\\\\"Three \\\\\\\");\\\\n    break;\\\\n}\\\\n```\",\\n                        \"options\": [\\n                            \"Two\",\\n                            \"Two Three\",\\n                            \"One Two Three\",\\n                            \"Three\"\\n                        ],\\n                        \"correctAnswer\": 1,\\n                        \"explanation\": \"Since there is no break after case 2, it prints \'Two\' and then \'falls through\' to case 3 and prints \'Three\' before hitting a break.\"\\n                    },\\n                    {\\n                        \"id\": 4,\\n                        \"text\": \"The `default` case in a switch statement is:\",\\n                        \"options\": [\\n                            \"Mandatory\",\\n                            \"Optional\",\\n                            \"Only for errors\",\\n                            \"Used for the first case\"\\n                        ],\\n                        \"correctAnswer\": 1,\\n                        \"explanation\": \"The default case is optional. It executes only when none of the specified cases match the expression.\"\\n                    },\\n                    {\\n                        \"id\": 5,\\n                        \"text\": \"What value can follow the `case` keyword?\",\\n                        \"options\": [\\n                            \"A variable\",\\n                            \"A constant value\",\\n                            \"An expression like x > 5\",\\n                            \"A string like \\\\\\\"Hello\\\\\\\"\"\\n                        ],\\n                        \"correctAnswer\": 1,\\n                        \"explanation\": \"Case labels must be constant expressions (like 5, \'B\', or an enum). They cannot be variables or logical comparisons.\"\\n                    }\\n                ]\\n            },
            {
                "id": "c9","""

# We need to find where Level 1 lessons end (line 411/412 approximately) 
# and where Lesson 9 starts (currently on the same line as the corruption).

start_marker = '"id": "c6",'
end_marker = '"id": "c9",'

# Splice the correct segment in.
# I'll just find the range from c-l1-p1 to c9 and replace it.

start_idx = content.find('"problems": [')
end_idx = content.find('"id": "c9",')

# Be careful, we want to replace from before "problems" to before c9's "id".
# Actually, let's replace from the end of Lesson 6.
real_start_idx = content.find(']               }            }        ],') # This is what it currently looks like maybe?
# Better to find by line number 412 or specific text from 412.
anchor_text = ']            }        ],'
start_idx = content.find(anchor_text)

if start_idx == -1:
    print("Anchor text not found!")
    # Try another anchor
    anchor_text = '"explanation": "15 divided by 4 is 3 with a remainder of 3. Modulo operator (%) calculates only the remainder."'
    start_idx = content.find(anchor_text)
    if start_idx != -1:
        # Move forward past the braces/brackets
        start_idx = content.find(']', start_idx) + 1
        start_idx = content.find('}', start_idx) + 1
        start_idx = content.find(']', start_idx) + 1
    else:
        print("Secondary anchor also not found!")
        exit(1)

# Now find the end anchor
end_anchor = '"id": "c9",'
end_idx = content.find(end_anchor)

if end_idx == -1:
    print("End anchor not found!")
    exit(1)

new_content = content[:start_idx] + "\n" + correct_segment + "\n            " + content[end_idx:]

with open(temp_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Repaired content written to {temp_path}")
# In a real scenario, the agent would then move the file, 
# but I will use the output to confirm and then I'll use run_command to move it.
