# Python Course UI Components

Beautiful, modern React components for displaying the Python curriculum with excellent visual design.

## Components

### 1. **PythonCourseView** (Main Component)
Complete course browser with lesson selection and progress tracking.

**Features:**
- Course overview with progress tracking
- Beautiful lesson cards with gradient backgrounds
- Lesson selection and navigation
- Completion tracking
- Responsive design

**Usage:**
```tsx
import { PythonCourseView } from './components/PythonCourseView';

export default function App() {
  return <PythonCourseView onBack={() => window.history.back()} />;
}
```

### 2. **PythonLessonView**
Individual lesson display with rich content, quizzes, and code examples.

**Features:**
- Beautiful gradient header with metadata
- Rich content rendering with markdown-like formatting
- Interactive quizzes with answer validation
- Expandable explanations
- Code blocks with copy button
- Lesson completion button

**Usage:**
```tsx
import { PythonLessonView } from './components/PythonLessonView';
import { PYTHON_CURRICULUM } from './constants';

const lesson = PYTHON_CURRICULUM[0].lessons[0];

export default function Page() {
  return (
    <PythonLessonView
      lesson={lesson}
      onComplete={() => console.log('Lesson completed!')}
    />
  );
}
```

### 3. **PythonCurriculumCard**
Displays a module with all its lessons in a beautiful card grid.

**Features:**
- Module header with stats
- Individual lesson cards with gradients
- Topic tags
- Quick stats (quizzes, practice)
- Beautiful typography and icons

**Usage:**
```tsx
import { PythonCurriculumCard } from './components/PythonCurriculumCard';
import { PYTHON_CURRICULUM } from './constants';

const module = PYTHON_CURRICULUM[0];

export default function Page() {
  return (
    <PythonCurriculumCard
      module={module}
      onSelectLesson={(id, title) => console.log(`Selected: ${title}`)}
    />
  );
}
```

### 4. **CodeBlock**
Syntax-highlighted code display with copy functionality.

**Features:**
- Python syntax highlighting
- Copy-to-clipboard button
- Language badge
- Dark theme styling

**Usage:**
```tsx
import { CodeBlock } from './components/CodeBlock';

<CodeBlock
  code={`print("Hello, world!")`}
  language="python"
  title="Hello World Example"
/>
```

### 5. **CodeExamples**
Multiple code examples with tabbed interface and explanations.

**Features:**
- Tabbed interface for multiple examples
- Syntax highlighted code
- Detailed explanations
- Beautiful styling

**Usage:**
```tsx
import { CodeExamples } from './components/CodeBlock';

<CodeExamples
  examples={[
    {
      title: 'Variables',
      code: 'x = 10\ny = 20',
      explanation: 'This declares two integer variables.'
    },
    {
      title: 'Types',
      code: 'print(type(x))',
      explanation: 'Check the type of a variable.'
    }
  ]}
/>
```

## Design Features

### Color Palette
- **Primary:** Blue to Purple gradients
- **Success:** Green to Emerald
- **Warning:** Yellow to Orange
- **Error:** Red with transparency
- **Background:** Slate 900-700 with glassmorphism

### Visual Elements
- Gradient backgrounds
- Glassmorphism (backdrop-blur)
- Smooth transitions and hover effects
- Icon combinations for visual interest
- Responsive grid layouts
- Beautiful typography hierarchy

### Interactive Features
- Expandable quiz sections
- Answer validation with visual feedback
- Explanation toggles
- Copy-to-clipboard functionality
- Progress tracking
- Smooth animations

## Styling with Tailwind CSS

All components use Tailwind CSS for styling. Ensure your project has Tailwind configured.

### Required Tailwind Plugins
- Basic Tailwind (no extra plugins needed)
- Uses standard Tailwind classes

### Dark Mode
Components are built with dark mode as the default theme. Light mode can be added by modifying the base colors.

## Icons

Components use `lucide-react` for icons:
- ChevronDown, ChevronRight (navigation)
- Check, X (validation)
- Copy, CheckCircle (actions)
- BookOpen, Zap, Target, Award (stats)

Install lucide-react:
```bash
npm install lucide-react
```

## Integration with App

### Step 1: Import the course view
```tsx
import { PythonCourseView } from './components/PythonCourseView';
```

### Step 2: Add to your routes
```tsx
// In your router or main App.tsx
<Route path="/python-course" element={<PythonCourseView />} />
```

### Step 3: Style parent container
Ensure the parent container has full height:
```tsx
<div className="min-h-screen">
  <PythonCourseView />
</div>
```

## Responsive Design

All components are fully responsive:
- Mobile: Single column layouts
- Tablet: 2-column grids
- Desktop: Full multi-column layouts
- Responsive typography and spacing

## Customization

### Customize Colors
Edit gradient classes in component files. Examples:
```tsx
// Change primary gradient
className="bg-gradient-to-r from-blue-600 to-purple-600"

// Change to green theme
className="bg-gradient-to-r from-green-600 to-emerald-600"
```

### Customize Lesson Duration
Modify the curriculum data in `constants.tsx`:
```tsx
duration: '15 mins'  // Change as needed
```

### Add Custom Topics
Modify the `topics` array in lesson data:
```tsx
topics: ['Topic 1', 'Topic 2', 'Topic 3']
```

## Performance Optimization

### Image Optimization
- No images included (uses emojis instead)
- Minimal external assets

### Code Splitting
- Each component can be lazy-loaded:
```tsx
const PythonCourseView = lazy(() => import('./components/PythonCourseView'));
```

### Rendering Optimization
- Quiz sections use expandable state (not all rendered at once)
- Content is split into readable chunks
- No unnecessary re-renders

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Accessibility

- Semantic HTML
- ARIA labels for icons
- Keyboard navigation for expandable sections
- Color contrast meets WCAG AA standards
- Screen reader friendly

## Future Enhancements

Potential additions:
- Dark/Light mode toggle
- Font size adjustment
- PDF export
- Progress saving to backend
- Social sharing
- Difficulty levels
- Custom themes
- Lesson bookmarking
- Comment/notes system

## Troubleshooting

### Icons not showing
Ensure `lucide-react` is installed: `npm install lucide-react`

### Styling not applying
Check that Tailwind CSS is properly configured and imported.

### Gradients not rendering
Some older browsers may not support CSS gradients. Add fallback colors:
```tsx
className="bg-blue-600 bg-gradient-to-r from-blue-600 to-purple-600"
```

## License

Same as parent project
