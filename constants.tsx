
import { Language, Challenge, LessonModule } from './types';
import { C_CURRICULUM } from './data/cCurriculum';

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
  'c': C_CURRICULUM,
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
