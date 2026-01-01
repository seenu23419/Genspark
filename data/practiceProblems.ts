
export interface PracticeProblem {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    hint: string;
    solution: string;
}

export interface PracticeTopic {
    id: string;
    title: string;
    problems: PracticeProblem[];
}

export const PRACTICE_TOPICS: PracticeTopic[] = [
    {
        id: 'intro',
        title: 'Introduction',
        problems: [
            {
                id: 'p1',
                title: 'Hello World',
                description: 'Write a program that prints "Hello, GenSpark!" to the console.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}',
                hint: 'Use the printf() function.',
                solution: '#include <stdio.h>\n\nint main() {\n    printf("Hello, GenSpark!");\n    return 0;\n}'
            },
            {
                id: 'p2',
                title: 'Basic Addition',
                description: 'Declare two integers a=5 and b=10. Print their sum.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int a = 5;\n    int b = 10;\n    // Print their sum\n    return 0;\n}',
                hint: 'Use printf("%d", a + b);',
                solution: '#include <stdio.h>\n\nint main() {\n    int a = 5;\n    int b = 10;\n    printf("%d", a + b);\n    return 0;\n}'
            }
        ]
    },
    {
        id: 'flow',
        title: 'Flow Control',
        problems: [
            {
                id: 'p3',
                title: 'Even or Odd',
                description: 'Write a program that checks if a number x=7 is even or odd.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int x = 7;\n    // Use if-else to print "Even" or "Odd"\n    return 0;\n}',
                hint: 'Use the modulus operator: x % 2 == 0',
                solution: '#include <stdio.h>\n\nint main() {\n    int x = 7;\n    if (x % 2 == 0) printf("Even");\n    else printf("Odd");\n    return 0;\n}'
            }
        ]
    },
    {
        id: 'functions',
        title: 'Functions',
        problems: [
            {
                id: 'p4',
                title: 'Square Function',
                description: 'Write a function "square" that returns the square of an integer.',
                initialCode: '#include <stdio.h>\n\n// Write square function here\n\nint main() {\n    printf("%d", square(5));\n    return 0;\n}',
                hint: 'The function signature should be: int square(int n)',
                solution: '#include <stdio.h>\n\nint square(int n) { return n * n; }\n\nint main() {\n    printf("%d", square(5));\n    return 0;\n}'
            }
        ]
    },
    {
        id: 'arrays',
        title: 'Arrays',
        problems: [
            {
                id: 'p5',
                title: 'Array Sum',
                description: 'Calculate the sum of all elements in the array {1, 2, 3, 4, 5}.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int sum = 0;\n    // Loop and add to sum\n    return 0;\n}',
                hint: 'Use a for loop: for(int i=0; i<5; i++) sum += arr[i];',
                solution: '#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for(int i=0; i<5; i++) sum += arr[i];\n    printf("%d", sum);\n    return 0;\n}'
            }
        ]
    },
    {
        id: 'pointers',
        title: 'Pointers',
        problems: [
            {
                id: 'p6',
                title: 'Swap Values',
                description: 'Swap the values of two variables using pointers.',
                initialCode: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // Write swap logic here\n}\n\nint main() {\n    int x = 10, y = 20;\n    swap(&x, &y);\n    printf("x=%d, y=%d", x, y);\n    return 0;\n}',
                hint: 'Use a temporary variable: int temp = *a; *a = *b; *b = temp;',
                solution: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 10, y = 20;\n    swap(&x, &y);\n    printf("x=%d, y=%d", x, y);\n    return 0;\n}'
            }
        ]
    },
    {
        id: 'strings',
        title: 'Strings',
        problems: [
            {
                id: 'p7',
                title: 'String Length',
                description: 'Write a manual function to find the length of a string (don\'t use strlen).',
                initialCode: '#include <stdio.h>\n\nint myLen(char *s) {\n    // Loop until null terminator\n    return 0;\n}\n\nint main() {\n    printf("%d", myLen("GenSpark"));\n    return 0;\n}',
                hint: 'While s[i] is not \'\\0\', increment i.',
                solution: '#include <stdio.h>\n\nint myLen(char *s) {\n    int i = 0;\n    while(s[i] != \'\\0\') i++;\n    return i;\n}\n\nint main() {\n    printf("%d", myLen("GenSpark"));\n    return 0;\n}'
            }
        ]
    },
    {
        id: 'structs',
        title: 'Structures',
        problems: [
            {
                id: 'p8',
                title: 'Point Struct',
                description: 'Define a struct "Point" with x and y coordinates. Initialize p1(10, 20) and print it.',
                initialCode: '#include <stdio.h>\n\n// Define struct here\n\nint main() {\n    // Initialize and print\n    return 0;\n}',
                hint: 'struct Point { int x; int y; };',
                solution: '#include <stdio.h>\n\nstruct Point { int x; int y; };\n\nint main() {\n    struct Point p1 = {10, 20};\n    printf("(%d, %d)", p1.x, p1.y);\n    return 0;\n}'
            }
        ]
    },
    {
        id: 'files',
        title: 'Files',
        problems: [
            {
                id: 'p9',
                title: 'Write File',
                description: 'Open a file named "test.txt" and write "C is fun" to it.',
                initialCode: '#include <stdio.h>\n\nint main() {\n    FILE *fp;\n    // Open and write\n    return 0;\n}',
                hint: 'fp = fopen("test.txt", "w"); fprintf(fp, "C is fun"); fclose(fp);',
                solution: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("test.txt", "w");\n    if(fp == NULL) return 1;\n    fprintf(fp, "C is fun");\n    fclose(fp);\n    return 0;\n}'
            }
        ]
    }
];
