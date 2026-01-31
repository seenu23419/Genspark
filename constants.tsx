
import { Language, Challenge, LessonModule } from './types';
import { C_CURRICULUM } from './data/cCurriculum';
import { JAVA_CURRICULUM } from './data/javaCurriculum';
import { PYTHON_CURRICULUM } from './data/pythonCurriculum';
import { JAVASCRIPT_CURRICULUM } from './data/javascriptCurriculum';
import { CPP_CURRICULUM } from './data/cppCurriculum';
import { SQL_CURRICULUM } from './data/sqlCurriculum';
import { DSA_CURRICULUM } from './data/dsaCurriculum';

export const LANGUAGES: Language[] = [
  { id: 'c', name: 'C Programming', icon: '/icons/c_official.svg', level: 'Beginner to Advanced', stats: '40 Lessons • 40 Quizzes' },
  { id: 'java', name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', level: 'Intermediate to Advanced', stats: '60 Lessons • 15 Quizzes' },
  { id: 'python', name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', level: 'Beginner to Advanced', stats: '44 Lessons • 44 Quizzes' },
  { id: 'javascript', name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', level: 'Fullstack Ready', stats: '90 Lessons • 25 Quizzes' },
  { id: 'cpp', name: 'C++', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg', level: 'Competitive Coding', stats: '55 Lessons • 18 Quizzes' },
  { id: 'dsa', name: 'DSA', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/thealgorithms/thealgorithms-original.svg', level: 'Interview Prep', stats: '100 Lessons • 40 Quizzes' },
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
    title: 'Two Sum',
    difficulty: 'Easy',
    xp: 50,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    inputFormat: 'nums = [2,7,11,15], target = 9',
    outputFormat: '[0, 1]',
    constraints: '2 <= nums.length <= 10^4'
  }
];
