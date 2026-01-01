
import { LessonModule } from '../types';

export const C_CURRICULUM: LessonModule[] = [
    {
        id: 'c-l1',
        title: 'LEVEL 1: Basics & Data Types',
        lessons: [
            {
                id: 'c1',
                title: '1. What is C and Why it Matters',
                duration: '10 mins',
                topics: ['History of C', 'Key Features', 'Real-world Uses'],
                content: `C is a general-purpose, procedural computer programming language supporting structured programming, lexical variable scope, and recursion, with a static type system. By design, C provides constructs that map efficiently to typical machine instructions.

Why C still matters:
- Operating Systems: Windows, Linux, and macOS kernels are written in C.
- Embedded Systems: From your microwave to your car's ECU.
- Performance: C is often used for game engines and high-frequency trading apps.
- Basis for other languages: C++, Java, and Python were all influenced by C.`,
                syntax: '// Structure of a Basic C Program\n#include <stdio.h>\n\nint main() {\n  // Code goes here\n  return 0;\n}',
                codeExample: '#include <stdio.h>\n\nint main() {\n    printf("Welcome to GenSpark C Labs!\\n");\n    return 0;\n}',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    // Try printing your name below\n    printf("Hello, C Programmer!\\n");\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Who invented C?', options: ['James Gosling', 'Bjarne Stroustrup', 'Dennis Ritchie', 'Guido van Rossum'], correctAnswer: 2 },
                    { id: 2, text: 'What type of language is C?', options: ['Object Oriented', 'Procedural', 'Functional', 'Scripting'], correctAnswer: 1 }
                ],
                practiceProblems: [
                    { problem: 'Modify the code to print "I am learning C at GenSpark".', solution: '#include <stdio.h>\nint main() { printf("I am learning C at GenSpark"); return 0; }' }
                ]
            },
            {
                id: 'c2',
                title: '2. Compilation Process',
                duration: '15 mins',
                topics: ['Source Code', 'Pre-processor', 'Compiler', 'Linker'],
                content: `C is a compiled language. This means your code must be converted into machine-readable instructions (binary) before it can run.

The 4 stages of compilation:
1. Pre-processing: Handles #include and #define.
2. Compiling: Converts C code to assembly.
3. Assembling: Converts assembly to object code.
4. Linking: Combines object code with libraries to create the executable.`,
                syntax: 'gcc filename.c -o outputname',
                codeExample: '// No specific code for theory, but here is a simple one\n#include <stdio.h>\nint main() { return 0; }',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    printf("The compiler is my friend!\\n");\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Which stage handles #include?', options: ['Compiler', 'Linker', 'Pre-processor', 'Assembler'], correctAnswer: 2 }
                ]
            },
            {
                id: 'c3',
                title: '3. Data Types & Variables',
                duration: '15 mins',
                topics: ['int', 'float', 'char', 'variable naming'],
                content: `Variables are containers for storing data values. In C, you must declare the type of data a variable will hold.

Common Types:
- int: Stores integers (e.g., 10, -5).
- float: Stores decimal numbers (e.g., 3.14).
- char: Stores single characters (e.g., 'A').`,
                syntax: 'type variableName = value;',
                codeExample: 'int age = 20;\nfloat price = 10.50;\nchar grade = \'A\';',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int score = 100;\n    float pi = 3.14;\n    char initial = \'G\';\n    \n    printf("Score: %d, Pi: %.2f, Initial: %c\\n", score, pi, initial);\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Which format specifier is used for float?', options: ['%d', '%f', '%c', '%s'], correctAnswer: 1 }
                ],
                practiceProblems: [
                    { problem: 'Declare an integer called "year" and set it to 2025. Print it.', solution: 'int year = 2025; printf("%d", year);' }
                ]
            },
            {
                id: 'c4',
                title: '4. Input & Output (scanf/printf)',
                duration: '20 mins',
                topics: ['printf', 'scanf', 'format specifiers', 'address-of operator'],
                content: `C uses printf() to send output to the screen and scanf() to take input from the user. 
        
Important: Use '&' (address-of operator) inside scanf for non-string variables!`,
                syntax: 'scanf("%d", &variable);',
                codeExample: 'int num;\nprintf("Enter a number: ");\nscanf("%d", &num);\nprintf("You entered: %d", num);',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int age;\n    printf("Enter your age: ");\n    scanf("%d", &age);\n    printf("You are %d years old.\\n", age);\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'What does the & symbol do in scanf?', options: ['Multiplies the value', 'Gets the memory address', 'Converts to string', 'Ends the line'], correctAnswer: 1 }
                ]
            }
        ]
    },
    {
        id: 'c-l2',
        title: 'LEVEL 2: Conditions & Loops',
        lessons: [
            {
                id: 'c5',
                title: '5. Arithmetic & Relational Operators',
                duration: '20 mins',
                topics: ['+', '-', '*', '/', '%', '==', '!=', '>', '<'],
                content: `Operators are symbols that perform operations on variables and values.
        
Arithmetic: +, -, *, /, % (modulus/remainder)
Relational: == (equal to), != (not equal), > (greater than), < (less than)`,
                syntax: 'sum = a + b;\nisEqual = (a == b);',
                codeExample: 'int a = 10, b = 3;\nint rem = a % b; // result is 1',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int x = 15, y = 4;\n    printf("Sum: %d\\n", x + y);\n    printf("Product: %d\\n", x * y);\n    printf("Remainder: %d\\n", x % y);\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'What is the result of 10 % 3?', options: ['3', '1', '0', '3.33'], correctAnswer: 1 }
                ]
            },
            {
                id: 'c6',
                title: '6. If-Else & Switch',
                duration: '25 mins',
                topics: ['if condition', 'else block', 'else if ladder', 'switch case'],
                content: `Decision-making structures require that the programmer specifies one or more conditions to be evaluated or tested by the program.

if (condition) {
  // block executed if true
} else {
  // block executed if false
}`,
                syntax: 'if (age >= 18) { printf("Adult"); }',
                codeExample: 'int x = 10;\nif (x > 5) {\n    printf("Large");\n} else {\n    printf("Small");\n}',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int num;\n    printf("Enter a number: ");\n    scanf("%d", &num);\n    if (num % 2 == 0) {\n        printf("%d is EVEN\\n", num);\n    } else {\n        printf("%d is ODD\\n", num);\n    }\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Which keyword handles the default case in switch?', options: ['else', 'default', 'break', 'stop'], correctAnswer: 1 }
                ]
            },
            {
                id: 'c7',
                title: '7. For, While & Do-While',
                duration: '30 mins',
                topics: ['Loop components', 'Iteration', 'Condition testing'],
                content: `Loops allow you to execute a block of code multiple times.
        
for: Best when you know exact iterations.
while: Best when you depend on a condition.
do-while: Runs at least once.`,
                syntax: 'for(init; condition; increment) { ... }',
                codeExample: 'for(int i=1; i<=5; i++) {\n    printf("%d ", i);\n}',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int i = 1;\n    printf("While Loop: ");\n    while(i <= 5) {\n        printf("%d ", i);\n        i++;\n    }\n    printf("\\nFor Loop: ");\n    for(int j=1; j<=5; j++) {\n        printf("%d ", j);\n    }\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'How many times does a do-while loop run at minimum?', options: ['0', '1', 'Depends on condition', '2'], correctAnswer: 1 }
                ]
            }
        ]
    },
    {
        id: 'c-l3',
        title: 'LEVEL 3: Arrays & Strings',
        lessons: [
            {
                id: 'c8',
                title: '8. Nested Loops & Star Patterns',
                duration: '35 mins',
                topics: ['Inner loops', 'Matrix logic', 'Visual patterns'],
                content: `Nested loops are often used for printing patterns or working with grids.
        
The outer loop typically handles Rows, and the inner loop handles Columns.`,
                syntax: 'for(int i=0; i<3; i++) {\n  for(int j=0; j<3; j++) {\n    // code\n  }\n}',
                codeExample: 'for(int i=1; i<=3; i++) {\n    for(int j=1; j<=i; j++) {\n        printf("*");\n    }\n    printf("\\n");\n}',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int rows = 5;\n    for(int i = 1; i <= rows; i++) {\n        for(int j = 1; j <= i; j++) {\n            printf("* ");\n        }\n        printf("\\n");\n    }\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'In pattern programs, usually, the inner loop controls:', options: ['Rows', 'Columns', 'Memory', 'Speed'], correctAnswer: 1 }
                ],
                practiceProblems: [
                    { problem: 'Modify the code to print a square of 4x4 stars.', solution: 'for(int i=0; i<4; i++) { for(int j=0; j<4; j++) printf("*"); printf("\\n");}' }
                ]
            },
            {
                id: 'c10',
                title: '9. 1D & 2D Arrays',
                duration: '30 mins',
                topics: ['Indexing', 'Base address', 'Memory contiguous', 'Matrices'],
                content: `Arrays are used to store multiple values in a single variable, instead of declaring separate variables for each value. Elements are stored in contiguous memory locations.`,
                syntax: 'int arr[5] = {1, 2, 3, 4, 5};',
                codeExample: 'int matrix[2][2] = {{1,2}, {3,4}};\nint x = arr[0]; // access first element',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int scores[3] = {85, 90, 95};\n    for(int i=0; i<3; i++) {\n        printf("Score %d: %d\\n", i+1, scores[i]);\n    }\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'What is the index of the first element in an array?', options: ['1', '0', '-1', 'any'], correctAnswer: 1 }
                ],
                practiceProblems: [
                    { problem: 'Create an array of 5 integers and find their sum.', solution: 'int arr[5]={1,2,3,4,5}, sum=0; for(int i=0; i<5; i++) sum+=arr[i]; printf("%d", sum);' }
                ]
            },
            {
                id: 'c12',
                title: '10. C-Style Strings',
                duration: '35 mins',
                topics: ['char arrays', 'null terminator', 'string.h'],
                content: `Strings are actually one-dimensional arrays of characters terminated by a null character '\\0'.`,
                syntax: 'char name[] = "GenSpark";',
                codeExample: '#include <string.h>\nchar s1[10] = "Hello";\nint len = strlen(s1);',
                fullProgram: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char greeting[] = "Hello World";\n    printf("String: %s\\n", greeting);\n    printf("Length: %lu\\n", strlen(greeting));\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Strings in C must end with which character?', options: ['\\n', '\\0', '.', ' '], correctAnswer: 1 }
                ]
            }
        ]
    },
    {
        id: 'c-l4',
        title: 'LEVEL 4: Functions & Pointers',
        lessons: [
            {
                id: 'c9',
                title: '11. Introduction to Functions',
                duration: '25 mins',
                topics: ['Declaration', 'Definition', 'Return types', 'Arguments'],
                content: `A function is a block of code that only runs when it is called. You can pass data, known as parameters, into a function. Functions are used to perform certain actions, and they are important for reusing code.`,
                syntax: 'returnType functionName(parameters) { // body }',
                codeExample: 'int add(int a, int b) {\n    return a + b;\n}',
                fullProgram: '#include <stdio.h>\n\n// Function Declaration\nvoid greet() {\n    printf("Hello from a function!\\n");\n}\n\nint main() {\n    greet(); // Function Call\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'What is the return type for a function that returns nothing?', options: ['int', 'null', 'void', 'empty'], correctAnswer: 2 }
                ]
            },
            {
                id: 'c11',
                title: '12. Pointer Basics',
                duration: '40 mins',
                topics: ['Address-of (&)', 'Dereference (*)', 'Pointer variables'],
                content: `A pointer is a variable that stores the memory address of another variable. This is a core concept in C that allows for powerful memory management.`,
                syntax: 'int *ptr = &variable;',
                codeExample: 'int val = 10;\nint *ptr = &val;\nprintf("%p", ptr); // prints address',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    int x = 50;\n    int *ptr = &x;\n\n    printf("Value of x: %d\\n", x);\n    printf("Address of x: %p\\n", &x);\n    printf("Pointer stores: %p\\n", ptr);\n    printf("Value via pointer: %d\\n", *ptr);\n    \n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Which operator gives the address of a variable?', options: ['*', '&', '->', '#'], correctAnswer: 1 }
                ]
            }
        ]
    },
    {
        id: 'c-l5',
        title: 'LEVEL 5: Structures & Files',
        lessons: [
            {
                id: 'c13',
                title: '13. Structures & Unions',
                duration: '30 mins',
                topics: ['struct keyword', 'Member access', 'Memory layout'],
                content: `Structures (also called structs) are a way to group several related variables into one place. Each variable in the structure is known as a member of the structure.`,
                syntax: 'struct Student { int id; float gpa; };',
                codeExample: 'struct Student s1;\ns1.id = 101;\ns1.gpa = 3.8;',
                fullProgram: '#include <stdio.h>\n\nstruct Player {\n    char name[20];\n    int score;\n};\n\nint main() {\n    struct Player p1 = {"Genny", 1000};\n    printf("Player: %s, Score: %d\\n", p1.name, p1.score);\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Which keyword is used to define a structure?', options: ['st', 'struct', 'structure', 'class'], correctAnswer: 1 }
                ]
            },
            {
                id: 'c14',
                title: '14. Reading & Writing Files',
                duration: '40 mins',
                topics: ['FILE pointer', 'fopen', 'fprintf', 'fclose'],
                content: `File handling in C allows you to permanently store data on a disk. Files are used for data persistence.`,
                syntax: 'FILE *fptr = fopen("file.txt", "w");',
                codeExample: 'fprintf(fptr, "Hello File");\nfclose(fptr);',
                fullProgram: '#include <stdio.h>\n\nint main() {\n    FILE *fp;\n    fp = fopen("test.txt", "w");\n    if(fp == NULL) return 1;\n    \n    fprintf(fp, "Learning C File Handling");\n    fclose(fp);\n    printf("File written successfully.\\n");\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Which mode is used to "append" to a file?', options: ['"r"', '"w"', '"a"', '"x"'], correctAnswer: 2 }
                ]
            },
            {
                id: 'c15',
                title: '15. Dynamic Memory (Malloc/Free)',
                duration: '45 mins',
                topics: ['Heap memory', 'Dynamic allocation', 'Memory leaks'],
                content: `Dynamic memory allocation allows you to allocate memory at runtime.
- malloc(): Allocates uninitialized memory.
- free(): Releases allocated memory to prevent leaks.`,
                syntax: 'int *ptr = (int*)malloc(n * sizeof(int));',
                codeExample: 'int *p = malloc(sizeof(int));\n*p = 5;\nfree(p);',
                fullProgram: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *arr, n=5;\n    arr = (int*)malloc(n * sizeof(int));\n    if(arr == NULL) return 1;\n    for(int i=0; i<n; i++) arr[i] = i*10;\n    for(int i=0; i<n; i++) printf("%d ", arr[i]);\n    free(arr);\n    return 0;\n}',
                quizQuestions: [
                    { id: 1, text: 'Which function releases dynamically allocated memory?', options: ['delete', 'release', 'free', 'remove'], correctAnswer: 2 }
                ]
            }
        ]
    }
];

