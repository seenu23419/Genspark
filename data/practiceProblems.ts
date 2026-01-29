
export interface TestCase {
    stdin?: string;
    expected_output: string;
}

export interface PracticeProblem {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    hint: string;
    solution: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    concept?: string;
    test_cases?: TestCase[];
    language?: string;
    inputFormat?: string;
    outputFormat?: string;
    sampleInput?: string;
    sampleOutput?: string;
    explanation?: string;
    estimatedTime?: number; // in minutes
    commonMistake?: string; // typical beginner error
    relatedLesson?: string; // e.g., "C Input/Output → printf()"
}

export interface PracticeTopic {
    id: string;
    title: string;
    problems: PracticeProblem[];
}

export const PRACTICE_TOPICS: PracticeTopic[] = [
    {
        id: 'introduction',
        title: 'Introduction & Basics',
        problems: [
            {
                id: 'intro-1',
                title: 'Hello World',
                description: 'Write a program to display Hello World.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}',
                hint: 'Use the printf() function to display text.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Basic Output',
                language: 'C',
                test_cases: [
                    { expected_output: 'Hello World' }
                ],
                estimatedTime: 1,
                relatedLesson: 'Introduction → printf()',
                commonMistake: 'Forgetting to include <stdio.h> or missing the return 0; statement'
            },
            {
                id: 'intro-2',
                title: 'Basic Program Structure',
                description: 'Write a program showing the basic structure of a program.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Add a statement here\n    return 0;\n}',
                hint: 'Add a printf() statement to demonstrate program structure.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("Program executed successfully");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Program Structure',
                language: 'C',
                test_cases: [
                    { expected_output: 'Program executed successfully' }
                ],
                estimatedTime: 1,
                relatedLesson: 'Introduction → Program Structure',
                commonMistake: 'Missing the main() function or misunderstanding the return statement'
            },
            {
                id: 'intro-3',
                title: 'Comments in C',
                description: 'Write a program with both single-line and multi-line comments.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Add your comments and code here\n    return 0;\n}',
                hint: 'Use // for single-line and /* */ for multi-line comments.',
                solution: '#include <stdio.h>\n\nint main() {\n    // This is a single-line comment\n    /* This is a\n       multi-line comment */\n    printf("Comments help explain code");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Comments',
                language: 'C',
                test_cases: [
                    { expected_output: 'Comments help explain code' }
                ],
                estimatedTime: 2,
                relatedLesson: 'Introduction → Code Comments',
                commonMistake: 'Nesting /* */ comments or using wrong comment syntax'
            },
            {
                id: 'intro-4',
                title: 'Print Multiple Lines',
                description: 'Write a program that prints three lines: "GenSpark", "Coding", "Platform"',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Print three lines here\n    return 0;\n}',
                hint: 'Use printf() with \\n for new lines.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("GenSpark\\n");\n    printf("Coding\\n");\n    printf("Platform\\n");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Output Formatting',
                language: 'C',
                test_cases: [
                    { expected_output: 'GenSpark\nCoding\nPlatform\n' }
                ],
                estimatedTime: 2,
                relatedLesson: 'Introduction → Output Formatting',
                commonMistake: 'Forgetting escape sequences like \\n'
            },
            {
                id: 'intro-5',
                title: 'Print with Spacing',
                description: 'Print "Hello   World" with multiple spaces in between.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}',
                hint: 'Add spaces directly in the printf string.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("Hello   World");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Basic Output',
                language: 'C',
                test_cases: [
                    { expected_output: 'Hello   World' }
                ],
                estimatedTime: 1,
                relatedLesson: 'Introduction → String Output',
                commonMistake: 'Not preserving the exact spacing'
            }
        ]
    },
    {
        id: 'flow',
        title: 'Flow Control (if-else, loops)',
        problems: [
            {
                id: 'p3',
                title: 'Even or Odd',
                description: 'Write a program that checks if a number x=7 is even or odd.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int x = 7;\n    // Use if-else to print "Even" or "Odd"\n    return 0;\n}',
                hint: 'Use the modulus operator: x % 2 == 0',
                solution: '#include <stdio.h>\n\nint main() {\n    int x = 7;\n    if (x % 2 == 0) printf("Even");\n    else printf("Odd");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'if-else',
                language: 'C',
                test_cases: [
                    { expected_output: 'Odd' }
                ],
                estimatedTime: 2,
                relatedLesson: 'Flow Control → if-else statements',
                commonMistake: 'Using = instead of == in the condition, or forgetting the modulus operator'
            },
            {
                id: 'p3-2',
                title: 'Max of Two Numbers',
                description: 'Find the maximum of two numbers: a=15, b=8',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int a = 15, b = 8;\n    // Find and print the maximum\n    return 0;\n}',
                hint: 'Use if-else to compare a and b.',
                solution: '#include <stdio.h>\n\nint main() {\n    int a = 15, b = 8;\n    if (a > b) printf("%d", a);\n    else printf("%d", b);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Conditional Logic',
                language: 'C',
                test_cases: [
                    { expected_output: '15' }
                ],
                estimatedTime: 2,
                relatedLesson: 'Flow Control → Comparison Operators',
                commonMistake: 'Swapping the comparison or incorrect printf format'
            },
            {
                id: 'p3-3',
                title: 'Simple Calculator',
                description: 'Perform addition of two numbers: 20 + 15',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int a = 20, b = 15;\n    // Add and print the result\n    return 0;\n}',
                hint: 'Use printf to display the sum of a and b.',
                solution: '#include <stdio.h>\n\nint main() {\n    int a = 20, b = 15;\n    printf("%d", a + b);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Arithmetic',
                language: 'C',
                test_cases: [
                    { expected_output: '35' }
                ],
                estimatedTime: 1,
                relatedLesson: 'Flow Control → Arithmetic Operations',
                commonMistake: 'Wrong operator or format specifier'
            },
            {
                id: 'p3-4',
                title: 'Loop: Count 1 to 5',
                description: 'Print numbers from 1 to 5 using a loop.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Write a loop to print 1 to 5\n    return 0;\n}',
                hint: 'Use for(int i=1; i<=5; i++) printf("%d\\n", i);',
                solution: '#include <stdio.h>\n\nint main() {\n    for(int i=1; i<=5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Loops',
                language: 'C',
                test_cases: [
                    { expected_output: '1\n2\n3\n4\n5\n' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Flow Control → for loops',
                commonMistake: 'Off-by-one errors or wrong loop condition'
            },
            {
                id: 'p3-5',
                title: 'Sum of First N Numbers',
                description: 'Calculate sum of first 10 numbers (1+2+3+...+10)',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int sum = 0;\n    // Loop from 1 to 10 and add to sum\n    return 0;\n}',
                hint: 'Use a for loop to add numbers.',
                solution: '#include <stdio.h>\n\nint main() {\n    int sum = 0;\n    for(int i=1; i<=10; i++) {\n        sum += i;\n    }\n    printf("%d", sum);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Loops',
                language: 'C',
                test_cases: [
                    { expected_output: '55' }
                ],
                estimatedTime: 4,
                relatedLesson: 'Flow Control → Loop Accumulation',
                commonMistake: 'Not initializing sum to 0 or wrong loop range'
            },
            {
                id: 'p3-6',
                title: 'Factorial Calculation',
                description: 'Calculate factorial of 5 (5! = 5×4×3×2×1)',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n = 5, fact = 1;\n    // Calculate factorial\n    return 0;\n}',
                hint: 'Multiply n by (n-1) by (n-2)... down to 1.',
                solution: '#include <stdio.h>\n\nint main() {\n    int n = 5, fact = 1;\n    for(int i=1; i<=n; i++) {\n        fact *= i;\n    }\n    printf("%d", fact);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Loops',
                language: 'C',
                test_cases: [
                    { expected_output: '120' }
                ],
                estimatedTime: 4,
                relatedLesson: 'Flow Control → Loop Multiplication',
                commonMistake: 'Not initializing fact to 1 or starting loop from 0'
            },
            {
                id: 'p3-7',
                title: 'Check Prime Number',
                description: 'Check if 13 is a prime number.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n = 13;\n    int isPrime = 1;\n    // Check if n is prime\n    return 0;\n}',
                hint: 'Check if any number divides n perfectly from 2 to n/2.',
                solution: '#include <stdio.h>\n\nint main() {\n    int n = 13;\n    int isPrime = 1;\n    for(int i=2; i<=n/2; i++) {\n        if(n % i == 0) {\n            isPrime = 0;\n            break;\n        }\n    }\n    printf("%s", isPrime ? "Prime" : "Not Prime");\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Loops + Logic',
                language: 'C',
                test_cases: [
                    { expected_output: 'Prime' }
                ],
                estimatedTime: 5,
                relatedLesson: 'Flow Control → Break Statement',
                commonMistake: 'Starting from wrong number or forgetting the break statement'
            }
        ]
    },
    {
        id: 'functions',
        title: 'Functions & Modular Programming',
        problems: [
            {
                id: 'p4',
                title: 'Square Function',
                description: 'Write a function "square" that returns the square of an integer.',
                initialCode: '#include <stdio.h>\n\n// Write square function here\n\nint main() {\n    printf("%d", square(5));\n    return 0;\n}',
                hint: 'The function signature should be: int square(int n)',
                solution: '#include <stdio.h>\n\nint square(int n) { return n * n; }\n\nint main() {\n    printf("%d", square(5));\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Functions',
                test_cases: [
                    { expected_output: '25' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Functions → Function Definition & Calling',
                commonMistake: 'Forgetting the return type or passing wrong number of arguments'
            },
            {
                id: 'p4-2',
                title: 'Add Two Numbers Function',
                description: 'Create a function "add" that adds two numbers: add(10, 20)',
                initialCode: '#include <stdio.h>\n\n// Write add function here\n\nint main() {\n    printf("%d", add(10, 20));\n    return 0;\n}',
                hint: 'Function should take two int parameters and return their sum.',
                solution: '#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\n\nint main() {\n    printf("%d", add(10, 20));\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Functions',
                test_cases: [
                    { expected_output: '30' }
                ],
                estimatedTime: 2,
                relatedLesson: 'Functions → Parameters & Return',
                commonMistake: 'Forgetting parameter types or return type'
            },
            {
                id: 'p4-3',
                title: 'Multiply Function',
                description: 'Create a function that multiplies three numbers: 5, 6, 3',
                initialCode: '#include <stdio.h>\n\n// Write multiply function here\n\nint main() {\n    printf("%d", multiply(5, 6, 3));\n    return 0;\n}',
                hint: 'Function should accept three int parameters.',
                solution: '#include <stdio.h>\n\nint multiply(int a, int b, int c) { return a * b * c; }\n\nint main() {\n    printf("%d", multiply(5, 6, 3));\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Functions',
                test_cases: [
                    { expected_output: '90' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Functions → Multiple Parameters',
                commonMistake: 'Forgetting commas between parameters'
            },
            {
                id: 'p4-4',
                title: 'Power Function',
                description: 'Write a function to calculate power: 2^5 (2 raised to power 5)',
                initialCode: '#include <stdio.h>\n\n// Write power function here\n\nint main() {\n    printf("%d", power(2, 5));\n    return 0;\n}',
                hint: 'Use a loop to multiply base by itself power times.',
                solution: '#include <stdio.h>\n\nint power(int base, int exp) {\n    int result = 1;\n    for(int i=0; i<exp; i++) result *= base;\n    return result;\n}\n\nint main() {\n    printf("%d", power(2, 5));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Functions + Loops',
                test_cases: [
                    { expected_output: '32' }
                ],
                estimatedTime: 5,
                relatedLesson: 'Functions → Loop Inside Functions',
                commonMistake: 'Incorrectly implementing the power calculation'
            }
        ]
    },
    {
        id: 'arrays',
        title: 'Arrays & Collections',
        problems: [
            {
                id: 'p5',
                title: 'Array Sum',
                description: 'Calculate the sum of all elements in the array {1, 2, 3, 4, 5}.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int sum = 0;\n    // Loop and add to sum\n    return 0;\n}',
                hint: 'Use a for loop: for(int i=0; i<5; i++) sum += arr[i];',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for(int i=0; i<5; i++) sum += arr[i];\n    printf("%d", sum);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays + Loops',
                test_cases: [
                    { expected_output: '15' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Arrays → Array Iteration',
                commonMistake: 'Off-by-one error in loop or forgetting to initialize sum to 0'
            },
            {
                id: 'p5-2',
                title: 'Find Maximum in Array',
                description: 'Find the maximum element in array {5, 2, 8, 1, 9, 3}',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {5, 2, 8, 1, 9, 3};\n    int max = arr[0];\n    // Find maximum element\n    return 0;\n}',
                hint: 'Compare each element with max and update if greater.',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {5, 2, 8, 1, 9, 3};\n    int max = arr[0];\n    for(int i=1; i<6; i++) {\n        if(arr[i] > max) max = arr[i];\n    }\n    printf("%d", max);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays + Comparison',
                test_cases: [
                    { expected_output: '9' }
                ],
                estimatedTime: 4,
                relatedLesson: 'Arrays → Finding Elements',
                commonMistake: 'Starting loop from 0 instead of 1 or wrong comparison'
            },
            {
                id: 'p5-3',
                title: 'Find Minimum in Array',
                description: 'Find the minimum element in array {15, 7, 12, 3, 9}',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {15, 7, 12, 3, 9};\n    int min = arr[0];\n    // Find minimum element\n    return 0;\n}',
                hint: 'Similar to maximum but use < instead of >.',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {15, 7, 12, 3, 9};\n    int min = arr[0];\n    for(int i=1; i<5; i++) {\n        if(arr[i] < min) min = arr[i];\n    }\n    printf("%d", min);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays',
                test_cases: [
                    { expected_output: '3' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Arrays → Finding Elements',
                commonMistake: 'Using wrong comparison operator'
            },
            {
                id: 'p5-4',
                title: 'Array Reverse',
                description: 'Reverse the array {1, 2, 3, 4, 5} and print it.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    // Reverse and print array\n    return 0;\n}',
                hint: 'Print from last index to first: for(int i=4; i>=0; i--)',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    for(int i=4; i>=0; i--) {\n        printf("%d ", arr[i]);\n    }\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays',
                test_cases: [
                    { expected_output: '5 4 3 2 1 ' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Arrays → Reverse Iteration',
                commonMistake: 'Wrong loop condition or not printing correctly'
            },
            {
                id: 'p5-5',
                title: 'Count Even Numbers',
                description: 'Count even numbers in array {2, 5, 8, 3, 10, 7}',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {2, 5, 8, 3, 10, 7};\n    int count = 0;\n    // Count even numbers\n    return 0;\n}',
                hint: 'Use arr[i] % 2 == 0 to check if even.',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {2, 5, 8, 3, 10, 7};\n    int count = 0;\n    for(int i=0; i<6; i++) {\n        if(arr[i] % 2 == 0) count++;\n    }\n    printf("%d", count);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Arrays + Logic',
                test_cases: [
                    { expected_output: '3' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Arrays → Conditional Counting',
                commonMistake: 'Not initializing count or wrong modulus check'
            }
        ]
    },
    {
        id: 'pointers',
        title: 'Pointers & Memory Management',
        problems: [
            {
                id: 'p6',
                title: 'Swap Values',
                description: 'Swap the values of two variables using pointers.',
                initialCode: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // Write swap logic here\n}\n\nint main() {\n    int x = 10, y = 20;\n    swap(&x, &y);\n    printf("x=%d, y=%d", x, y);\n    return 0;\n}',
                hint: 'Use a temporary variable: int temp = *a; *a = *b; *b = temp;',
                solution: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 10, y = 20;\n    swap(&x, &y);\n    printf("x=%d, y=%d", x, y);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Pointers',
                test_cases: [
                    { expected_output: 'x=20, y=10' }
                ],
                estimatedTime: 4,
                relatedLesson: 'Pointers → Pointer Dereferencing',
                commonMistake: 'Forgetting the * operator for dereferencing or passing values instead of addresses'
            },
            {
                id: 'p6-2',
                title: 'Pointer to Variable',
                description: 'Create a pointer to an integer and print its value.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int num = 25;\n    int *ptr = &num;  // Pointer to num\n    // Print the value using pointer\n    return 0;\n}',
                hint: 'Use *ptr to dereference the pointer.',
                solution: '#include <stdio.h>\n\nint main() {\n    int num = 25;\n    int *ptr = &num;\n    printf("%d", *ptr);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Pointers',
                test_cases: [
                    { expected_output: '25' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Pointers → Pointer Basics',
                commonMistake: 'Mixing & and * operators or wrong assignment'
            },
            {
                id: 'p6-3',
                title: 'Address of Variable',
                description: 'Print the address of a variable x = 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int x = 100;\n    // Print the address of x\n    return 0;\n}',
                hint: 'Use %p format specifier and & operator.',
                solution: '#include <stdio.h>\n\nint main() {\n    int x = 100;\n    printf("%p", (void*)&x);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Pointers',
                test_cases: [
                    { expected_output: 'depends on system' }
                ],
                estimatedTime: 2,
                relatedLesson: 'Pointers → Address-of Operator',
                commonMistake: 'Using wrong format specifier or not casting to void*'
            }
        ]
    },
    {
        id: 'strings',
        title: 'Strings & String Operations',
        problems: [
            {
                id: 'p7',
                title: 'String Length',
                description: 'Write a manual function to find the length of a string (don\'t use strlen).',
                initialCode: '#include <stdio.h>\n\nint myLen(char *s) {\n    // Loop until null terminator\n    return 0;\n}\n\nint main() {\n    printf("%d", myLen("GenSpark"));\n    return 0;\n}',
                hint: 'While s[i] is not \'\\0\', increment i.',
                solution: '#include <stdio.h>\n\nint myLen(char *s) {\n    int i = 0;\n    while(s[i] != \'\\0\') i++;\n    return i;\n}\n\nint main() {\n    printf("%d", myLen("GenSpark"));\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Strings + Loops',
                test_cases: [
                    { expected_output: '8' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Strings → String Termination',
                commonMistake: 'Missing the null terminator check or incrementing the wrong variable'
            },
            {
                id: 'p7-2',
                title: 'Reverse a String',
                description: 'Reverse the string "Hello" using a loop.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    char str[] = "Hello";\n    // Reverse and print the string\n    return 0;\n}',
                hint: 'Use a loop starting from the end of the string.',
                solution: '#include <stdio.h>\n\nint main() {\n    char str[] = "Hello";\n    int i = 0;\n    while(str[i] != \'\\0\') i++;\n    for(i=i-1; i>=0; i--) printf("%c", str[i]);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Strings',
                test_cases: [
                    { expected_output: 'olleH' }
                ],
                estimatedTime: 4,
                relatedLesson: 'Strings → String Manipulation',
                commonMistake: 'Not finding string length correctly or wrong loop direction'
            },
            {
                id: 'p7-3',
                title: 'Count Vowels in String',
                description: 'Count vowels in the string "Programming"',
                initialCode: '#include <stdio.h>\n\nint main() {\n    char str[] = "Programming";\n    int vowels = 0;\n    // Count vowels (a, e, i, o, u)\n    return 0;\n}',
                hint: 'Check if each character is a vowel using if conditions.',
                solution: '#include <stdio.h>\n\nint main() {\n    char str[] = "Programming";\n    int vowels = 0;\n    for(int i=0; str[i]!= \'\\0\'; i++) {\n        char c = str[i];\n        if(c==\'a\' || c==\'e\' || c==\'i\' || c==\'o\' || c==\'u\' || c==\'A\' || c==\'E\' || c==\'I\' || c==\'O\' || c==\'U\') vowels++;\n    }\n    printf("%d", vowels);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Strings + Logic',
                test_cases: [
                    { expected_output: '3' }
                ],
                estimatedTime: 5,
                relatedLesson: 'Strings → String Analysis',
                commonMistake: 'Not checking both uppercase and lowercase or missing vowels'
            },
            {
                id: 'p7-4',
                title: 'String Concatenation',
                description: 'Concatenate two strings "Hello " and "World"',
                initialCode: '#include <stdio.h>\n\nint main() {\n    char str1[] = "Hello ";\n    char str2[] = "World";\n    // Concatenate and print\n    return 0;\n}',
                hint: 'Print both strings one after another.',
                solution: '#include <stdio.h>\n\nint main() {\n    char str1[] = "Hello ";\n    char str2[] = "World";\n    printf("%s%s", str1, str2);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Strings',
                test_cases: [
                    { expected_output: 'Hello World' }
                ],
                estimatedTime: 2,
                relatedLesson: 'Strings → String Output',
                commonMistake: 'Using %s wrong or not including space'
            }
        ]
    },
    {
        id: 'structs',
        title: 'Structures & Complex Data Types',
        problems: [
            {
                id: 'p8',
                title: 'Point Struct',
                description: 'Define a struct "Point" with x and y coordinates. Initialize p1(10, 20) and print it.',
                initialCode: '#include <stdio.h>\n\n// Define struct here\n\nint main() {\n    // Initialize and print\n    return 0;\n}',
                hint: 'struct Point { int x; int y; };',
                solution: '#include <stdio.h>\n\nstruct Point { int x; int y; };\n\nint main() {\n    struct Point p1 = {10, 20};\n    printf("(%d, %d)", p1.x, p1.y);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Structures',
                test_cases: [
                    { expected_output: '(10, 20)' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Structures → Struct Definition & Access',
                commonMistake: 'Using wrong syntax for struct member access or forgetting the semicolon after struct definition'
            },
            {
                id: 'p8-2',
                title: 'Student Struct',
                description: 'Create a struct for a student with name and marks. Print details for "Alice" with marks 85.',
                initialCode: '#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int marks;\n};\n\nint main() {\n    // Initialize and print student details\n    return 0;\n}',
                hint: 'Initialize the struct and use printf with %s and %d.',
                solution: '#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int marks;\n};\n\nint main() {\n    struct Student s1 = {"Alice", 85};\n    printf("%s: %d", s1.name, s1.marks);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Structures',
                test_cases: [
                    { expected_output: 'Alice: 85' }
                ],
                estimatedTime: 4,
                relatedLesson: 'Structures → Array of Structs',
                commonMistake: 'Not initializing char array correctly or using wrong format specifiers'
            },
            {
                id: 'p8-3',
                title: 'Rectangle Struct',
                description: 'Create a Rectangle struct with length and width. Calculate area for l=10, w=5.',
                initialCode: '#include <stdio.h>\n\nstruct Rectangle {\n    int length;\n    int width;\n};\n\nint main() {\n    // Calculate and print area\n    return 0;\n}',
                hint: 'Area = length * width',
                solution: '#include <stdio.h>\n\nstruct Rectangle {\n    int length;\n    int width;\n};\n\nint main() {\n    struct Rectangle r = {10, 5};\n    int area = r.length * r.width;\n    printf("%d", area);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Structures',
                test_cases: [
                    { expected_output: '50' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Structures → Struct Computation',
                commonMistake: 'Not accessing struct members correctly'
            }
        ]
    },
    {
        id: 'files',
        title: 'File I/O Operations',
        problems: [
            {
                id: 'p9',
                title: 'Write File',
                description: 'Open a file named "test.txt" and write "C is fun" to it.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    FILE *fp;\n    // Open and write\n    return 0;\n}',
                hint: 'fp = fopen("test.txt", "w"); fprintf(fp, "C is fun"); fclose(fp);',
                solution: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("test.txt", "w");\n    if(fp == NULL) return 1;\n    fprintf(fp, "C is fun");\n    fclose(fp);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'File I/O',
                test_cases: [
                    { expected_output: '' }
                ],
                estimatedTime: 4,
                relatedLesson: 'File I/O → File Operations',
                commonMistake: 'Forgetting to close the file or not checking if fopen() succeeded'
            },
            {
                id: 'p9-2',
                title: 'Read and Display File Content',
                description: 'Read content from a file "data.txt" and display it.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    FILE *fp;\n    char ch;\n    // Open file in read mode and display content\n    return 0;\n}',
                hint: 'Use fgetc() to read characters until EOF.',
                solution: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("data.txt", "r");\n    if(fp == NULL) {\n        printf("File not found");\n        return 1;\n    }\n    char ch;\n    while((ch = fgetc(fp)) != EOF) printf("%c", ch);\n    fclose(fp);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'File I/O',
                test_cases: [
                    { expected_output: 'depends on file content' }
                ],
                estimatedTime: 5,
                relatedLesson: 'File I/O → Reading Files',
                commonMistake: 'Not handling EOF correctly or not closing file'
            }
        ]
    },
    {
        id: 'searching',
        title: 'Searching & Sorting',
        problems: [
            {
                id: 'p10',
                title: 'Linear Search',
                description: 'Search for number 7 in array {1, 7, 3, 9, 2, 7, 5}',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 7, 3, 9, 2, 7, 5};\n    int search = 7;\n    // Find if search exists in array\n    return 0;\n}',
                hint: 'Loop through array and check if element equals search value.',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 7, 3, 9, 2, 7, 5};\n    int search = 7;\n    int found = 0;\n    for(int i=0; i<7; i++) {\n        if(arr[i] == search) {\n            found = 1;\n            printf("Found at index %d", i);\n            break;\n        }\n    }\n    if(!found) printf("Not found");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Searching',
                test_cases: [
                    { expected_output: 'Found at index 1' }
                ],
                estimatedTime: 3,
                relatedLesson: 'Searching → Linear Search',
                commonMistake: 'Not breaking after finding first occurrence'
            },
            {
                id: 'p10-2',
                title: 'Bubble Sort',
                description: 'Sort array {5, 2, 8, 1, 9} in ascending order using bubble sort.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {5, 2, 8, 1, 9};\n    int n = 5;\n    // Sort using bubble sort\n    return 0;\n}',
                hint: 'Compare adjacent elements and swap if needed.',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {5, 2, 8, 1, 9};\n    int n = 5;\n    for(int i=0; i<n-1; i++) {\n        for(int j=0; j<n-i-1; j++) {\n            if(arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n    for(int i=0; i<n; i++) printf("%d ", arr[i]);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Sorting',
                test_cases: [
                    { expected_output: '1 2 5 8 9 ' }
                ],
                estimatedTime: 6,
                relatedLesson: 'Sorting → Bubble Sort',
                commonMistake: 'Wrong loop conditions or not swapping correctly'
            }
        ]
    },
    {
        id: 'recursion',
        title: 'Recursion & Advanced Techniques',
        problems: [
            {
                id: 'p11',
                title: 'Factorial using Recursion',
                description: 'Calculate factorial of 5 using recursion: factorial(5)',
                initialCode: '#include <stdio.h>\n\nint factorial(int n) {\n    // Base case and recursive case\n    return 1;\n}\n\nint main() {\n    printf("%d", factorial(5));\n    return 0;\n}',
                hint: 'factorial(n) = n * factorial(n-1); Base case: if n==0 return 1',
                solution: '#include <stdio.h>\n\nint factorial(int n) {\n    if(n == 0 || n == 1) return 1;\n    return n * factorial(n-1);\n}\n\nint main() {\n    printf("%d", factorial(5));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Recursion',
                test_cases: [
                    { expected_output: '120' }
                ],
                estimatedTime: 5,
                relatedLesson: 'Recursion → Factorial',
                commonMistake: 'Missing base case or infinite recursion'
            },
            {
                id: 'p11-2',
                title: 'Fibonacci Number',
                description: 'Find the 6th Fibonacci number using recursion.',
                initialCode: '#include <stdio.h>\n\nint fibonacci(int n) {\n    // Calculate nth Fibonacci number\n    return 0;\n}\n\nint main() {\n    printf("%d", fibonacci(6));\n    return 0;\n}',
                hint: 'fibonacci(n) = fibonacci(n-1) + fibonacci(n-2); Base cases: fib(0)=0, fib(1)=1',
                solution: '#include <stdio.h>\n\nint fibonacci(int n) {\n    if(n == 0) return 0;\n    if(n == 1) return 1;\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n\nint main() {\n    printf("%d", fibonacci(6));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Recursion',
                test_cases: [
                    { expected_output: '8' }
                ],
                estimatedTime: 5,
                relatedLesson: 'Recursion → Fibonacci',
                commonMistake: 'Wrong base cases or incorrect addition'
            },
            {
                id: 'p11-3',
                title: 'Power using Recursion',
                description: 'Calculate 2^5 using recursion.',
                initialCode: '#include <stdio.h>\n\nint power(int base, int exp) {\n    // Calculate base^exp recursively\n    return 1;\n}\n\nint main() {\n    printf("%d", power(2, 5));\n    return 0;\n}',
                hint: 'power(base, exp) = base * power(base, exp-1); Base case: if exp==0 return 1',
                solution: '#include <stdio.h>\n\nint power(int base, int exp) {\n    if(exp == 0) return 1;\n    return base * power(base, exp-1);\n}\n\nint main() {\n    printf("%d", power(2, 5));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Recursion',
                test_cases: [
                    { expected_output: '32' }
                ],
                estimatedTime: 4,
                relatedLesson: 'Recursion → Power Function',
                commonMistake: 'Wrong base case or incorrect recursion logic'
            }
        ]
    }
];

