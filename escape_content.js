
const content = `**Welcome to C Programming!** Your journey to becoming a powerful programmer starts here. C is the foundation of modern computing.

### What is C?
C is a general-purpose, low-level programming language created to make computers do exactly what you want.
- **General-purpose**  Used for almost any type of software
- **Low-level**  Close to hardware, giving you control
- **Fast & Efficient**  Programs run at lightning speed
- **Portable**  Write once, run anywhere

C has been closely associated with the UNIX system where it was developed, since both the system and most of the programs that run on it are written in C.

---

### History of C Language
- **Created by:** Dennis Ritchie at AT&T Bell Labs (1972)
- **Purpose:** To overcome limitations of earlier languages (B, BCPL)
- **First Use:** Building the UNIX operating system
- **Legacy:** Still one of the most popular languages today

Dennis Ritchie is known as the founder of C language and his creation revolutionized computer science.

---

### Why Learn C?

#### C is a Core Language
In computing, C is the foundational language that teaches you how computers really work. It builds a mental model of memory and execution that will make you a better programmer in any language.

#### C is Small & Simple
- Only 32 keywords (most languages have 50+)
- Simple to learn, powerful to use
- Easy to remember the basics

#### C is Fast
- No "middleman" software slowing you down
- Direct access to computer hardware
- Perfect for performance-critical applications

#### C is Portable
- Write code once on Windows
- Run it unchanged on Mac or Linux
- Works on phones, IoT devices, supercomputers

---

### Advantages & Limitations of C
To understand C completely, we must look at both its strengths and its weaknesses.

#### Advantages
1. **High Performance**: C is extremely fast because it runs close to the hardware.
2. **Portability**: C programs can run on any machine with little to no changes.
3. **Low-Level Access**: You can directly control memory and hardware, perfect for drivers and kernels.
4. **Structured**: It allows breaking complex problems into smaller functions.
5. **Core Foundation**: Learning C makes it easy to learn C++, Java, and Python later.

#### Limitations
1. **No Constructor / Destructor**: Unlike C++ or Java, C does not support Object-Oriented Programming (OOP).
2. **Manual Memory Management**: You must allocate and free memory yourself. Forgetting to free memory causes memory leaks.
3. **No Garbage Collection**: There is no automatic system to clean up unused memory.
4. **Runtime Checking**: C has strict checking at compile time but very little at runtime (e.g., array index out of bounds is not checked).
5. **No Namespaces**: All variables must have unique names in the global scope, which can cause naming conflicts in large projects.

---

### Real-World Applications
- **Operating Systems**: Linux Kernel, Windows Core, macOS Foundation. C powers the software on billions of devices.
- **Embedded Systems**: Cars & Automobiles, Medical Devices, Smart Home Appliances. C runs the tiny computers inside everyday devices.
- **High-Performance Software**: Databases (MySQL, Oracle), Game Engines, Compilers & Interpreters. C handles millions of operations per second.
- **Software Development Tools**: Compilers, Text Editors, Version Control Systems. Tools you use are often built with C.

---

### C vs. Other Languages (including C++)
Why learn C when we have C++, Python, or Java?

| Feature | **C Language** | **C++** | **Python / Java** |
| :--- | :--- | :--- | :--- |
| **Paradigm** | Procedural | Multi-paradigm (OOP) | OOP / Scripting |
| **Speed** | Extremely Fast | Fast / High Performance | Slower |
| **Memory** | Manual | Manual / RAII | Automatic (Garbage Collection) |
| **Usage** | Systems, Embedded | Games, Systems, Apps | Web, Data Science |

---

## Structure of a C Program

![C Program Structure Diagram](/curriculum/c_program_structure.png)

To write effective code, you must understand the standard architecture that every C program follows. This structure ensures that the compiler can process your instructions correctly and efficiently.

### 1. Header Files Inclusion
The first component of any C program is the **Header Files**. A header file is a file with the .h extension that contains function declarations and macro definitions designed to be shared across several source files.

- **Preprocessor**: All lines starting with # are processed by a preprocessor, a program invoked by the compiler. In our example, the preprocessor copies the preprocessed code of <stdio.h> directly into our file.
- **Standard Libraries**: These .h files are essential building blocks. Some common C Header files include:
    - **stddef.h**: Defines several useful types and macros used throughout C.
    - **stdint.h**: Defines exact-width integer types (like int32_t).
    - **stdio.h**: Defines the core input and output functions (like printf and scanf).
    - **stdlib.h**: Defines numeric conversion functions, pseudo-random number generators, and memory allocation.
    - **string.h**: Defines functions for handling and manipulating strings.
    - **math.h**: Defines common mathematical functions for complex calculations.

### 2. Main Method Declaration
The int main() function is the mandatory entry point of every C program. Execution typically begins with the very first line inside this function.

- **Return Type**: The int before main specifies that the function returns an integer value to the operating system upon completion.
- **Parameters**: Empty brackets () mean that in this simple case, the main function doesn't take any external arguments.

### 3. Body of Main Method
The body consists of all the statements enclosed within a pair of curly brackets {}. These brackets define the scope and boundaries of the function.

- **Logic Center**: This is where you write your program's core logic, such as calculations, loops, and data manipulations.
- **Scope**: Every function in C must start with { and end with }, ensuring the compiler knows where the logic begins and ends.

### 4. Comments
Comments (like // This is a comment) are essential for documentation. They are completely ignored by the compiler and do not affect the final executable program.

- **Single-line**: Use // for brief notes on a single line.
- **Multi-line**: Use /* ... */ for longer explanations spanning across multiple lines of code.

### 5. Statements
Statements are the actual instructions you give to the computer. In C, every individual statement must be terminated by a semicolon (;).

- **Execution**: The compiler reads these one by one to perform tasks like printf(), which displays text on the screen.
- **Syntax**: Forgetting a semicolon is one of the most common errors for beginners, as the compiler won't know where one instruction ends and the next begins.

### 6. Return Statement
The return 0; statement is usually the final part of a C function. It sends a value back to the caller - which, for the main function, is the operating system.

- **Termination Status**: Returning 0 is a universal signal that the program has finished successfully without any errors.
- **Exit Code**: Non-zero values can be used to indicate specific types of failures or errors to the system.

---

### Your First C Program
Every programming journey starts with a simple tradition: printing "Hello, World!" to the screen. Here is what it looks like in C:

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

**Breaking it Down:**
- **#include <stdio.h>**: This line tells the compiler to include the Standard Input Output library. It contains the code for input/output functions like \`printf\`.
- **int main() { ... }**: This is the main function. Every C program starts execution from here.
- **printf("Hello, World!\\n");**: This function prints text to the screen. The \`\\n\` creates a new line.
- **return 0;**: This ends the main function and returns \`0\` to the operating system, which means "the program finished successfully".

---

### How C Works: The Compilation Process
Computers don't understand C code directly. They only understand binary (0s and 1s). To run a C program, it must be compiled. The journey from Code to Execution involves 4 steps:

1. **Preprocessing**: The preprocessor handles lines starting with \`#\` (like \`#include\`). It prepares the code for compilation.
2. **Compilation**: The compiler translates your C code into **Assembly code** (low-level human-readable instructions).
3. **Assembly**: The assembler converts the assembly code into **Object code** (binary machine code, but not yet executable).
4. **Linking**: The linker combines your object code with library files (like the code for \`printf\`) to create the final **Executable file** (e.g., .exe or .out).

> **Source Code (.c)** -> **Compiler** -> **Machine Code (.exe)**

---

### What You'll Learn
In this C journey, you'll master:
- **Fundamentals**: Variables, Data Types, Operators
- **Control Flow**: Decision Making, Loops
- **Functions**: Modular, Reusable Code
- **Arrays & Strings**: Handling Collections of Data
- **Pointers**: Advanced Memory Management
- **Structures**: Organizing Complex Data
- **File Handling**: Reading & Writing Files

---

### Your Next Steps
- **Start with:** Keywords and Identifiers
- **Then:** Build your first real program
- **Finally:** Take the Quiz below to test your knowledge!

> *"The way to get started is to quit talking and begin doing." - Walt Disney*`;

console.log(JSON.stringify(content));
