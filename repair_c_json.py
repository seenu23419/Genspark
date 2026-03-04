
import json
import os

file_path = r"c:\Users\DELL\OneDrive\Desktop\gens\data\curriculum\c.json"

# The correct Lesson 1 content and quiz
new_lesson_1 = {
    "id": "c1",
    "title": "Lesson 1: Introduction",
    "duration": "15 mins",
    "content": "**Welcome to C Programming!** Your journey to becoming a powerful programmer starts here. C is the foundation of modern computing.\n\n### What is C?\nC is a general-purpose, low-level programming language created to make computers do exactly what you want.\n- **General-purpose**  Used for almost any type of software\n- **Low-level**  Close to hardware, giving you control\n- **Fast & Efficient**  Programs run at lightning speed\n- **Portable**  Write once, run anywhere\n\nC has been closely associated with the UNIX system where it was developed, since both the system and most of the programs that run on it are written in C.\n\n---\n\n### History of C Language\n- **Created by:** Dennis Ritchie at AT&T Bell Labs (1972)\n- **Purpose:** To overcome limitations of earlier languages (B, BCPL)\n- **First Use:** Building the UNIX operating system\n- **Legacy:** Still one of the most popular languages today\n\nDennis Ritchie is known as the founder of C language and his creation revolutionized computer science.\n\n---\n\n### Why Learn C?\n\n#### C is a Core Language\nIn computing, C is the foundational language that teaches you how computers really work. It builds a mental model of memory and execution that will make you a better programmer in any language.\n\n#### C is Small & Simple\n- Only 32 keywords (most languages have 50+)\n- Simple to learn, powerful to use\n- Easy to remember the basics\n\n#### C is Fast\n- No \"middleman\" software slowing you down\n- Direct access to computer hardware\n- Perfect for performance-critical applications\n\n#### C is Portable\n- Write code once on Windows\n- Run it unchanged on Mac or Linux\n- Works on phones, IoT devices, supercomputers\n\n---\n\n### Advantages & Limitations of C\nTo understand C completely, we must look at both its strengths and its weaknesses.\n\n#### Advantages\n1. **High Performance**: C is extremely fast because it runs close to the hardware.\n2. **Portability**: C programs can run on any machine with little to no changes.\n3. **Low-Level Access**: You can directly control memory and hardware, perfect for drivers and kernels.\n4. **Structured**: It allows breaking complex problems into smaller functions.\n5. **Core Foundation**: Learning C makes it easy to learn C++, Java, and Python later.\n\n#### Limitations\n1. **No Constructor / Destructor**: Unlike C++ or Java, C does not support Object-Oriented Programming (OOP).\n2. **Manual Memory Management**: You must allocate and free memory yourself. Forgetting to free memory causes memory leaks.\n3. **No Garbage Collection**: There is no automatic system to clean up unused memory.\n4. **Runtime Checking**: C has strict checking at compile time but very little at runtime (e.g., array index out of bounds is not checked).\n5. **No Namespaces**: All variables must have unique names in the global scope, which can cause naming conflicts in large projects.\n\n---\n\n### Real-World Applications\n- **Operating Systems**: Linux Kernel, Windows Core, macOS Foundation. C powers the software on billions of devices.\n- **Embedded Systems**: Cars & Automobiles, Medical Devices, Smart Home Appliances. C runs the tiny computers inside everyday devices.\n- **High-Performance Software**: Databases (MySQL, Oracle), Game Engines, Compilers & Interpreters. C handles millions of operations per second.\n- **Software Development Tools**: Compilers, Text Editors, Version Control Systems. Tools you use are often built with C.\n\n---\n\n### C vs. Other Languages (including C++)\nWhy learn C when we have C++, Python, or Java?\n\n| Feature | **C Language** | **C++** | **Python / Java** |\n| :--- | :--- | :--- | :--- |\n| **Paradigm** | Procedural | Multi-paradigm (OOP) | OOP / Scripting |\n| **Speed** | Extremely Fast | Fast / High Performance | Slower |\n| **Memory** | Manual | Manual / RAII | Automatic (Garbage Collection) |\n| **Usage** | Systems, Embedded | Games, Systems, Apps | Web, Data Science |\n\n---\n\n## Structure of a C Program\n\n![C Program Structure Diagram](/curriculum/c_program_structure.png)\n\nTo write effective code, you must understand the standard architecture that every C program follows. This structure ensures that the compiler can process your instructions correctly and efficiently.\n\n### 1. Header Files Inclusion\nThe first component of any C program is the **Header Files**. A header file is a file with the .h extension that contains function declarations and macro definitions designed to be shared across several source files.\n\n- **Preprocessor**: All lines starting with # are processed by a preprocessor, a program invoked by the compiler. In our example, the preprocessor copies the preprocessed code of <stdio.h> directly into our file.\n- **Standard Libraries**: These .h files are essential building blocks. Some common C Header files include:\n    - **stddef.h**: Defines several useful types and macros used throughout C.\n    - **stdint.h**: Defines exact-width integer types (like int32_t).\n    - **stdio.h**: Defines the core input and output functions (like printf and scanf).\n    - **stdlib.h**: Defines numeric conversion functions, pseudo-random number generators, and memory allocation.\n    - **string.h**: Defines functions for handling and manipulating strings.\n    - **math.h**: Defines common mathematical functions for complex calculations.\n\n### 2. Main Method Declaration\nThe int main() function is the mandatory entry point of every C program. Execution typically begins with the very first line inside this function.\n\n- **Return Type**: The int before main specifies that the function returns an integer value to the operating system upon completion.\n- **Parameters**: Empty brackets () mean that in this simple case, the main function doesn't take any external arguments.\n\n### 3. Body of Main Method\nThe body consists of all the statements enclosed within a pair of curly brackets {}. These brackets define the scope and boundaries of the function.\n\n- **Logic Center**: This is where you write your program's core logic, such as calculations, loops, and data manipulations.\n- **Scope**: Every function in C must start with { and end with }, ensuring the compiler knows where the logic begins and ends.\n\n### 4. Comments\nComments (like // This is a comment) are essential for documentation. They are completely ignored by the compiler and do not affect the final executable program.\n\n- **Single-line**: Use // for brief notes on a single line.\n- **Multi-line**: Use /* ... */ for longer explanations spanning across multiple lines of code.\n\n### 5. Statements\nStatements are the actual instructions you give to the computer. In C, every individual statement must be terminated by a semicolon (;).\n\n- **Execution**: The compiler reads these one by one to perform tasks like printf(), which displays text on the screen.\n- **Syntax**: Forgetting a semicolon is one of the most common errors for beginners, as the compiler won't know where one instruction ends and the next begins.\n\n### 6. Return Statement\nThe return 0; statement is usually the final part of a C function. It sends a value back to the caller - which, for the main function, is the operating system.\n\n- **Termination Status**: Returning 0 is a universal signal that the program has finished successfully without any errors.\n- **Exit Code**: Non-zero values can be used to indicate specific types of failures or errors to the system.\n\n---\n\n### Your First C Program\nEvery programming journey starts with a simple tradition: printing \"Hello, World!\" to the screen. Here is what it looks like in C:\n\n```c\n#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}\n```\n\n**Breaking it Down:**\n- **#include <stdio.h>**: This line tells the compiler to include the Standard Input Output library. It contains the code for input/output functions like `printf`.\n- **int main() { ... }**: This is the main function. Every C program starts execution from here.\n- **printf(\"Hello, World!\\n\");**: This function prints text to the screen. The `\\n` creates a new line.\n- **return 0;**: This ends the main function and returns `0` to the operating system, which means \"the program finished successfully\".\n\n---\n\n### How C Works: The Compilation Process\nComputers don't understand C code directly. They only understand binary (0s and 1s). To run a C program, it must be compiled. The journey from Code to Execution involves 4 steps:\n\n1. **Preprocessing**: The preprocessor handles lines starting with `#` (like `#include`). It prepares the code for compilation.\n2. **Compilation**: The compiler translates your C code into **Assembly code** (low-level human-readable instructions).\n3. **Assembly**: The assembler converts the assembly code into **Object code** (binary machine code, but not yet executable).\n4. **Linking**: The linker combines your object code with library files (like the code for `printf`) to create the final **Executable file** (e.g., .exe or .out).\n\n> **Source Code (.c)** -> **Compiler** -> **Machine Code (.exe)**\n\n---\n\n### What You'll Learn\nIn this C journey, you'll master:\n- **Fundamentals**: Variables, Data Types, Operators\n- **Control Flow**: Decision Making, Loops\n- **Functions**: Modular, Reusable Code\n- **Arrays & Strings**: Handling Collections of Data\n- **Pointers**: Advanced Memory Management\n- **Structures**: Organizing Complex Data\n- **File Handling**: Reading & Writing Files\n\n---\n\n### Your Next Steps\n- **Start with:** Keywords and Identifiers\n- **Then:** Build your first real program\n- **Finally:** Take the Quiz below to test your knowledge!\n\n> *\"The way to get started is to quit talking and begin doing.\" - Walt Disney*",
    "quizQuestions": [
        {
            "id": 1,
            "text": "Where does the execution of every C program start?",
            "options": [
                "From the first line of the file",
                "From the main() function",
                "From the #include statement",
                "From user input"
            ],
            "correctAnswer": 1,
            "explanation": "The execution of every C program always begins inside the 'main()' function."
        },
        {
            "id": 2,
            "text": "What is the role of the 'Compiler' in C?",
            "options": [
                "To run the program directly",
                "To convert C code into machine code (binary)",
                "To write the code for you",
                "To organize files in folders"
            ],
            "correctAnswer": 1,
            "explanation": "The compiler translates human-readable C code into machine code (binary 0s and 1s) that the computer can execute."
        },
        {
            "id": 3,
            "text": "What does the line '#include <stdio.h>' do?",
            "options": [
                "It prints text to the screen",
                "It cleans up memory",
                "It includes the Standard Input Output library",
                "It defines the main function"
            ],
            "correctAnswer": 2,
            "explanation": "This line tells the preprocessor to include the 'stdio.h' library, which contains input/output functions like 'printf'."
        },
        {
            "id": 4,
            "text": "Which step of compilation combines object code with libraries to create an executable?",
            "options": [
                "Preprocessing",
                "Compiling",
                "Assembling",
                "Linking"
            ],
            "correctAnswer": 3,
            "explanation": "The 'Linking' step combines your object code with external libraries (like stdio.h code) to produce the final executable file."
        },
        {
            "id": 5,
            "text": "What is the purpose of the 'return 0;' statement in the main function?",
            "options": [
                "To repeat the program",
                "To stop the program and indicate success",
                "To print 0 to the screen",
                "To pause the program"
            ],
            "correctAnswer": 1,
            "explanation": "'return 0;' terminates the main function and returns the value 0 to the OS, indicating that the program finished successfully."
        }
    ]
}

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Level 1 is data[0]
    # Replace the lessons array's first element or entire list if corrupted
    # But since the JSON is likely currently malformed, json.load will fail.
    # So I need to read it as lines and fix it.
    pass
except Exception as e:
    print(f"JSON load failed as expected: {e}")

# Read as lines to perform surgical replacement
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We need to find the Level 1 "lessons" array and replace its first block.
# According to my latest view_file:
# Line 5: "lessons": [
# Line 6: { (Start of Lesson 1)
# ... corrupted mess ...
# Line 67: }, (End of malformed Lesson 1)
# Line 68: { (Start of Lesson 2)

# Python indices are 0-based, so Line 6 is index 5, Line 67 is index 66.
# We want to replace lines[5:67] (inclusive of 66).
# lines[5:67] in Python slicing is from index 5 up to but NOT including index 67.
# So lines[5:67] covers Line 6 to Line 67. Perfect.

# Convert new_lesson_1 to a indented JSON string block
new_lesson_json = json.dumps(new_lesson_1, indent=6, ensure_ascii=False)
# Add the correct indentation and trailing comma
new_lesson_json_lines = [ "      " + line + "\n" for line in new_lesson_json.split("\n") ]
new_lesson_json_lines[-1] = new_lesson_json_lines[-1].rstrip() + ",\n"

# Perform replacement
lines[5:67] = new_lesson_json_lines

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Repair complete!")
