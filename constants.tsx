
import { Language, Challenge, LessonModule } from './types';
import { C_CURRICULUM } from './data/cCurriculum';
import { JAVA_CURRICULUM } from './data/javaCurriculum';
import { PYTHON_CURRICULUM } from './data/pythonCurriculum';
import { JAVASCRIPT_CURRICULUM } from './data/javascriptCurriculum';
import { CPP_CURRICULUM } from './data/cppCurriculum';
import { SQL_CURRICULUM } from './data/sqlCurriculum';
import { DSA_CURRICULUM } from './data/dsaCurriculum';

export const LANGUAGES: Language[] = [
  {
    id: 'c',
    name: 'C Programming',
    icon: '/icons/c_official.svg',
    level: 'Beginner to Advanced',
    stats: '40 Lessons • 40 Quizzes',
    color: 'blue',
    description: 'Master the mother of all modern languages. Build performance-critical systems and understand memory management.'
  },
  {
    id: 'java',
    name: 'Java',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    level: 'Intermediate to Advanced',
    stats: '60 Lessons • 15 Quizzes',
    color: 'emerald',
    description: 'Build robust, scalable enterprise applications with the most trusted object-oriented language.'
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    level: 'Beginner to Advanced',
    stats: '44 Lessons • 44 Quizzes',
    color: 'indigo',
    description: 'The world\'s most popular language for AI, data science, and rapid development. Clean, powerful, and versatile.'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    level: 'Fullstack Ready',
    stats: '90 Lessons • 25 Quizzes',
    color: 'amber',
    description: 'Master the language of the web. Build interactive frontends and scalable backends with Node.js.'
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    level: 'Competitive Coding',
    stats: '55 Lessons • 18 Quizzes',
    color: 'blue',
    description: 'Push the boundaries of performance. Master systems programming, game development, and high-frequency trading.'
  },
  {
    id: 'dsa',
    name: 'DSA',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/thealgorithms/thealgorithms-original.svg',
    level: 'Interview Prep',
    stats: '100 Lessons • 40 Quizzes',
    color: 'rose',
    description: 'Crack any technical interview. Master algorithms and data structures to become a top 1% engineer.'
  },
];

export const CURRICULUM: Record<string, LessonModule[]> = {
  'c': C_CURRICULUM,
  'java': JAVA_CURRICULUM,
  'python': PYTHON_CURRICULUM,
  'javascript': JAVASCRIPT_CURRICULUM,
  'cpp': CPP_CURRICULUM,
  'sql': SQL_CURRICULUM,
  'dsa': DSA_CURRICULUM,
};

export { PYTHON_CURRICULUM };

export const CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Sum of Two',
    difficulty: 'Easy',
    xp: 5,
    description: 'Find two numbers in an array that add up to a target.',
    inputFormat: 'nums = [2,7,11], target = 9',
    outputFormat: '[0, 1]',
    constraints: '2 <= nums.length <= 10^4'
  },
  {
    id: '2',
    title: 'Reverse String',
    difficulty: 'Easy',
    xp: 5,
    description: 'Reverse an array of characters.',
    inputFormat: '["h","e","l","l","o"]',
    outputFormat: '["o","l","l","e","h"]',
    constraints: '1 <= s.length <= 10^5'
  },
  {
    id: '3',
    title: 'Palindrome Number',
    difficulty: 'Medium',
    xp: 10,
    description: 'Check if an integer is a palindrome.',
    inputFormat: 'x = 121',
    outputFormat: 'true',
    constraints: '-2^31 <= x <= 2^31 - 1'
  },
  {
    id: '4',
    title: 'Median of Sorted Arrays',
    difficulty: 'Hard',
    xp: 20,
    description: 'Find the median of two sorted arrays.',
    inputFormat: 'nums1 = [1,3], nums2 = [2]',
    outputFormat: '2.00000',
    constraints: '0 <= n, m <= 1000'
  },
  {
    id: '5',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    xp: 5,
    description: 'Check if a string of brackets is valid.',
    inputFormat: '"()[]{}"',
    outputFormat: 'true',
    constraints: '1 <= s.length <= 10^4'
  },
  {
    id: '6',
    title: 'Longest Substring',
    difficulty: 'Medium',
    xp: 10,
    description: 'Find the length of the longest substring without repeating characters.',
    inputFormat: '"abcabcbb"',
    outputFormat: '3',
    constraints: '0 <= s.length <= 5*10^4'
  },
  {
    id: '7',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    xp: 25,
    description: 'Calculate how much water it can trap after raining.',
    inputFormat: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
    outputFormat: '6',
    constraints: 'n == height.length, 1 <= n <= 2 * 10^4'
  },
  {
    id: '8',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    xp: 30,
    description: 'Merge k sorted linked lists and return it as one sorted list.',
    inputFormat: 'lists = [[1,4,5],[1,3,4],[2,6]]',
    outputFormat: '[1,1,2,3,4,4,5,6]',
    constraints: 'k == lists.length, 0 <= k <= 10^4'
  },
  {
    id: '9',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    xp: 15,
    description: 'Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    inputFormat: 'height = [1,8,6,2,5,4,8,3,7]',
    outputFormat: '49',
    constraints: 'n == height.length, 2 <= n <= 10^5'
  },
  {
    id: '10',
    title: 'Coin Change',
    difficulty: 'Medium',
    xp: 15,
    description: 'Find the fewest number of coins that you need to make up a specific amount.',
    inputFormat: 'coins = [1,2,5], amount = 11',
    outputFormat: '3',
    constraints: '1 <= coins.length <= 12, 0 <= amount <= 10^4'
  },
  {
    id: '11',
    title: 'Binary Search',
    difficulty: 'Easy',
    xp: 5,
    description: 'Find the index of a target element in a sorted array.',
    inputFormat: 'nums = [-1,0,3,5,9,12], target = 9',
    outputFormat: '4',
    constraints: '1 <= nums.length <= 10^4'
  },
  {
    id: '12',
    title: 'Merge Sort implementation',
    difficulty: 'Medium',
    xp: 15,
    description: 'Sort an array using the divide and conquer approach.',
    inputFormat: 'nums = [5,2,3,1]',
    outputFormat: '[1,2,3,5]',
    constraints: '1 <= nums.length <= 5 * 10^4'
  },
  {
    id: '13',
    title: 'Word Search',
    difficulty: 'Hard',
    xp: 30,
    description: 'Determine if a word exists in a 2D grid of characters.',
    inputFormat: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
    outputFormat: 'true',
    constraints: 'm == board.length, n = board[i].length, 1 <= m, n <= 6'
  },
  {
    id: '14',
    title: 'Jump Game',
    difficulty: 'Medium',
    xp: 12,
    description: 'Determine if you are able to reach the last index of an array.',
    inputFormat: 'nums = [2,3,1,1,4]',
    outputFormat: 'true',
    constraints: '1 <= nums.length <= 10^4'
  },
  {
    id: '15',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    xp: 8,
    description: 'Find how many distinct ways you can climb to the top of a staircase.',
    inputFormat: 'n = 3',
    outputFormat: '3',
    constraints: '1 <= n <= 45'
  }
];
