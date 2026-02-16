
export interface TestCase {
    stdin?: string;
    expected_output: string;
}

export interface PracticeProblem {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    starter_codes?: Record<string, string>;
    hint: string;
    solution: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    concept?: string;
    test_cases?: TestCase[];
    language?: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
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
                description: 'Write a program that prints "Hello World" to the standard output.',
                inputFormat: 'None',
                outputFormat: 'Print "Hello World".',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n\n    return 0;\n}',
                    'cpp': '#include <iostream>\n\nint main() {\n\n    return 0;\n}',
                    'java': 'public class Main {\n    public static void main(String[] args) {\n\n    }\n}',
                    'python': 'print("")',
                    'javascript': 'console.log("");'
                },
                hint: 'Use the printf() function to display text.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Basic Output',
                language: 'C',
                test_cases: [
                    { expected_output: 'Hello World' }
                ],
                explanation: 'The most basic program in any language is printing a hello message to verify the environment works.',
                estimatedTime: 1,
                relatedLesson: 'Introduction → printf()',
                commonMistake: 'Forgetting to include <stdio.h> or missing the return 0; statement'
            },
            {
                id: 'intro-2',
                title: 'Basic Program Structure',
                description: 'Write a program that prints "Program executed successfully".',
                inputFormat: 'None',
                outputFormat: 'Print the required string.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n\n    return 0;\n}',
                    'cpp': '#include <iostream>\n\nint main() {\n\n    return 0;\n}',
                    'java': 'public class Main {\n    public static void main(String[] args) {\n\n    }\n}',
                    'python': 'print("")',
                    'javascript': 'console.log("");'
                },
                hint: 'Add a printf() statement to demonstrate program structure.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("Program executed successfully");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Program Structure',
                language: 'C',
                test_cases: [
                    { expected_output: 'Program executed successfully' }
                ],
                explanation: 'A standard program structure usually includes headers, a main entry point, and a return statement.',
                estimatedTime: 1,
                relatedLesson: 'Introduction → Program Structure',
                commonMistake: 'Missing the main() function or misunderstanding the return statement'
            },
            {
                id: 'intro-3',
                title: 'Comments in C',
                description: 'Write a program that prints "Comments help explain code". Include at least one comment in your code.',
                inputFormat: 'None',
                outputFormat: 'Print the required string.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    // Add comment here\n    return 0;\n}',
                    'cpp': '#include <iostream>\n\nint main() {\n    // Add comment here\n    return 0;\n}',
                    'java': 'public class Main {\n    public static void main(String[] args) {\n        // Add comment here\n    }\n}',
                    'python': '# Add comment here\nprint("")',
                    'javascript': '// Add comment here\nconsole.log("");'
                },
                hint: 'Use // for single-line and /* */ for multi-line comments.',
                solution: '#include <stdio.h>\n\nint main() {\n    // This is a comment\n    printf("Comments help explain code");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Comments',
                language: 'C',
                test_cases: [
                    { expected_output: 'Comments help explain code' }
                ],
                explanation: 'Comments are non-executable text that helps developers understand what the code does.',
                estimatedTime: 2,
                relatedLesson: 'Introduction → Code Comments',
                commonMistake: 'Nesting /* */ comments or using wrong comment syntax'
            },
            {
                id: 'intro-4',
                title: 'Print Multiple Lines',
                description: 'Write a program that prints three separate lines: "GenSpark", "Coding", and "Platform".',
                inputFormat: 'None',
                outputFormat: 'Print three lines.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n\n    return 0;\n}',
                    'cpp': '#include <iostream>\n\nint main() {\n\n    return 0;\n}',
                    'java': 'public class Main {\n    public static void main(String[] args) {\n\n    }\n}',
                    'python': 'print("GenSpark")\nprint("Coding")\nprint("Platform")',
                    'javascript': 'console.log("GenSpark");\nconsole.log("Coding");\nconsole.log("Platform");'
                },
                hint: 'Use printf() with \\n for new lines.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("GenSpark\\n");\n    printf("Coding\\n");\n    printf("Platform\\n");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Output Formatting',
                language: 'C',
                test_cases: [
                    { expected_output: 'GenSpark\nCoding\nPlatform\n' }
                ],
                explanation: 'The newline character (\\n) is used to move the cursor to the beginning of the next line.',
                estimatedTime: 2,
                relatedLesson: 'Introduction → Output Formatting',
                commonMistake: 'Forgetting escape sequences like \\n'
            },
            {
                id: 'intro-5',
                title: 'Print with Spacing',
                description: 'Print "Hello   World" ensuring there are exactly 3 spaces between the words.',
                inputFormat: 'None',
                outputFormat: 'Print the string with spaces.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n\n    return 0;\n}',
                    'cpp': '#include <iostream>\n\nint main() {\n\n    return 0;\n}',
                    'java': 'public class Main {\n    public static void main(String[] args) {\n\n    }\n}',
                    'python': 'print("Hello   World")',
                    'javascript': 'console.log("Hello   World");'
                },
                hint: 'Add spaces directly in the printf string.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("Hello   World");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Basic Output',
                language: 'C',
                test_cases: [
                    { expected_output: 'Hello   World' }
                ],
                explanation: 'Spaces within double quotes are literal characters and will be printed exactly as they appear.',
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
                description: 'Given an integer n, determine if it is even or odd.\n\nA number is even if it is divisible by 2 with no remainder. Otherwise, it is odd.',
                inputFormat: 'A single integer n.',
                outputFormat: 'Print "Even" if the number is even, else print "Odd".',
                constraints: '1 <= n <= 1000',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Use if-else to print "Even" or "Odd"\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    \n    return 0;\n}',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n    }\n}',
                    'python': 'n = int(input())',
                    'javascript': 'const n = parseInt(prompt());',
                    'cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    return 0;\n}'
                },
                hint: 'Use the modulus operator: n % 2 == 0',
                solution: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    if (n % 2 == 0) printf("Even");\n    else printf("Odd");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'if-else',
                language: 'C',
                test_cases: [
                    { stdin: '7', expected_output: 'Odd' },
                    { stdin: '10', expected_output: 'Even' }
                ],
                explanation: 'A number is even if (n % 2 == 0). This checks if the remainder after dividing by 2 is zero.',
                estimatedTime: 2,
                relatedLesson: 'Flow Control → if-else statements',
                commonMistake: 'Using = instead of == in the condition, or forgetting the modulus operator'
            },
            {
                id: 'p3-2',
                title: 'Max of Two Numbers',
                description: 'Given two integers a and b, find and print the maximum value among them.',
                inputFormat: 'Two integers a and b separated by space.',
                outputFormat: 'Print the maximum value.',
                constraints: '-10^5 <= a, b <= 10^5',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    // Find and print the maximum\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    return 0;\n}',
                    'python': 'a, b = map(int, input().split())',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n    }\n}',
                    'javascript': 'const [a, b] = prompt().split(" ").map(Number);'
                },
                hint: 'Use if-else to compare a and b.',
                solution: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    if (a > b) printf("%d", a);\n    else printf("%d", b);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Conditional Logic',
                language: 'C',
                test_cases: [
                    { stdin: '15 8', expected_output: '15' },
                    { stdin: '-10 20', expected_output: '20' }
                ],
                explanation: 'A simple if(a > b) check allows you to pick the larger value. If a is not greater than b, then b must be the maximum (or they are equal).',
                estimatedTime: 2,
                relatedLesson: 'Flow Control → Comparison Operators',
                commonMistake: 'Swapping the comparison or incorrect printf format'
            },
            {
                id: 'p3-3',
                title: 'Simple Calculator',
                description: 'Perform a simple addition of two input integers.',
                inputFormat: 'Two integers a and b.',
                outputFormat: 'Print the sum (a + b).',
                constraints: '-10^6 <= a, b <= 10^6',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    // Add and print the result\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    return 0;\n}',
                    'python': 'a, b = map(int, input().split())',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n    }\n}'
                },
                hint: 'Use printf to display the sum of a and b.',
                solution: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d", a + b);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Arithmetic',
                language: 'C',
                test_cases: [
                    { stdin: '20 15', expected_output: '35' },
                    { stdin: '-5 5', expected_output: '0' }
                ],
                explanation: 'The + operator is used to calculate the sum of two numerical values.',
                estimatedTime: 1,
                relatedLesson: 'Flow Control → Arithmetic Operations',
                commonMistake: 'Wrong operator or format specifier'
            },
            {
                id: 'p3-4',
                title: 'Loop: Count 1 to 5',
                description: 'Use a loop to print integers from 1 to 5, each on a new line.',
                inputFormat: 'None',
                outputFormat: 'Print integers 1, 2, 3, 4, 5 on separate lines.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Write a loop to print 1 to 5\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
                    'python': 'for i in range(1, 6):\n    print(i)',
                    'java': 'public class Solution {\n    public static void main(String[] args) {\n        for(int i=1; i<=5; i++) System.out.println(i);\n    }\n}'
                },
                hint: 'Use for(int i=1; i<=5; i++) printf("%d\\n", i);',
                solution: '#include <stdio.h>\n\nint main() {\n    for(int i=1; i<=5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Loops',
                language: 'C',
                test_cases: [
                    { expected_output: '1\n2\n3\n4\n5\n' }
                ],
                explanation: 'A for loop executes a block of code repeatedly until a specified condition becomes false.',
                estimatedTime: 3,
                relatedLesson: 'Flow Control → for loops',
                commonMistake: 'Off-by-one errors or wrong loop condition'
            },
            {
                id: 'p3-5',
                title: 'Sum of First N Numbers',
                description: 'Calculate the sum of all integers from 1 up to a given integer N.',
                inputFormat: 'A single integer N.',
                outputFormat: 'Print the final sum.',
                constraints: '1 <= N <= 1000',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n, sum = 0;\n    scanf("%d", &n);\n    // Loop from 1 to n and add to sum\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n, sum = 0;\n    scanf("%d", &n);\n    return 0;\n}',
                    'python': 'n = int(input())\nsum_val = 0',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n    }\n}'
                },
                hint: 'Use a for loop to add numbers.',
                solution: '#include <stdio.h>\n\nint main() {\n    int n, sum = 0;\n    if(scanf("%d", &n) != 1) return 0;\n    for(int i=1; i<=n; i++) {\n        sum += i;\n    }\n    printf("%d", sum);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Loops',
                language: 'C',
                test_cases: [
                    { stdin: '10', expected_output: '55' },
                    { stdin: '5', expected_output: '15' }
                ],
                explanation: 'Initialize a sum variable to 0. Iterate from 1 to N, adding each value of the loop counter to the sum.',
                estimatedTime: 4,
                relatedLesson: 'Flow Control → Loop Accumulation',
                commonMistake: 'Not initializing sum to 0 or wrong loop range'
            },
            {
                id: 'p3-6',
                title: 'Factorial Calculation',
                description: 'Calculate the factorial of a given integer N (N! = N * (N-1) * ... * 1).',
                inputFormat: 'A single integer N.',
                outputFormat: 'Print the value of N!.',
                constraints: '0 <= N <= 12 (to avoid integer overflow)',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n, fact = 1;\n    scanf("%d", &n);\n    // Calculate factorial\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n, fact = 1;\n    scanf("%d", &n);\n    return 0;\n}',
                    'python': 'n = int(input())\nfact = 1',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n    }\n}'
                },
                hint: 'Multiply fact by each number from 1 to N.',
                solution: '#include <stdio.h>\n\nint main() {\n    int n, fact = 1;\n    if(scanf("%d", &n) != 1) return 0;\n    for(int i=1; i<=n; i++) {\n        fact *= i;\n    }\n    printf("%d", fact);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Loops',
                language: 'C',
                test_cases: [
                    { stdin: '5', expected_output: '120' },
                    { stdin: '0', expected_output: '1' }
                ],
                explanation: 'Factorial of 0 is defined as 1. For other numbers, multiply the prefix cumulative product by the current iterator value.',
                estimatedTime: 4,
                relatedLesson: 'Flow Control → Loop Multiplication',
                commonMistake: 'Not initializing fact to 1 or starting loop from 0'
            },
            {
                id: 'p3-7',
                title: 'Check Prime Number',
                description: 'Determine if a given integer N is a prime number. A prime number has exactly two factors: 1 and itself.',
                inputFormat: 'A single integer N.',
                outputFormat: 'Print "Prime" if N is prime, else print "Not Prime".',
                constraints: '1 <= N <= 10^5',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n, isPrime = 1;\n    scanf("%d", &n);\n    // Check if n is prime\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    return 0;\n}',
                    'python': 'n = int(input())',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n    }\n}'
                },
                hint: 'Check if any number divides n perfectly from 2 up to sqrt(n).',
                solution: '#include <stdio.h>\n\nint main() {\n    int n, isPrime = 1;\n    if(scanf("%d", &n) != 1) return 0;\n    if(n < 2) isPrime = 0;\n    else {\n        for(int i=2; i*i<=n; i++) {\n            if(n % i == 0) {\n                isPrime = 0;\n                break;\n            }\n        }\n    }\n    printf("%s", isPrime ? "Prime" : "Not Prime");\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Loops + Logic',
                language: 'C',
                test_cases: [
                    { stdin: '13', expected_output: 'Prime' },
                    { stdin: '15', expected_output: 'Not Prime' },
                    { stdin: '1', expected_output: 'Not Prime' }
                ],
                explanation: 'Iterate from 2 up to the square root of N. If any number divides N evenly, N is composite.',
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
                description: 'Write a function "square" that takes an integer n as input and returns its square (n * n).',
                inputFormat: 'A single integer n.',
                outputFormat: 'Return the square of n.',
                constraints: '-10^4 <= n <= 10^4',
                initialCode: '#include <stdio.h>\n\nint square(int n) {\n    // Write square function here\n}\n\nint main() {\n    printf("%d", square(5));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int square(int n) {\n\n}',
                    'java': 'class Solution {\n    public int square(int n) {\n\n    }\n}',
                    'python': 'def square(n):\n    pass',
                    'javascript': 'function square(n) {\n\n}',
                    'cpp': 'int square(int n) {\n\n}'
                },
                hint: 'The function signature should be: int square(int n)',
                solution: '#include <stdio.h>\n\nint square(int n) { return n * n; }\n\nint main() {\n    printf("%d", square(5));\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Functions',
                test_cases: [
                    { stdin: '5', expected_output: '25' },
                    { stdin: '-3', expected_output: '9' }
                ],
                explanation: 'A function encapsulate a logic that can be reused. The square of a number is simply the number multiplied by itself.',
                estimatedTime: 3,
                relatedLesson: 'Functions → Function Definition & Calling',
                commonMistake: 'Forgetting the return type or passing wrong number of arguments'
            },
            {
                id: 'p4-2',
                title: 'Add Two Numbers Function',
                description: 'Create a function "add" that takes two integers and returns their sum.',
                inputFormat: 'Two integers a and b.',
                outputFormat: 'Return the sum of a and b.',
                constraints: '-10^9 <= a, b <= 10^9',
                initialCode: '#include <stdio.h>\n\nint add(int a, int b) {\n    // Write add function here\n}\n\nint main() {\n    printf("%d", add(10, 20));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int add(int a, int b) {\n\n}',
                    'java': 'class Solution {\n    public int add(int a, int b) {\n\n    }\n}',
                    'python': 'def add(a, b):\n    pass',
                    'javascript': 'function add(a, b) {\n\n}',
                    'cpp': 'int add(int a, int b) {\n\n}'
                },
                hint: 'Function should take two int parameters and return their sum.',
                solution: '#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\n\nint main() {\n    printf("%d", add(10, 20));\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Functions',
                test_cases: [
                    { stdin: '10 20', expected_output: '30' },
                    { stdin: '-5 5', expected_output: '0' }
                ],
                explanation: 'Functions allow you to move basic arithmetic logic into a modular piece of code.',
                estimatedTime: 2,
                relatedLesson: 'Functions → Parameters & Return',
                commonMistake: 'Forgetting parameter types or return type'
            },
            {
                id: 'p4-3',
                title: 'Multiply Function',
                description: 'Create a function that takes three integers and returns their product.',
                inputFormat: 'Three integers a, b, and c.',
                outputFormat: 'Return the product of a, b, and c.',
                constraints: '-100 <= a, b, c <= 100',
                initialCode: '#include <stdio.h>\n\nint multiply(int a, int b, int c) {\n    // Write multiply function here\n}\n\nint main() {\n    printf("%d", multiply(5, 6, 3));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int multiply(int a, int b, int c) {\n\n}',
                    'java': 'class Solution {\n    public int multiply(int a, int b, int c) {\n\n    }\n}',
                    'python': 'def multiply(a, b, c):\n    pass',
                    'javascript': 'function multiply(a, b, c) {\n\n}',
                    'cpp': 'int multiply(int a, int b, int c) {\n\n}'
                },
                hint: 'Function should accept three int parameters.',
                solution: '#include <stdio.h>\n\nint multiply(int a, int b, int c) { return a * b * c; }\n\nint main() {\n    printf("%d", multiply(5, 6, 3));\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Functions',
                test_cases: [
                    { stdin: '5 6 3', expected_output: '90' },
                    { stdin: '2 4 0', expected_output: '0' }
                ],
                explanation: 'You can pass multiple parameters to a function by separating them with commas in the declaration.',
                estimatedTime: 3,
                relatedLesson: 'Functions → Multiple Parameters',
                commonMistake: 'Forgetting commas between parameters'
            },
            {
                id: 'p4-4',
                title: 'Power Function',
                description: 'Write a function "power" that returns the value of base raised to the exponent (base^exp).',
                inputFormat: 'Two integers: base and exp.',
                outputFormat: 'Return base raised to exp.',
                constraints: '0 <= base, exp <= 10',
                initialCode: '#include <stdio.h>\n\nint power(int base, int exp) {\n    // Write power function here\n}\n\nint main() {\n    printf("%d", power(2, 5));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int power(int base, int exp) {\n\n}',
                    'java': 'class Solution {\n    public int power(int base, int exp) {\n\n    }\n}',
                    'python': 'def power(base, exp):\n    pass',
                    'javascript': 'function power(base, exp) {\n\n}'
                },
                hint: 'Use a loop to multiply base by itself power times.',
                solution: '#include <stdio.h>\n\nint power(int base, int exp) {\n    int result = 1;\n    for(int i=0; i<exp; i++) result *= base;\n    return result;\n}\n\nint main() {\n    printf("%d", power(2, 5));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Functions + Loops',
                test_cases: [
                    { stdin: '2 5', expected_output: '32' },
                    { stdin: '5 0', expected_output: '1' }
                ],
                explanation: 'A loop inside a function allows complex repetitive calculations while keeping the main code clean.',
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
                description: 'Given an array of integers, calculate and print the sum of all its elements.',
                inputFormat: 'An integer n followed by n integers.',
                outputFormat: 'Print the sum of the elements.',
                constraints: '1 <= n <= 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n, sum = 0;\n    scanf("%d", &n);\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    // Loop and add to sum\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n, sum = 0;\n    scanf("%d", &n);\n    return 0;\n}',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n    }\n}',
                    'python': 'n = int(input())\narr = list(map(int, input().split()))',
                    'javascript': 'const n = parseInt(prompt());\nconst arr = prompt().split(" ").map(Number);'
                },
                hint: 'Use a for loop: for(int i=0; i<n; i++) sum += arr[i];',
                solution: '#include <stdio.h>\n\nint main() {\n    int n, sum = 0;\n    if(scanf("%d", &n) != 1) return 0;\n    int arr[n];\n    for(int i=0; i<n; i++) {\n        if(scanf("%d", &arr[i]) != 1) break;\n        sum += arr[i];\n    }\n    printf("%d", sum);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays + Loops',
                test_cases: [
                    { stdin: '5\n1 2 3 4 5', expected_output: '15' },
                    { stdin: '3\n10 10 10', expected_output: '30' }
                ],
                explanation: 'Arrays store multiple values of the same type. Iterating with a for loop is the standard way to process each element.',
                estimatedTime: 3,
                relatedLesson: 'Arrays → Array Iteration',
                commonMistake: 'Off-by-one error in loop or forgetting to initialize sum to 0'
            },
            {
                id: 'p5-2',
                title: 'Find Maximum in Array',
                description: 'Write a program to find the largest element in a given array of n integers.',
                inputFormat: 'Integer n followed by n integers.',
                outputFormat: 'Print the largest integer.',
                constraints: '1 <= n <= 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    int max = arr[0];\n    // Find maximum element\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    return 0;\n}',
                    'python': 'n = int(input())\narr = list(map(int, input().split()))',
                    'java': 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}'
                },
                hint: 'Compare each element with max and update if greater.',
                solution: '#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf("%d", &n) != 1 || n <= 0) return 0;\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    int max = arr[0];\n    for(int i=1; i<n; i++) {\n        if(arr[i] > max) max = arr[i];\n    }\n    printf("%d", max);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays + Comparison',
                test_cases: [
                    { stdin: '6\n5 2 8 1 9 3', expected_output: '9' },
                    { stdin: '4\n-5 -2 -10 -1', expected_output: '-1' }
                ],
                explanation: 'A common pattern is to assume the first element is the max, then update it as you find larger values.',
                estimatedTime: 4,
                relatedLesson: 'Arrays → Finding Elements',
                commonMistake: 'Starting loop from 0 instead of 1 or wrong comparison'
            },
            {
                id: 'p5-3',
                title: 'Find Minimum in Array',
                description: 'Write a program to find the smallest element in a given array of n integers.',
                inputFormat: 'Integer n followed by n integers.',
                outputFormat: 'Print the smallest integer.',
                constraints: '1 <= n <= 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    int min = arr[0];\n    // Find minimum element\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    return 0;\n}',
                    'python': 'n = int(input())\narr = list(map(int, input().split()))'
                },
                hint: 'Similar to maximum but use < instead of >.',
                solution: '#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf("%d", &n) != 1 || n <= 0) return 0;\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    int min = arr[0];\n    for(int i=1; i<n; i++) {\n        if(arr[i] < min) min = arr[i];\n    }\n    printf("%d", min);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays',
                language: 'C',
                test_cases: [
                    { stdin: '5\n15 7 12 3 9', expected_output: '3' }
                ],
                explanation: 'Initialize min with the first element and iterate through the rest, updating min if a smaller value is found.',
                estimatedTime: 3,
                relatedLesson: 'Arrays → Finding Elements',
                commonMistake: 'Using wrong comparison operator'
            },
            {
                id: 'p5-4',
                title: 'Array Reverse',
                description: 'Given an array of n integers, print the elements in reverse order.',
                inputFormat: 'Integer n followed by n integers.',
                outputFormat: 'Print elements in reverse order separated by space.',
                constraints: '1 <= n <= 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    // Reverse and print array\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    return 0;\n}',
                    'python': 'n = int(input())\narr = list(map(int, input().split()))',
                    'javascript': 'console.log(arr.reverse().join(" "));'
                },
                hint: 'Print from last index to first: for(int i=n-1; i>=0; i--)',
                solution: '#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf("%d", &n) != 1) return 0;\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    for(int i=n-1; i>=0; i--) {\n        printf("%d ", arr[i]);\n    }\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Arrays',
                test_cases: [
                    { stdin: '5\n1 2 3 4 5', expected_output: '5 4 3 2 1 ' }
                ],
                explanation: 'Reversing an output means iterating through the array from its final index (n-1) down to 0.',
                estimatedTime: 3,
                relatedLesson: 'Arrays → Reverse Iteration',
                commonMistake: 'Wrong loop condition or not printing correctly'
            },
            {
                id: 'p5-5',
                title: 'Count Even Numbers',
                description: 'Count how many even numbers are present in a given array of n integers.',
                inputFormat: 'Integer n followed by n integers.',
                outputFormat: 'Print the count of even numbers.',
                constraints: '1 <= n <= 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n, count = 0;\n    scanf("%d", &n);\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    // Count even numbers\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    return 0;\n}',
                    'python': 'n = int(input())\narr = [int(x) for x in input().split()]'
                },
                hint: 'Use arr[i] % 2 == 0 to check if even.',
                solution: '#include <stdio.h>\n\nint main() {\n    int n, count = 0;\n    if(scanf("%d", &n) != 1) return 0;\n    int arr[n];\n    for(int i=0; i<n; i++) {\n        scanf("%d", &arr[i]);\n        if(arr[i] % 2 == 0) count++;\n    }\n    printf("%d", count);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Arrays + Logic',
                test_cases: [
                    { stdin: '6\n2 5 8 3 10 7', expected_output: '3' }
                ],
                explanation: 'Combine array iteration with a conditional if statement to filter elements based on a property.',
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
                description: 'Swap the values of two integers using pointers.',
                inputFormat: 'Two integers a and b.',
                outputFormat: 'Print the values after swapping (x=val, y=val).',
                constraints: '-10^4 <= a, b <= 10^4',
                initialCode: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // Write swap logic here\n}\n\nint main() {\n    int x, y;\n    scanf("%d %d", &x, &y);\n    swap(&x, &y);\n    printf("x=%d, y=%d", x, y);\n    return 0;\n}',
                starter_codes: {
                    'c': 'void swap(int *a, int *b) {\n\n}',
                    'cpp': 'void swap(int &a, int &b) {\n\n}',
                    'java': '// In Java, use an array or a wrapper class to simulate pointer behavior\npublic void swap(int[] arr) {\n\n}'
                },
                hint: 'Use a temporary variable: int temp = *a; *a = *b; *b = temp;',
                solution: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 10, y = 20;\n    swap(&x, &y);\n    printf("x=%d, y=%d", x, y);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Pointers',
                test_cases: [
                    { stdin: '10 20', expected_output: 'x=20, y=10' }
                ],
                explanation: 'Pointers allow a function to modify variables in the caller\'s scope by passing their memory addresses.',
                estimatedTime: 4,
                relatedLesson: 'Pointers → Pointer Dereferencing',
                commonMistake: 'Forgetting the * operator for dereferencing or passing values instead of addresses'
            },
            {
                id: 'p6-2',
                title: 'Pointer to Variable',
                description: 'Initialize an integer, create a pointer to it, and use the pointer to print the value.',
                inputFormat: 'A single integer num.',
                outputFormat: 'Print the value using pointer dereferencing.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int num;\n    scanf("%d", &num);\n    int *ptr = &num;  // Pointer to num\n    // Print the value using pointer\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int num;\n    int *ptr = &num;\n    return 0;\n}'
                },
                hint: 'Use *ptr to dereference the pointer.',
                solution: '#include <stdio.h>\n\nint main() {\n    int num = 25;\n    int *ptr = &num;\n    printf("%d", *ptr);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Pointers',
                test_cases: [
                    { stdin: '25', expected_output: '25' }
                ],
                explanation: 'A pointer stores the address of another variable. Dereferencing (*) retrieves the value stored at that address.',
                estimatedTime: 3,
                relatedLesson: 'Pointers → Pointer Basics',
                commonMistake: 'Mixing & and * operators or wrong assignment'
            },
            {
                id: 'p6-3',
                title: 'Address of Variable',
                description: 'Print the hexadecimal memory address of a given integer variable.',
                inputFormat: 'A single integer x.',
                outputFormat: 'Print the address (e.g., 0x...).',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int x;\n    scanf("%d", &x);\n    // Print the address of x\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    int x;\n    return 0;\n}'
                },
                hint: 'Use %p format specifier and & operator.',
                solution: '#include <stdio.h>\n\nint main() {\n    int x = 100;\n    printf("%p", (void*)&x);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Pointers',
                test_cases: [
                    { stdin: '100', expected_output: '0x...' }
                ],
                explanation: 'The address-of operator (&) returns the location in memory where a variable is stored.',
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
                description: 'Write a manual function to find the length of a string without using the built-in "strlen" function.',
                inputFormat: 'A string s.',
                outputFormat: 'Return the length of the string.',
                constraints: '1 <= s.length <= 1000',
                initialCode: '#include <stdio.h>\n\nint myLen(char *s) {\n    // Loop until null terminator\n    return 0;\n}\n\nint main() {\n    char str[100];\n    scanf("%s", str);\n    printf("%d", myLen(str));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int myLen(char *s) {\n\n}',
                    'java': 'public int myLen(String s) {\n\n}',
                    'python': 'def myLen(s):\n    pass',
                    'javascript': 'function myLen(s) {\n\n}'
                },
                hint: 'While s[i] is not \'\\0\', increment i.',
                solution: '#include <stdio.h>\n\nint myLen(char *s) {\n    int i = 0;\n    while(s[i] != \'\\0\') i++;\n    return i;\n}\n\nint main() {\n    printf("%d", myLen("GenSpark"));\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Strings + Loops',
                test_cases: [
                    { stdin: 'GenSpark', expected_output: '8' },
                    { stdin: 'Coding', expected_output: '6' }
                ],
                explanation: 'A string in C is a null-terminated character array. The length is the count of characters before the \'\\0\'.',
                estimatedTime: 3,
                relatedLesson: 'Strings → String Termination',
                commonMistake: 'Missing the null terminator check or incrementing the wrong variable'
            },
            {
                id: 'p7-2',
                title: 'Reverse a String',
                description: 'Write a program to reverse a given string.',
                inputFormat: 'A single word string.',
                outputFormat: 'Print the reversed string.',
                constraints: '1 <= length <= 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    char str[100];\n    scanf("%s", str);\n    // Reverse and print the string\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    char str[100];\n    scanf("%s", str);\n    return 0;\n}',
                    'python': 's = input()\nprint(s[::-1])',
                    'javascript': 'const s = prompt();\nconsole.log(s.split("").reverse().join(""));'
                },
                hint: 'Use a loop starting from the end of the string.',
                solution: '#include <stdio.h>\n\nint main() {\n    char str[] = "Hello";\n    int i = 0;\n    while(str[i] != \'\\0\') i++;\n    for(i=i-1; i>=0; i--) printf("%c", str[i]);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Strings',
                test_cases: [
                    { stdin: 'Hello', expected_output: 'olleH' },
                    { stdin: 'C', expected_output: 'C' }
                ],
                explanation: 'First find the length, then iterate backwards from length-1 down to 0.',
                estimatedTime: 4,
                relatedLesson: 'Strings → String Manipulation',
                commonMistake: 'Not finding string length correctly or wrong loop direction'
            },
            {
                id: 'p7-3',
                title: 'Count Vowels in String',
                description: 'Count the total number of vowels (a, e, i, o, u) in a given string.',
                inputFormat: 'A string s.',
                outputFormat: 'Print the vowel count.',
                constraints: '1 <= s.length <= 1000',
                initialCode: '#include <stdio.h>\n\nint main() {\n    char str[100];\n    scanf("%s", str);\n    int vowels = 0;\n    // Count vowels\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    char str[100];\n    int vowels = 0;\n    return 0;\n}',
                    'python': 's = input()\nvowels = 0',
                    'javascript': 'const s = prompt();\nlet vowels = 0;'
                },
                hint: 'Check if each character is a vowel using if conditions.',
                solution: '#include <stdio.h>\n\nint main() {\n    char str[] = "Programming";\n    int vowels = 0;\n    for(int i=0; str[i]!= \'\\0\'; i++) {\n        char c = str[i];\n        if(c==\'a\' || c==\'e\' || c==\'i\' || c==\'o\' || c==\'u\' || c==\'A\' || c==\'E\' || c==\'I\' || c==\'O\' || c==\'U\') vowels++;\n    }\n    printf("%d", vowels);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Strings + Logic',
                test_cases: [
                    { stdin: 'Programming', expected_output: '3' },
                    { stdin: 'AEIOU', expected_output: '5' }
                ],
                explanation: 'Iterate through the string and use a conditional check to see if the current character is one of {a, e, i, o, u} in either case.',
                estimatedTime: 5,
                relatedLesson: 'Strings → String Analysis',
                commonMistake: 'Not checking both uppercase and lowercase or missing vowels'
            },
            {
                id: 'p7-4',
                title: 'String Concatenation',
                description: 'Given two strings, join them together and print the result.',
                inputFormat: 'Two strings s1 and s2.',
                outputFormat: 'Print s1 + s2.',
                constraints: 'Total length <= 200',
                initialCode: '#include <stdio.h>\n\nint main() {\n    char str1[100], str2[100];\n    scanf("%s %s", str1, str2);\n    // Concatenate and print\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    char s1[100], s2[100];\n    scanf("%s %s", s1, s2);\n    return 0;\n}',
                    'python': 's1 = input()\ns2 = input()\nprint(s1 + s2)',
                    'javascript': 'const s1 = prompt(); const s2 = prompt(); console.log(s1 + s2);'
                },
                hint: 'Print both strings one after another.',
                solution: '#include <stdio.h>\n\nint main() {\n    char str1[] = "Hello ";\n    char str2[] = "World";\n    printf("%s%s", str1, str2);\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Strings',
                test_cases: [
                    { stdin: 'Hello World', expected_output: 'HelloWorld' }
                ],
                explanation: 'Concatenation simply means putting strings end-to-end.',
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
                description: 'Define a structure called "Point" that stores x and y coordinates (integers). Create an instance, initialize it with (10, 20), and print it in the format "(x, y)".',
                inputFormat: 'None',
                outputFormat: 'Print the point in format "(x, y)".',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\n// Define struct here\n\nint main() {\n    // Initialize and print\n    return 0;\n}',
                starter_codes: {
                    'c': 'struct Point {\n    int x;\n    int y;\n};',
                    'cpp': 'struct Point {\n    int x;\n    int y;\n};',
                    'javascript': 'const point = { x: 10, y: 20 };'
                },
                hint: 'struct Point { int x; int y; };',
                solution: '#include <stdio.h>\n\nstruct Point { int x; int y; };\n\nint main() {\n    struct Point p1 = {10, 20};\n    printf("(%d, %d)", p1.x, p1.y);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Structures',
                test_cases: [
                    { expected_output: '(10, 20)' }
                ],
                explanation: 'Structures (structs) allow you to bundle different variables together into a single custom data type.',
                estimatedTime: 3,
                relatedLesson: 'Structures → Struct Definition & Access',
                commonMistake: 'Using wrong syntax for struct member access or forgetting the semicolon after struct definition'
            },
            {
                id: 'p8-2',
                title: 'Student Struct',
                description: 'Create a "Student" struct containing a name (string) and marks (integer). Print details for a student "Alice" with marks 85.',
                inputFormat: 'None',
                outputFormat: 'Print "name: marks".',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int marks;\n};\n\nint main() {\n    // Initialize and print student details\n    return 0;\n}',
                starter_codes: {
                    'c': 'struct Student {\n    char name[50];\n    int marks;\n};',
                    'java': 'class Student {\n    String name;\n    int marks;\n}',
                    'python': 'class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks'
                },
                hint: 'Initialize the struct and use printf with %s and %d.',
                solution: '#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int marks;\n};\n\nint main() {\n    struct Student s1 = {"Alice", 85};\n    printf("%s: %d", s1.name, s1.marks);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Structures',
                test_cases: [
                    { expected_output: 'Alice: 85' }
                ],
                explanation: 'Structs are ideal for representing real-world objects like Students, Cars, or Points which have multiple attributes.',
                estimatedTime: 4,
                relatedLesson: 'Structures → Array of Structs',
                commonMistake: 'Not initializing char array correctly or using wrong format specifiers'
            },
            {
                id: 'p8-3',
                title: 'Rectangle Struct',
                description: 'Create a "Rectangle" struct with length and width. Write a program to calculate the area of a rectangle with length 10 and width 5.',
                inputFormat: 'None',
                outputFormat: 'Print the area.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nstruct Rectangle {\n    int length;\n    int width;\n};\n\nint main() {\n    // Calculate and print area\n    return 0;\n}',
                hint: 'Area = length * width',
                solution: '#include <stdio.h>\n\nstruct Rectangle {\n    int length;\n    int width;\n};\n\nint main() {\n    struct Rectangle r = {10, 5};\n    int area = r.length * r.width;\n    printf("%d", area);\n    return 0;\n}',
                difficulty: 'medium',
                concept: 'Structures',
                test_cases: [
                    { expected_output: '50' }
                ],
                explanation: 'You can perform calculations using the data stored inside struct members.',
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
                description: 'Write a program to open a file named "test.txt" in write mode and save the string "C is fun" to it.',
                inputFormat: 'None',
                outputFormat: 'Creates a file with required content.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    FILE *fp;\n    // Open and write\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("test.txt", "w");\n    return 0;\n}',
                    'python': 'with open("test.txt", "w") as f:\n    f.write("C is fun")',
                    'java': 'import java.io.FileWriter;\npublic class Solution {\n    public static void main(String[] args) {\n        try { FileWriter fw = new FileWriter("test.txt"); } catch(Exception e) {}\n    }\n}'
                },
                hint: 'fp = fopen("test.txt", "w"); fprintf(fp, "C is fun"); fclose(fp);',
                solution: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("test.txt", "w");\n    if(fp == NULL) return 1;\n    fprintf(fp, "C is fun");\n    fclose(fp);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'File I/O',
                test_cases: [
                    { expected_output: '' }
                ],
                explanation: 'Files allow you to persist data beyond the life of the program. "w" mode creates a new file or overwrites an existing one.',
                estimatedTime: 4,
                relatedLesson: 'File I/O → File Operations',
                commonMistake: 'Forgetting to close the file or not checking if fopen() succeeded'
            },
            {
                id: 'p9-2',
                title: 'Read and Display File Content',
                description: 'Open a file named "data.txt" in read mode and print its entire contents to the console.',
                inputFormat: 'None (assumes data.txt exists).',
                outputFormat: 'Print file content.',
                constraints: 'None',
                initialCode: '#include <stdio.h>\n\nint main() {\n    FILE *fp;\n    char ch;\n    // Open file in read mode and display content\n    return 0;\n}',
                starter_codes: {
                    'c': '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("data.txt", "r");\n    return 0;\n}',
                    'python': 'with open("data.txt", "r") as f:\n    print(f.read())',
                    'javascript': 'const fs = require("fs");\nconst content = fs.readFileSync("data.txt", "utf8");\nconsole.log(content);'
                },
                hint: 'Use fgetc() to read characters until EOF.',
                solution: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("data.txt", "r");\n    if(fp == NULL) {\n        printf("File not found");\n        return 1;\n    }\n    char ch;\n    while((ch = fgetc(fp)) != EOF) printf("%c", ch);\n    fclose(fp);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'File I/O',
                test_cases: [
                    { expected_output: 'depends on file content' }
                ],
                explanation: 'Reading from a file requires opening it in "r" mode and iterating until the End Of File (EOF) marker is reached.',
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
                description: 'Implement a linear search algorithm to find the index of a target value in a given array. If not found, return -1.',
                inputFormat: 'An integer n, followed by n integers (the array), then the target value.',
                outputFormat: 'Print the index of the first occurrence of the target, or -1.',
                constraints: '1 <= n <= 1000',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n, target;\n    scanf("%d", &n);\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    scanf("%d", &target);\n    // Find the target index\n    return 0;\n}',
                starter_codes: {
                    'c': 'int linearSearch(int* arr, int n, int target) {\n\n}',
                    'java': 'public int linearSearch(int[] arr, int target) {\n\n}',
                    'python': 'def linearSearch(arr, target):\n    pass',
                    'javascript': 'function linearSearch(arr, target) {\n\n}'
                },
                hint: 'Loop through array and check if element equals search value.',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 7, 3, 9, 2, 7, 5};\n    int search = 7;\n    int found = 0;\n    for(int i=0; i<7; i++) {\n        if(arr[i] == search) {\n            found = 1;\n            printf("Found at index %d", i);\n            break;\n        }\n    }\n    if(!found) printf("Not found");\n    return 0;\n}',
                difficulty: 'easy',
                concept: 'Searching',
                test_cases: [
                    { stdin: '7\n1 7 3 9 2 7 5\n7', expected_output: 'Found at index 1' }
                ],
                explanation: 'Linear search checks every element from the beginning to the end. It is simple but slow for very large arrays (O(n)).',
                estimatedTime: 3,
                relatedLesson: 'Searching → Linear Search',
                commonMistake: 'Not breaking after finding first occurrence'
            },
            {
                id: 'p10-2',
                title: 'Bubble Sort',
                description: 'Implement the Bubble Sort algorithm to sort an array of n integers in ascending order.',
                inputFormat: 'Integer n followed by n integers.',
                outputFormat: 'Print the sorted array separated by spaces.',
                constraints: '1 <= n <= 100',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int arr[n];\n    for(int i=0; i<n; i++) scanf("%d", &arr[i]);\n    // Sort using bubble sort\n    return 0;\n}',
                starter_codes: {
                    'c': 'void bubbleSort(int* arr, int n) {\n\n}',
                    'python': 'def bubbleSort(arr):\n    pass',
                    'java': 'public void bubbleSort(int[] arr) {\n\n}'
                },
                hint: 'Compare adjacent elements and swap if needed.',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {5, 2, 8, 1, 9};\n    int n = 5;\n    for(int i=0; i<n-1; i++) {\n        for(int j=0; j<n-i-1; j++) {\n            if(arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n    for(int i=0; i<n; i++) printf("%d ", arr[i]);\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Sorting',
                test_cases: [
                    { stdin: '5\n5 2 8 1 9', expected_output: '1 2 5 8 9 ' }
                ],
                explanation: 'Bubble sort repeatedly swaps adjacent elements if they are in the wrong order. The largest elements "bubble" to the end of the array.',
                estimatedTime: 6,
                relatedLesson: 'Sorting → Bubble Sort',
                commonMistake: 'Wrong loop conditions or not swapping correctly'
            },
            {
                id: 'search-rotated-1',
                title: 'Search in Rotated Sorted Array',
                difficulty: 'medium',
                concept: 'Binary Search',
                description: 'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length).\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.',
                inputFormat: 'An integer array nums and an integer target.',
                outputFormat: 'The 0-based index of target, or -1.',
                constraints: '1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.',
                initialCode: 'int search(int* nums, int numsSize, int target) {\n    // Implementation here\n    return -1;\n}',
                starter_codes: {
                    'c': 'int search(int* nums, int numsSize, int target) {\n\n}',
                    'cpp': 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};',
                    'java': 'class Solution {\n    public int search(int[] nums, int target) {\n\n    }\n}',
                    'python': 'class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        ',
                    'javascript': '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar search = function(nums, target) {\n    \n};'
                },
                hint: 'Modified binary search: determine which half is sorted.',
                solution: '// Standard O(log n) Binary Search approach',
                test_cases: [
                    { stdin: '[4,5,6,7,0,1,2]\n0', expected_output: '4' },
                    { stdin: '[4,5,6,7,0,1,2]\n3', expected_output: '-1' }
                ],
                explanation: 'Identify which half of the array is sorted and check if the target lies within it.',
                estimatedTime: 15
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
                description: 'Implement a recursive function to calculate the factorial of an integer n.',
                inputFormat: 'An integer n.',
                outputFormat: 'Return n!.',
                constraints: '0 <= n <= 12',
                initialCode: '#include <stdio.h>\n\nint factorial(int n) {\n    // Base case and recursive case\n    return 1;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d", factorial(n));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int factorial(int n) {\n\n}',
                    'python': 'def factorial(n):\n    pass',
                    'java': 'public int factorial(int n) {\n\n}',
                    'javascript': 'function factorial(n) {\n\n}'
                },
                hint: 'factorial(n) = n * factorial(n-1); Base case: if n==0 return 1',
                solution: '#include <stdio.h>\n\nint factorial(int n) {\n    if(n == 0 || n == 1) return 1;\n    return n * factorial(n-1);\n}\n\nint main() {\n    printf("%d", factorial(5));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Recursion',
                test_cases: [
                    { stdin: '5', expected_output: '120' },
                    { stdin: '0', expected_output: '1' }
                ],
                explanation: 'Recursion involves a function calling itself with a smaller problem. Every recursive function must have a base case to prevent infinite loops.',
                estimatedTime: 5,
                relatedLesson: 'Recursion → Factorial',
                commonMistake: 'Missing base case or infinite recursion'
            },
            {
                id: 'p11-2',
                title: 'Fibonacci Number',
                description: 'Calculate the nth Fibonacci number using a recursive approach.',
                inputFormat: 'An integer n.',
                outputFormat: 'Return the nth Fibonacci number.',
                constraints: '0 <= n <= 20',
                initialCode: '#include <stdio.h>\n\nint fibonacci(int n) {\n    // Calculate nth Fibonacci number\n    return 0;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d", fibonacci(n));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int fibonacci(int n) {\n\n}',
                    'python': 'def fibonacci(n):\n    pass',
                    'java': 'public int fibonacci(int n) {\n\n}'
                },
                hint: 'fibonacci(n) = fibonacci(n-1) + fibonacci(n-2); Base cases: fib(0)=0, fib(1)=1',
                solution: '#include <stdio.h>\n\nint fibonacci(int n) {\n    if(n == 0) return 0;\n    if(n == 1) return 1;\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n\nint main() {\n    printf("%d", fibonacci(6));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Recursion',
                test_cases: [
                    { stdin: '6', expected_output: '8' },
                    { stdin: '0', expected_output: '0' }
                ],
                explanation: 'The Fibonacci sequence is defined by the sum of the two preceding numbers. Fibonacci(n) = Fibonacci(n-1) + Fibonacci(n-2).',
                estimatedTime: 5,
                relatedLesson: 'Recursion → Fibonacci',
                commonMistake: 'Wrong base cases or incorrect addition'
            },
            {
                id: 'p11-3',
                title: 'Power using Recursion',
                description: 'Calculate the value of base^exp using a recursive function.',
                inputFormat: 'Two integers: base and exp.',
                outputFormat: 'Return base raised to exp.',
                constraints: '0 <= base, exp <= 10',
                initialCode: '#include <stdio.h>\n\nint power(int base, int exp) {\n    // Calculate base^exp recursively\n    return 1;\n}\n\nint main() {\n    int b, e;\n    scanf("%d %d", &b, &e);\n    printf("%d", power(b, e));\n    return 0;\n}',
                starter_codes: {
                    'c': 'int power(int base, int exp) {\n\n}',
                    'python': 'def power(base, exp):\n    pass',
                    'java': 'public int power(int base, int exp) {\n\n}'
                },
                hint: 'power(base, exp) = base * power(base, exp-1); Base case: if exp==0 return 1',
                solution: '#include <stdio.h>\n\nint power(int base, int exp) {\n    if(exp == 0) return 1;\n    return base * power(base, exp-1);\n}\n\nint main() {\n    printf("%d", power(2, 5));\n    return 0;\n}',
                difficulty: 'hard',
                concept: 'Recursion',
                test_cases: [
                    { stdin: '2 5', expected_output: '32' },
                    { stdin: '3 0', expected_output: '1' }
                ],
                explanation: 'Base raised to a power can be seen as (base * base^(exp-1)). The simplest case is base^0 = 1.',
                estimatedTime: 4,
                relatedLesson: 'Recursion → Power Function',
                commonMistake: 'Wrong base case or incorrect recursion logic'
            }
        ]
    }
];

