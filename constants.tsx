
import { Language, Challenge, LessonModule } from './types';

export const LANGUAGES: Language[] = [
  { id: 'c', name: 'C Programming', icon: 'https://cdn.simpleicons.org/c/A8B9CC', level: 'Beginner to Advanced', stats: '40 Lessons • 40 Quizzes' },
  { id: 'java', name: 'Java', icon: 'https://cdn.simpleicons.org/openjdk/white', level: 'Intermediate to Advanced', stats: '60 Lessons • 15 Quizzes' },
  { id: 'python', name: 'Python', icon: 'https://cdn.simpleicons.org/python/3776AB', level: 'Beginner to Advanced', stats: '80 Lessons • 20 Quizzes' },
  { id: 'javascript', name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E', level: 'Fullstack Ready', stats: '90 Lessons • 25 Quizzes' },
  { id: 'cpp', name: 'C++', icon: 'https://cdn.simpleicons.org/cplusplus/00599C', level: 'Competitive Coding', stats: '55 Lessons • 18 Quizzes' },
  { id: 'sql', name: 'SQL', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png', level: 'Database Mastery', stats: '30 Lessons • 10 Quizzes' },
  { id: 'htmlcss', name: 'HTML & CSS', icon: 'https://cdn.simpleicons.org/html5/E34F26', level: 'Web Design', stats: '40 Lessons • 10 Quizzes' },
  { id: 'dsa', name: 'DSA', icon: 'https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/4338ca/external-data-structure-big-data-flatart-icons-outline-flatarticons.png', level: 'Interview Prep', stats: '100 Lessons • 40 Quizzes' },
  { id: 'fullstack', name: 'Full Stack', icon: 'https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/external-web-development-coding-kiranshastry-lineal-color-kiranshastry.png', level: 'Project Based', stats: '120 Lessons • 30 Quizzes' },
];

export const CURRICULUM: Record<string, LessonModule[]> = {
  'c': [
    {
      id: 'cb1',
      title: 'Phase 1: Beginner Level',
      lessons: [
        { 
          id: 'c1', 
          title: '1. Introduction to C', 
          topics: ['What is C?', 'History of C', 'Features of C', 'Where C is used'],
          duration: '10 mins', 
          content: '### What is it?\nC is a high-performance, structured programming language. It is often called the "Mother of all Languages" because many modern languages like Java, Python, and C++ are based on its syntax and principles.\n\n### Why we use it?\nWe use C because it provides direct access to system hardware and memory (RAM). It is fast, efficient, and remains the primary choice for building Operating Systems (like Windows/Linux) and Embedded Systems.',
          syntax: '#include <stdio.h>\n\nint main() {\n    // Statements\n    return 0;\n}',
          codeExample: '// Standard Print Function\nprintf("Hello, C World!");',
          fullProgram: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
          practiceProblems: [
            { problem: "Write a program to print your name on the screen.", solution: "#include <stdio.h>\nint main() { printf(\"Alex\\n\"); return 0; }" },
            { problem: "Print 'GenSpark' and 'AI' on two separate lines.", solution: "#include <stdio.h>\nint main() { printf(\"GenSpark\\nAI\\n\"); return 0; }" },
            { problem: "Print a star (*) pattern triangle using printf.", solution: "#include <stdio.h>\nint main() { printf(\"*\\n**\\n***\\n\"); return 0; }" },
            { problem: "Write a program to print numbers from 1 to 5 manually.", solution: "#include <stdio.h>\nint main() { printf(\"1 2 3 4 5\\n\"); return 0; }" },
            { problem: "Print 'Welcome to C' with a border of dashes.", solution: "#include <stdio.h>\nint main() { printf(\"----------\\nWelcome to C\\n----------\\n\"); return 0; }" }
          ],
          quizQuestions: [
            { id: 1, text: "Who developed the C language?", options: ["James Gosling", "Dennis Ritchie", "Bjarne Stroustrup", "Guido van Rossum"], correctAnswer: 1 },
            { id: 2, text: "In which year was C created?", options: ["1972", "1985", "1991", "1969"], correctAnswer: 0 },
            { id: 3, text: "C is primarily considered a:", options: ["High-level Language", "Low-level Language", "Middle-level Language", "Visual Language"], correctAnswer: 2 },
            { id: 4, text: "Where was C developed?", options: ["Microsoft Labs", "Bell Labs", "Google HQ", "CERN"], correctAnswer: 1 },
            { id: 5, text: "Which OS was written using C?", options: ["Windows 95", "UNIX", "Android", "macOS"], correctAnswer: 1 }
          ]
        },
        { 
          id: 'c2', 
          title: '2. Setting Up the Environment', 
          topics: ['Installing GCC', 'IDE Usage', 'Hello World', 'Compilation'],
          duration: '12 mins', 
          content: '### What is it?\nAn environment consists of a Compiler (GCC) and an Editor (VS Code). The compiler turns your code into an executable file the computer can run.\n\n### Why we use it?\nComputers don\'t understand C directly; they understand binary (0s and 1s). The environment provides the bridge between human-readable text and machine logic.',
          syntax: 'gcc filename.c -o outputname\n./outputname',
          codeExample: 'gcc main.c -o main',
          fullProgram: '#include <stdio.h>\n\nint main() {\n    printf("Environment Ready!\\n");\n    return 0;\n}',
          practiceProblems: [
            { problem: "Compile a file named 'test.c' using GCC.", solution: "gcc test.c -o test" },
            { problem: "Create a program that prints your current OS name.", solution: "#include <stdio.h>\nint main() { printf(\"Linux\\n\"); return 0; }" },
            { problem: "Write a comment explaining what stdio.h does.", solution: "// stdio.h handles input and output" },
            { problem: "Print 'Success' if you can run a C file.", solution: "printf(\"Success\");" },
            { problem: "Display the version of GCC on your machine via CLI.", solution: "gcc --version" }
          ],
          quizQuestions: [
            { id: 1, text: "What does GCC stand for?", options: ["Global C Compiler", "GNU Compiler Collection", "Generic Code Creator", "General C Collection"], correctAnswer: 1 },
            { id: 2, text: "What extension do C source files use?", options: [".cpp", ".exe", ".c", ".txt"], correctAnswer: 2 },
            { id: 3, text: "Which tool is used to write the code?", options: ["Compiler", "IDE/Text Editor", "Linker", "Loader"], correctAnswer: 1 },
            { id: 4, text: "The process of turning source code into binary is called:", options: ["Loading", "Compiling", "Linking", "Executing"], correctAnswer: 1 },
            { id: 5, text: "Which of these is a popular C IDE?", options: ["Photoshop", "Code::Blocks", "Excel", "Spotify"], correctAnswer: 1 }
          ]
        },
        { 
          id: 'c3', 
          title: '3. Structure of a C Program', 
          topics: ['Header Files', 'main() Function', 'Semicolons', 'Return 0'],
          duration: '10 mins', 
          content: '### What is it?\nEvery C program follows a standard skeleton. It starts with header files, followed by the main() function where execution begins.\n\n### Why we use it?\nStructure ensures that the compiler knows where to start and how to interpret standard commands like printf().',
          syntax: '#include <header.h>\n\nreturn_type function_name() {\n   // body\n}',
          fullProgram: '#include <stdio.h>\n\nint main() {\n    printf("Structure learned!\\n");\n    return 0;\n}',
          practiceProblems: [
            { problem: "Add a second header file to a program.", solution: "#include <stdio.h>\n#include <stdlib.h>" },
            { problem: "Create a main function that returns 1 instead of 0.", solution: "int main() { return 1; }" },
            { problem: "Print text without using a newline character.", solution: "printf(\"Hello\");" },
            { problem: "Write a program with an empty main function.", solution: "int main() { return 0; }" },
            { problem: "Fix a program missing a semicolon.", solution: "printf(\"Fixed\"); // Added ;" }
          ],
          quizQuestions: [
            { id: 1, text: "Which symbol ends a C statement?", options: [":", ".", ";", ","], correctAnswer: 2 },
            { id: 2, text: "The starting point of every C program is:", options: ["stdio.h", "main()", "return 0", "printf"], correctAnswer: 1 },
            { id: 3, text: "What does #include do?", options: ["Deletes a file", "Imports a library", "Starts the program", "Ends the code"], correctAnswer: 1 },
            { id: 4, text: "What is the return type of main() in standard C?", options: ["void", "float", "int", "char"], correctAnswer: 2 },
            { id: 5, text: "Curly braces {} are used to:", options: ["End a line", "Group statements", "Import files", "Print text"], correctAnswer: 1 }
          ]
        },
        { 
          id: 'c4', 
          title: '4. Variables and Data Types', 
          topics: ['int, float, double, char', 'Constants', 'Declaration', 'Initialization'],
          duration: '15 mins', 
          content: '### What is it?\nVariables are named memory locations used to store data. Data Types tell the computer what kind of data is being stored (numbers, letters, etc.).\n\n### Why we use it?\nWithout variables, we couldn\'t perform calculations or remember user input. They are the "nouns" of our programs.',
          syntax: 'type name = value;',
          codeExample: 'int age = 20;\nchar grade = \'A\';\nfloat price = 9.99;',
          fullProgram: '#include <stdio.h>\n\nint main() {\n    int x = 5;\n    float y = 2.5;\n    printf("Sum: %f\\n", x + y);\n    return 0;\n}',
          practiceProblems: [
            { problem: "Declare an integer variable 'year' and set it to 2025.", solution: "int year = 2025;" },
            { problem: "Create a char variable for your first initial.", solution: "char initial = 'A';" },
            { problem: "Initialize a float for the value of Pi (3.14).", solution: "float pi = 3.14;" },
            { problem: "Declare a constant integer for 'DAYS_IN_WEEK'.", solution: "const int DAYS_IN_WEEK = 7;" },
            { problem: "Print the value of an integer variable using %d.", solution: "printf(\"%d\", age);" }
          ],
          quizQuestions: [
            { id: 1, text: "Which type stores whole numbers?", options: ["float", "int", "char", "double"], correctAnswer: 1 },
            { id: 2, text: "How much memory does a standard 'char' take?", options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"], correctAnswer: 0 },
            { id: 3, text: "Which of these is a valid variable name?", options: ["2ndPlace", "total_sum", "$price", "void"], correctAnswer: 1 },
            { id: 4, text: "Format specifier for a float?", options: ["%d", "%c", "%f", "%s"], correctAnswer: 2 },
            { id: 5, text: "Keyword to make a variable unchangeable?", options: ["static", "fixed", "const", "final"], correctAnswer: 2 }
          ]
        },
        { 
          id: 'c5', 
          title: '5. Input & Output in C', 
          topics: ['printf()', 'scanf()', 'Formatting', 'Placeholders'],
          duration: '12 mins', 
          content: '### What is it?\nI/O refers to the communication between the program and the user. printf() handles output (writing), and scanf() handles input (reading).\n\n### Why we use it?\nTo make programs interactive. Users can provide data, and the program can display results.',
          syntax: 'scanf("%specifier", &variable);\nprintf("text %specifier", variable);',
          codeExample: 'scanf("%d", &age);\nprintf("Age: %d", age);',
          fullProgram: '#include <stdio.h>\n\nint main() {\n    int num;\n    printf("Enter a number: ");\n    scanf("%d", &num);\n    printf("You entered: %d\\n", num);\n    return 0;\n}',
          practiceProblems: [
            { problem: "Ask the user for their age and print it back.", solution: "scanf(\"%d\", &age); printf(\"%d\", age);" },
            { problem: "Read two integers and print their product.", solution: "scanf(\"%d %d\", &a, &b); printf(\"%d\", a*b);" },
            { problem: "Print a float with exactly 2 decimal places.", solution: "printf(\"%.2f\", price);" },
            { problem: "Input a character and display its ASCII value (%d).", solution: "scanf(\" %c\", &c); printf(\"%d\", c);" },
            { problem: "Display text: \"The value is [x]\" where x is a variable.", solution: "printf(\"The value is %d\", x);" }
          ],
          quizQuestions: [
            { id: 1, text: "Which function is used for input?", options: ["printf()", "input()", "scanf()", "read()"], correctAnswer: 2 },
            { id: 2, text: "What symbol must precede variable names in scanf?", options: ["*", "$", "&", "@"], correctAnswer: 2 },
            { id: 3, text: "Specifier for a character?", options: ["%d", "%f", "%c", "%s"], correctAnswer: 2 },
            { id: 4, text: "What does \\n do?", options: ["New Tab", "New Line", "Nullify", "Next Page"], correctAnswer: 1 },
            { id: 5, text: "Which header is required for printf?", options: ["math.h", "conio.h", "stdio.h", "stdlib.h"], correctAnswer: 2 }
          ]
        },
        { 
          id: 'c6', 
          title: '6. Operators in C', 
          topics: ['Arithmetic', 'Relational', 'Logical', 'Assignment', 'Inc/Dec'],
          duration: '15 mins', 
          content: '### What is it?\nOperators are symbols that perform operations on variables and values. C has a rich set: +, -, *, /, % (math), ==, != (comparison), &&, || (logic).\n\n### Why we use it?\nTo transform data. Without operators, we couldn\'t perform any logic or arithmetic in our code.',
          syntax: 'result = operand1 operator operand2;',
          codeExample: 'int sum = 10 + 5;\nif (x > y && y != 0)',
          fullProgram: '#include <stdio.h>\n\nint main() {\n    int a = 10, b = 3;\n    printf("Remainder: %d\\n", a % b);\n    return 0;\n}',
          practiceProblems: [
            { problem: "Calculate the area of a rectangle (L * W).", solution: "area = length * width;" },
            { problem: "Use the modulo operator to find the remainder of 15 / 4.", solution: "rem = 15 % 4;" },
            { problem: "Increment a variable 'count' by 1 using shorthand.", solution: "count++;" },
            { problem: "Check if 'a' is equal to 'b' and print the result (1 or 0).", solution: "printf(\"%d\", a == b);" },
            { problem: "Use logical NOT to flip a boolean value.", solution: "!isActive;" }
          ],
          quizQuestions: [
            { id: 1, text: "What is the result of 10 % 3?", options: ["3", "1", "0", "3.33"], correctAnswer: 1 },
            { id: 2, text: "Which operator is used for logical AND?", options: ["&", "&&", "|", "||"], correctAnswer: 1 },
            { id: 3, text: "Which is the assignment operator?", options: ["==", "=", ":=", "<-"], correctAnswer: 1 },
            { id: 4, text: "What does x++ do?", options: ["Add 2 to x", "Multiply x by 1", "Add 1 to x", "Decrement x"], correctAnswer: 2 },
            { id: 5, text: "Relational operator for 'Not Equal'?", options: ["!=", "<>", "~=", "not="], correctAnswer: 0 }
          ]
        }
      ]
    },
    {
      id: 'ccf1',
      title: 'Phase 2: Control Flow',
      lessons: [
        { 
          id: 'c7', 
          title: '7. Conditional Statements', 
          topics: ['if statement', 'if...else', 'nested if', 'switch...case'], 
          duration: '15 mins', 
          content: '### What is it?\nControl statements decide which code runs based on conditions. If the condition is true, one block runs; otherwise, another might.\n\n### Why we use it?\nTo make code "smart." For example, checking if a user password is correct before granting access.',
          syntax: 'if (condition) { ... } else { ... }',
          quizQuestions: [
            { id: 1, text: "Which keyword starts a condition?", options: ["for", "if", "loop", "switch"], correctAnswer: 1 },
            { id: 2, text: "Keyword for the alternative path?", options: ["then", "other", "else", "case"], correctAnswer: 2 },
            { id: 3, text: "Switch statements use which keyword for values?", options: ["item", "check", "case", "val"], correctAnswer: 2 },
            { id: 4, text: "Nested if means:", options: ["One if inside another", "An if that never ends", "An if with no body", "An if with multiple else"], correctAnswer: 0 },
            { id: 5, text: "Keyword used to stop a switch case?", options: ["stop", "exit", "break", "return"], correctAnswer: 2 }
          ],
          practiceProblems: [
            { problem: "Check if a number is even or odd.", solution: "if (n % 2 == 0) printf(\"Even\"); else printf(\"Odd\");" },
            { problem: "Write a program to find the largest of two numbers.", solution: "if (a > b) max = a; else max = b;" },
            { problem: "Use switch to print 'Monday' for case 1.", solution: "switch(d) { case 1: printf(\"Mon\"); break; }" },
            { problem: "Check if a year is a leap year.", solution: "if (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0))" },
            { problem: "Verify if a user is eligible to vote (age >= 18).", solution: "if (age >= 18) printf(\"Yes\");" }
          ]
        },
        { 
          id: 'c8', 
          title: '8. Looping in C', 
          topics: ['for loop', 'while loop', 'do...while loop', 'break and continue'], 
          duration: '20 mins', 
          content: '### What is it?\nLoops repeat a block of code multiple times. for is for fixed repeats, while is for condition-based repeats.\n\n### Why we use it?\nTo avoid writing the same code over and over. Processing 1,000 items in an array requires a loop.',
          syntax: 'for(init; cond; inc) { ... }\nwhile(cond) { ... }',
          quizQuestions: [
            { id: 1, text: "Which loop runs at least once?", options: ["for", "while", "do-while", "nested"], correctAnswer: 2 },
            { id: 2, text: "Keyword to exit a loop immediately?", options: ["exit", "break", "stop", "end"], correctAnswer: 1 },
            { id: 3, text: "Loop for a known number of iterations?", options: ["while", "for", "do-while", "infinite"], correctAnswer: 1 },
            { id: 4, text: "What happens in an infinite loop?", options: ["It runs once", "It runs forever", "It causes an error", "It skips logic"], correctAnswer: 1 },
            { id: 5, text: "Keyword to skip the current iteration?", options: ["skip", "break", "continue", "next"], correctAnswer: 2 }
          ],
          practiceProblems: [
            { problem: "Print numbers from 1 to 10 using a for loop.", solution: "for(int i=1; i<=10; i++) printf(\"%d\", i);" },
            { problem: "Calculate the sum of first N natural numbers.", solution: "while(i <= n) { sum += i; i++; }" },
            { problem: "Print the multiplication table of 5.", solution: "for(int i=1; i<=10; i++) printf(\"%d\", 5*i);" },
            { problem: "Find the factorial of a number using a loop.", solution: "for(int i=1; i<=n; i++) fact *= i;" },
            { problem: "Print even numbers between 1 and 20.", solution: "for(int i=2; i<=20; i+=2) printf(\"%d\", i);" }
          ]
        },
        { 
          id: 'c9', 
          title: '9. Nested Loops & Loop Control', 
          topics: ['Nested for loops', 'Infinite loops', 'Using break/continue'], 
          duration: '15 mins', 
          content: '### What is it?\nA nested loop is a loop inside another loop. The inner loop completes all its iterations for every single iteration of the outer loop.\n\n### Why we use it?\nTo process multi-dimensional data, like grids, matrices, or printing complex patterns (stars, pyramids).',
          syntax: 'for(...) { for(...) { ... } }',
          quizQuestions: [
             { id: 1, text: "A loop inside another loop is called:", options: ["Double loop", "Nested loop", "Multi loop", "Inner loop"], correctAnswer: 1 },
             { id: 2, text: "How many times does inner loop run if outer runs 5 and inner 5?", options: ["5", "10", "25", "50"], correctAnswer: 2 },
             { id: 3, text: "Which is used to create a 2D pattern?", options: ["Single loop", "Nested loop", "Switch case", "If-else"], correctAnswer: 1 },
             { id: 4, text: "Infinite loop condition in 'for'?", options: ["for(;;)", "for(1)", "for(stop)", "for(0)"], correctAnswer: 0 },
             { id: 5, text: "Break statement inside nested loop affects:", options: ["Both loops", "Only inner loop", "Only outer loop", "The whole program"], correctAnswer: 1 }
          ],
          practiceProblems: [
            { problem: "Print a 5x5 square of stars (*).", solution: "for(i=0;i<5;i++){for(j=0;j<5;j++)printf(\"*\");printf(\"\\n\");}" },
            { problem: "Print a right-angled triangle of numbers.", solution: "for(i=1;i<=n;i++){for(j=1;j<=i;j++)printf(\"%d\",j);printf(\"\\n\");}" },
            { problem: "Find prime numbers between 1 and 100.", solution: "Nested loop check: for each i, check for j from 2 to sqrt(i)" },
            { problem: "Print a reverse triangle pattern.", solution: "Outer loop i from n down to 1" },
            { problem: "Calculate the sum of digits of a number.", solution: "Use while(n>0) with modulo 10" }
          ]
        }
      ]
    },
    {
      id: 'cfn1',
      title: 'Phase 3: Functions',
      lessons: [
        { 
          id: 'c10', 
          title: '10. Functions in C', 
          topics: ['Declaration', 'Definition', 'Call', 'return statement'], 
          duration: '18 mins', 
          content: '### What is it?\nFunctions are self-contained blocks of code that perform a specific task. They make code modular and reusable.\n\n### Why we use it?\nInstead of writing the same logic 10 times, you write it once in a function and "call" it whenever needed. This is the heart of clean coding.',
          syntax: 'return_type name(parameters) { ... }',
          quizQuestions: [
            { id: 1, text: "What is a function return type for no value?", options: ["int", "null", "void", "empty"], correctAnswer: 2 },
            { id: 2, text: "Which keyword sends a value back?", options: ["send", "back", "return", "output"], correctAnswer: 2 },
            { id: 3, text: "Function declaration is also called:", options: ["Prototype", "Skeleton", "Header", "Instance"], correctAnswer: 0 },
            { id: 4, text: "main() is also a:", options: ["Variable", "Function", "Header", "Constant"], correctAnswer: 1 },
            { id: 5, text: "Variables defined inside a function are:", options: ["Global", "Static", "Local", "Private"], correctAnswer: 2 }
          ],
          practiceProblems: [
            { problem: "Create a function 'greet' that prints 'Hello!'.", solution: "void greet() { printf(\"Hello!\"); }" },
            { problem: "Write a function to add two integers.", solution: "int add(int a, int b) { return a + b; }" },
            { problem: "Write a function to check if a number is even.", solution: "int isEven(int n) { return n % 2 == 0; }" },
            { problem: "Create a function that returns the square of a number.", solution: "int sq(int n) { return n * n; }" },
            { problem: "Write a function that swaps two numbers (hint: use a third variable).", solution: "void swap(int *a, int *b) { ... }" }
          ]
        },
        { 
          id: 'c11', 
          title: '11. Passing Arguments', 
          topics: ['Pass by value', 'pass by reference'], 
          duration: '12 mins', 
          content: '### What is it?\nArguments are the data you send into a function. Pass-by-value sends a copy, while Pass-by-reference sends the actual memory address (pointer).\n\n### Why we use it?\nPassing arguments allows functions to be dynamic—they can process different data every time they are called.',
          syntax: 'myFunc(10, 20); // passing values',
          quizQuestions: [
            { id: 1, text: "By default, C passes parameters by:", options: ["Value", "Reference", "Pointer", "Name"], correctAnswer: 0 },
            { id: 2, text: "To pass by reference, we use:", options: ["Arrays", "Pointers", "Structs", "Enums"], correctAnswer: 1 },
            { id: 3, text: "In pass-by-value, original variable is:", options: ["Modified", "Deleted", "Unchanged", "Duplicated"], correctAnswer: 2 },
            { id: 4, text: "Arguments in function definition are:", options: ["Actual parameters", "Formal parameters", "Global parameters", "Fake parameters"], correctAnswer: 1 },
            { id: 5, text: "Function call uses:", options: ["Actual parameters", "Formal parameters", "Static parameters", "Local parameters"], correctAnswer: 0 }
          ],
          practiceProblems: [
            { problem: "Pass a float to a function that converts it to an int.", solution: "int conv(float f) { return (int)f; }" },
            { problem: "Write a function that takes radius and returns area.", solution: "float area(float r) { return 3.14 * r * r; }" },
            { problem: "Pass an array to a function to print it.", solution: "void pr(int arr[], int n) { ... }" },
            { problem: "Demonstrate pass-by-value with an increment function.", solution: "void inc(int x) { x++; } // Original won't change" },
            { problem: "Pass two strings to compare them (logic only).", solution: "void comp(char s1[], char s2[])" }
          ]
        },
        { 
          id: 'c12', 
          title: '12. Recursion', 
          topics: ['Recursive Functions', 'Base Case', 'Factorial/Fibonacci'], 
          duration: '20 mins', 
          content: '### What is it?\nRecursion is when a function calls itself. It must have a "Base Case" to stop, or it will run forever (Stack Overflow).\n\n### Why we use it?\nTo solve problems that have a repetitive structure, like tree traversal, factorials, or the Fibonacci sequence.',
          syntax: 'void rec() { if(base) return; rec(); }',
          quizQuestions: [
            { id: 1, text: "What is recursion?", options: ["Function calling main", "Function calling itself", "A nested loop", "A pointer"], correctAnswer: 1 },
            { id: 2, text: "Condition that stops recursion is:", options: ["Exit Case", "Stop Case", "Base Case", "Null Case"], correctAnswer: 2 },
            { id: 3, text: "Failure to stop recursion causes:", options: ["Buffer overflow", "Stack overflow", "Memory leak", "Logic error"], correctAnswer: 1 },
            { id: 4, text: "Classic example of recursion:", options: ["Adding two numbers", "Printing a string", "Factorial", "Using scanf"], correctAnswer: 2 },
            { id: 5, text: "Recursion is usually replaced by:", options: ["Conditionals", "Iteration (Loops)", "Global variables", "Arrays"], correctAnswer: 1 }
          ],
          practiceProblems: [
            { problem: "Calculate factorial of N using recursion.", solution: "int fact(int n) { if(n<=1) return 1; return n*fact(n-1); }" },
            { problem: "Find the Nth Fibonacci number using recursion.", solution: "int fib(int n) { if(n<=1) return n; return fib(n-1)+fib(n-2); }" },
            { problem: "Calculate the sum of digits recursively.", solution: "int sum(int n) { if(n==0) return 0; return n%10+sum(n/10); }" },
            { problem: "Print numbers from N down to 1 recursively.", solution: "void pr(int n) { if(n==0) return; printf(\"%d\",n); pr(n-1); }" },
            { problem: "Check if a string is a palindrome recursively.", solution: "Logic: compare first and last, then recurse inner" }
          ]
        }
      ]
    },
    {
      id: 'cas1',
      title: 'Phase 4: Arrays & Strings',
      lessons: [
        { 
          id: 'c13', 
          title: '13. Arrays in C', 
          topics: ['1D Arrays', '2D Arrays', 'Initialization', 'Traversal'], 
          duration: '15 mins', 
          content: '### What is it?\nAn array is a collection of elements of the same type stored in contiguous memory locations. Indexing starts at 0.\n\n### Why we use it?\nTo store multiple related items (like scores of 50 students) without creating 50 separate variables.',
          syntax: 'type name[size];',
          quizQuestions: [
            { id: 1, text: "Array indexing starts at:", options: ["1", "0", "-1", "Custom"], correctAnswer: 1 },
            { id: 2, text: "Memory allocation in arrays is:", options: ["Random", "Scattered", "Contiguous", "Dynamic"], correctAnswer: 2 },
            { id: 3, text: "Last index of an array of size 10?", options: ["10", "11", "9", "0"], correctAnswer: 2 },
            { id: 4, text: "Can an array store different data types?", options: ["Yes", "No", "Only if static", "Only char and int"], correctAnswer: 1 },
            { id: 5, text: "Correct declaration of an integer array?", options: ["int arr[];", "int arr[5];", "array int[5];", "int[5] arr;"], correctAnswer: 1 }
          ],
          practiceProblems: [
            { problem: "Initialize an array with 5 numbers and print them.", solution: "int arr[]={1,2,3,4,5}; for(i=0;i<5;i++)printf(\"%d\",arr[i]);" },
            { problem: "Find the sum of all elements in an array.", solution: "for(i=0;i<n;i++) sum += arr[i];" },
            { problem: "Find the largest number in an array.", solution: "max = arr[0]; if(arr[i] > max) max = arr[i];" },
            { problem: "Reverse an array without using a second array.", solution: "Swap first and last, second and second-last..." },
            { problem: "Count how many even numbers are in an array.", solution: "if(arr[i] % 2 == 0) count++;" }
          ]
        },
        { 
          id: 'c14', 
          title: '14. Strings in C', 
          topics: ['Declaration', 'scanf vs fgets', 'String functions'], 
          duration: '15 mins', 
          content: '### What is it?\nA string is an array of characters ending with a null terminator (\\0). C doesn\'t have a built-in "string" type like Java; it uses character arrays.\n\n### Why we use it?\nTo handle text data like names, messages, and filenames.',
          syntax: 'char name[] = "GenSpark";',
          quizQuestions: [
            { id: 1, text: "String terminator character is:", options: ["\\n", "\\0", "\\t", "\\s"], correctAnswer: 1 },
            { id: 2, text: "Header for string functions?", options: ["stdio.h", "text.h", "string.h", "stdlib.h"], correctAnswer: 2 },
            { id: 3, text: "Function to find string length?", options: ["len()", "size()", "strlen()", "length()"], correctAnswer: 2 },
            { id: 4, text: "Difference between scanf and fgets?", options: ["fgets is faster", "scanf skips spaces", "fgets is for ints", "None"], correctAnswer: 1 },
            { id: 5, text: "Function to join two strings?", options: ["strcat()", "strjoin()", "strcpy()", "strcmp()"], correctAnswer: 0 }
          ],
          practiceProblems: [
            { problem: "Input a name and print its length.", solution: "scanf(\"%s\", s); printf(\"%d\", strlen(s));" },
            { problem: "Copy one string to another using strcpy.", solution: "strcpy(dest, src);" },
            { problem: "Compare two strings using strcmp.", solution: "if(strcmp(s1, s2) == 0)" },
            { problem: "Reverse a string manually.", solution: "Use a loop to swap characters" },
            { problem: "Count vowels in a given string.", solution: "if(c=='a'||c=='e'||...)" }
          ]
        },
        { 
          id: 'c15', 
          title: '15. Multidimensional Arrays', 
          topics: ['2D Arrays', '3D Arrays', 'Applications'], 
          duration: '15 mins', 
          content: '### What is it?\nArrays of arrays. A 2D array represents a grid (rows and columns). A 3D array represents a cube of data.\n\n### Why we use it?\nTo store matrices, game maps (like Chess), and spreadsheet-like data.',
          syntax: 'type name[rows][cols];',
          quizQuestions: [
            { id: 1, text: "A 2D array represents a:", options: ["Line", "Circle", "Grid/Matrix", "Cube"], correctAnswer: 2 },
            { id: 2, text: "int a[2][3] has how many total elements?", options: ["2", "3", "5", "6"], correctAnswer: 3 },
            { id: 3, text: "Index for the first element in 2D array?", options: ["[1][1]", "[0][0]", "[0][1]", "[1][0]"], correctAnswer: 1 },
            { id: 4, text: "How to access row 1, column 2?", options: ["a[1,2]", "a(1,2)", "a[1][2]", "a[2][1]"], correctAnswer: 2 },
            { id: 5, text: "Outer loop in 2D traversal usually handles:", options: ["Columns", "Rows", "Diagonals", "Values"], correctAnswer: 1 }
          ],
          practiceProblems: [
            { problem: "Initialize a 3x3 matrix and print it.", solution: "Use nested loops for i and j" },
            { problem: "Calculate the sum of all elements in a 2D array.", solution: "sum += a[i][j];" },
            { problem: "Perform matrix addition.", solution: "C[i][j] = A[i][j] + B[i][j];" },
            { problem: "Print the diagonal elements of a 3x3 matrix.", solution: "if(i == j) printf(...);" },
            { problem: "Transpose a matrix (swap rows and columns).", solution: "T[j][i] = A[i][j];" }
          ]
        }
      ]
    },
    {
      id: 'cpm1',
      title: 'Phase 5: Pointer Mastery',
      lessons: [
        { 
          id: 'c16', 
          title: '16. Introduction to Pointers', 
          topics: ['Declaration', 'Address-of', 'Value-of', 'Basics'], 
          duration: '20 mins', 
          content: '### What is it?\nA pointer is a variable that stores the memory address of another variable. The & operator gets the address, and * (dereference) gets the value at that address.\n\n### Why we use it?\nPointers allow direct memory manipulation, efficient array handling, and the ability to return multiple values from functions.',
          syntax: 'int *ptr = &var;',
          quizQuestions: [
            { id: 1, text: "What does a pointer store?", options: ["Value", "Address", "Function", "Variable name"], correctAnswer: 1 },
            { id: 2, text: "Which operator is used for 'address of'?", options: ["*", "$", "&", "@"], correctAnswer: 2 },
            { id: 3, text: "Dereference operator symbol?", options: ["&", "*", "->", "."], correctAnswer: 1 },
            { id: 4, text: "Pointer to an integer is declared as:", options: ["int ptr;", "int *ptr;", "ptr int;", "void *ptr;"], correctAnswer: 1 },
            { id: 5, text: "The size of a pointer depends on:", options: ["Data type", "The OS architecture", "The CPU speed", "The RAM size"], correctAnswer: 1 }
          ],
          practiceProblems: [
            { problem: "Print the memory address of an integer variable.", solution: "printf(\"%p\", &var);" },
            { problem: "Use a pointer to change the value of an integer.", solution: "*ptr = 20;" },
            { problem: "Declare a pointer to a character.", solution: "char *p = &c;" },
            { problem: "Demonstrate a NULL pointer initialization.", solution: "int *p = NULL;" },
            { problem: "Print the address of a pointer itself.", solution: "printf(\"%p\", &p);" }
          ]
        },
        { id: 'c17', title: '17. Pointer Arithmetic', topics: ['Inc/Dec', 'Pointer + int', 'Pointer difference'], duration: '12 mins', content: 'Manual memory navigation.', quizQuestions: [], practiceProblems: [] },
        { id: 'c18', title: '18. Pointers & Arrays', topics: ['Array name as pointer', 'Accessing via pointers'], duration: '15 mins', content: 'Deep link between addresses and arrays.', quizQuestions: [], practiceProblems: [] },
        { id: 'c19', title: '19. Pointers to Pointers', topics: ['Double pointers', 'Use cases'], duration: '12 mins', content: 'Managing addresses of addresses.', quizQuestions: [], practiceProblems: [] },
        { id: 'c20', title: '20. Pointers and Functions', topics: ['Pointer as parameter', 'Returning pointer'], duration: '15 mins', content: 'Advanced manipulation.', quizQuestions: [], practiceProblems: [] }
      ]
    },
    {
      id: 'csm1',
      title: 'Phase 6: Structures & Unions',
      lessons: [
        { id: 'c21', title: '21. Structures in C', topics: ['Declaring structures', 'Accessing members', 'Nested structures', 'Array of structs'], duration: '18 mins', content: 'Create your own data types.', quizQuestions: [], practiceProblems: [] },
        { id: 'c22', title: '22. Unions', topics: ['Declaring union', 'Difference from struct'], duration: '10 mins', content: 'Memory sharing.', quizQuestions: [], practiceProblems: [] },
        { id: 'c23', title: '23. Dynamic Memory Allocation', topics: ['malloc()', 'calloc()', 'realloc()', 'free()'], duration: '20 mins', content: 'Managing heap memory.', quizQuestions: [], practiceProblems: [] },
        { id: 'c24', title: '24. Memory Leaks & Best Practices', topics: ['What is a leak?', 'Avoiding leaks', 'Debug tools'], duration: '15 mins', content: 'Safe software.', quizQuestions: [], practiceProblems: [] }
      ]
    },
    {
      id: 'cfa1',
      title: 'Phase 7: File Handling & Advanced',
      lessons: [
        { id: 'c25', title: '25. File I/O', topics: ['fopen()', 'fprintf()', 'fscanf()', 'fclose()'], duration: '15 mins', content: 'Persistent data.', quizQuestions: [], practiceProblems: [] },
        { id: 'c26', title: '26. File Modes', topics: ['Read (r)', 'Write (w)', 'Append (a)', 'Binary modes'], duration: '10 mins', content: 'File rights.', quizQuestions: [], practiceProblems: [] },
        { id: 'c27', title: '27. Random Access Files', topics: ['fseek', 'ftell', 'rewind'], duration: '12 mins', content: 'Navigating files.', quizQuestions: [], practiceProblems: [] },
        { id: 'c28', title: '28. Command Line Arguments', topics: ['argc, argv', 'CLI interaction'], duration: '15 mins', content: 'Terminal inputs.', quizQuestions: [], practiceProblems: [] },
        { id: 'c29', title: '29. Preprocessor Directives', topics: ['#define', '#include', 'Conditional compilation'], duration: '12 mins', content: 'The build process.', quizQuestions: [], practiceProblems: [] },
        { id: 'c30', title: '30. Typedef & Enums', topics: ['Using typedef', 'enum types'], duration: '10 mins', content: 'Readable code.', quizQuestions: [], practiceProblems: [] },
        { id: 'c31', title: '31. Bitwise Operators', topics: ['AND, OR, XOR', 'left/right shift'], duration: '15 mins', content: 'Bit manipulation.', quizQuestions: [], practiceProblems: [] }
      ]
    },
    {
      id: 'cds1',
      title: 'Phase 8: Data Structures & Interview Prep',
      lessons: [
        { id: 'c32', title: '32. Linked Lists', topics: ['Singly Linked List', 'Insertion/Deletion', 'Traversal'], duration: '25 mins', content: 'Dynamic lists.', quizQuestions: [], practiceProblems: [] },
        { id: 'c33', title: '33. Stacks (Array & Linked)', topics: ['LIFO concept', 'Push/Pop'], duration: '18 mins', content: 'Last-In, First-Out.', quizQuestions: [], practiceProblems: [] },
        { id: 'c34', title: '34. Queues', topics: ['FIFO', 'Circular queue'], duration: '18 mins', content: 'First-In, First-Out.', quizQuestions: [], practiceProblems: [] },
        { id: 'c35', title: '35. Trees (Basic Introduction)', topics: ['Binary Tree', 'Theory'], duration: '20 mins', content: 'Hierarchical data.', quizQuestions: [], practiceProblems: [] },
        { id: 'c36', title: '36. Debugging C Programs', topics: ['Errors', 'gdb', 'printf'], duration: '15 mins', content: 'Fixing bugs.', quizQuestions: [], practiceProblems: [] },
        { id: 'c37', title: '37. Modular Programming', topics: ['Header files', 'Separate compilation'], duration: '15 mins', content: 'Organization.', quizQuestions: [], practiceProblems: [] },
        { id: 'c38', title: '38. Makefiles', topics: ['Creating', 'Using make'], duration: '12 mins', content: 'Automation.', quizQuestions: [], practiceProblems: [] },
        { id: 'c39', title: '39. Complex Programs', topics: ['Sorting', 'Searching'], duration: '25 mins', content: 'Algorithms.', quizQuestions: [], practiceProblems: [] },
        { id: 'c40', title: '40. C Interview Questions', topics: ['Output predictions', 'Memory', 'DSA'], duration: '30 mins', content: 'Ready for the big day.', quizQuestions: [], practiceProblems: [] }
      ]
    }
  ],
  'java': [], 
  'python': [],
};

export const CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    xp: 50,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    inputFormat: 'nums = [2,7,11,15], target = 9',
    outputFormat: '[0, 1]',
    constraints: '2 <= nums.length <= 10^4'
  }
];
