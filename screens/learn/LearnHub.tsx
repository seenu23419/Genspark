
import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, GraduationCap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES, CURRICULUM } from '../../constants';
import { Language } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Outcome descriptions for each language
const LANGUAGE_OUTCOMES: Record<string, string> = {
  'c': 'Build a strong foundation in C programming',
  'java': 'Master object-oriented programming with Java',
  'python': 'Learn versatile Python for any project',
  'javascript': 'Create interactive web applications',
  'cpp': 'Develop high-performance systems and games',
  'sql': 'Master databases and data queries',
  'htmlcss': 'Build beautiful, responsive web designs',
  'dsa': 'Ace technical interviews and code challenges',
  'fullstack': 'Build complete web applications from scratch',
};

// Difficulty mapping
const DIFFICULTY_MAP: Record<string, 'Beginner' | 'Intermediate' | 'Advanced'> = {
  'c': 'Beginner',
  'java': 'Intermediate',
  'python': 'Beginner',
  'javascript': 'Beginner',
  'cpp': 'Advanced',
  'sql': 'Beginner',
  'htmlcss': 'Beginner',
  'dsa': 'Intermediate',
  'fullstack': 'Intermediate',
};

// Section helper
interface CourseSection {
  title: string;
  description?: string;
  courses: Language[];
  showBadge: boolean;
}

const LearnHub: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Detect user learning state
    const userState = useMemo(() => {
        if (!user) return { state: 'no_path_selected' as const, activePath: null, completedBeginnerPaths: [] };

        const lastLanguageId = user.lastLanguageId || null;
        const modules = lastLanguageId ? (CURRICULUM as any)[lastLanguageId] || [] : [];
        
        // Calculate total lessons and completed for this path
        const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
        const completedCount = user.completedLessonIds?.filter((id: string) => {
            return modules.some((m: any) => m.lessons.some((l: any) => l.id === id));
        }).length || 0;

        // Find all completed beginner paths
        const beginnerLanguages = LANGUAGES.filter(lang => DIFFICULTY_MAP[lang.id] === 'Beginner').map(l => l.id);
        const completedBeginnerPaths = beginnerLanguages.filter(langId => {
            const langModules = (CURRICULUM as any)[langId] || [];
            const totalLessonsInLang = langModules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
            const completedInLang = user.completedLessonIds?.filter((id: string) => {
                return langModules.some((m: any) => m.lessons.some((l: any) => l.id === id));
            }).length || 0;
            
            // Path is completed if user has done all lessons
            return totalLessonsInLang > 0 && completedInLang === totalLessonsInLang;
        });

        if (!lastLanguageId || totalLessons === 0) {
            return { state: 'no_path_selected' as const, activePath: null, completedBeginnerPaths };
        }

        const isPathCompleted = totalLessons > 0 && completedCount === totalLessons;
        const pathName = LANGUAGES.find(l => l.id === lastLanguageId)?.name || 'Unknown';

        if (isPathCompleted) {
            return { 
                state: 'path_completed' as const, 
                activePath: { langId: lastLanguageId, name: pathName, progress: 100 },
                completedBeginnerPaths
            };
        }

        return { 
            state: 'path_in_progress' as const, 
            activePath: { langId: lastLanguageId, name: pathName, progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0 },
            completedBeginnerPaths
        };
    }, [user]);

    // Calculate stats for each language and get starting lesson
    const getLangStats = (langId: string) => {
        const modules = (CURRICULUM as any)[langId] || [];
        const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
        
        const completedCount = user?.completedLessonIds?.filter((id: string) => {
            return modules.some((m: any) => m.lessons.some((l: any) => l.id === id));
        }).length || 0;
        
        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        
        // Find next lesson to learn or first lesson - always ensure we have a valid ID
        let nextLessonId = null;
        
        // If this is the language they were last learning, use their last lesson
        if (user?.lastLanguageId === langId && user?.lastLessonId) {
            nextLessonId = user.lastLessonId;
        } else if (progressPercent === 0) {
            // Brand new to this language - start at first lesson
            if (modules.length > 0 && modules[0].lessons?.length > 0) {
                nextLessonId = modules[0].lessons[0].id;
            }
        } else {
            // In progress - find next incomplete lesson or show lessons list
            outer: for (const module of modules) {
                for (const lesson of module.lessons || []) {
                    if (!user?.completedLessonIds?.includes(lesson.id)) {
                        nextLessonId = lesson.id;
                        break outer;
                    }
                }
            }
            // If no incomplete found but has progress, default to first lesson to browse
            if (!nextLessonId && modules.length > 0 && modules[0].lessons?.length > 0) {
                nextLessonId = modules[0].lessons[0].id;
            }
        }
        
        return { progressPercent, nextLessonId, langId, hasProgress: progressPercent > 0 };
    };

    // Organize courses into sections (state-aware)
    const sections = useMemo((): CourseSection[] => {
        let filtered = LANGUAGES.filter(lang =>
            lang.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Categorize courses
        const beginnerCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Beginner');
        const intermediateCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Intermediate');
        const advancedCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Advanced');

        // Build sections based on user state
        const sections: CourseSection[] = [];

        // SECTION 1: Start Here / Continue Learning (state-aware)
        if (beginnerCourses.length > 0) {
            const isPathInProgress = userState.state === 'path_in_progress' && userState.activePath;
            
            if (isPathInProgress) {
                // Show only active path if in progress
                const activeLang = LANGUAGES.find(l => l.id === userState.activePath?.langId);
                if (activeLang && beginnerCourses.some(c => c.id === activeLang.id)) {
                    sections.push({
                        title: 'Continue Learning',
                        description: `You're learning ${userState.activePath?.name}. Keep going!`,
                        courses: [activeLang],
                        showBadge: false, // Don't show badge for active path
                    });
                }
            } else {
                // Show Start Here when no path selected
                sections.push({
                    title: 'Start Here',
                    description: 'Ready to begin? C Programming is the best foundation.',
                    courses: [beginnerCourses[0]],
                    showBadge: true,
                });
            }

            // SECTION 2: Popular for Beginners (other beginner courses)
            if (beginnerCourses.length > 1) {
                let otherCourses = beginnerCourses.slice(1);
                
                // If path is in progress, filter out the active path
                if (isPathInProgress && userState.activePath) {
                    otherCourses = otherCourses.filter(c => c.id !== userState.activePath?.langId);
                }
                
                if (otherCourses.length > 0) {
                    const helperText = isPathInProgress 
                        ? 'Explore after completing your current path'
                        : 'Once comfortable with C, explore these paths';
                    
                    sections.push({
                        title: 'Popular for Beginners',
                        description: helperText,
                        courses: otherCourses,
                        showBadge: false,
                    });
                }
            }
        }

        // SECTION 3: Build Advanced Skills (lock if beginner not completed)
        const supportingSkills = [...intermediateCourses, ...advancedCourses];
        if (supportingSkills.length > 0) {
            const isBeginnerCompleted = userState.completedBeginnerPaths.length > 0;
            
            sections.push({
                title: 'Build Advanced Skills',
                description: isBeginnerCompleted 
                    ? 'Continue growing your skills'
                    : 'Recommended after completing a beginner path',
                courses: supportingSkills,
                showBadge: false,
            });
        }

        return sections;
    }, [searchQuery, userState]);

    // Render a single course card
    const renderCourseCard = (lang: Language, isFirst: boolean, showBadge: boolean, sectionIndex: number) => {
        const stats = getLangStats(lang.id);
        const difficulty = DIFFICULTY_MAP[lang.id];
        const isCProgramming = lang.id === 'c' && isFirst && userState.state === 'no_path_selected';
        const isActivePathCard = lang.id === userState.activePath?.langId;
        const isBeginnerCompleted = userState.completedBeginnerPaths.length > 0;
        const isAdvancedSection = sectionIndex >= 2; // Adjusted for state-aware sections
        const isAdvancedLocked = isAdvancedSection && !isBeginnerCompleted && userState.state !== 'no_path_selected';
        
        const handleClick = () => {
            if (!isAdvancedLocked) {
                navigate(`/track/${lang.id}`);
            }
        };
        
        return (
            <div
                key={lang.id}
                onClick={handleClick}
                className={`group relative rounded-2xl cursor-pointer overflow-hidden transition-all active:scale-[0.98] ${
                    isAdvancedLocked ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                    isCProgramming
                        ? 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 bg-slate-900 border-2 border-indigo-500 p-6 md:p-8 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40'
                        : isActivePathCard
                        ? 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 bg-slate-900 border-2 border-indigo-500 p-6 md:p-8 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40'
                        : 'bg-slate-900/80 border border-slate-800 p-5 md:p-6 shadow-lg hover:border-slate-700 hover:bg-slate-900'
                }`}
            >
                {/* Background Decoration */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-all ${
                    isCProgramming || isActivePathCard
                        ? 'bg-indigo-500/20 group-hover:bg-indigo-500/25'
                        : 'bg-indigo-500/5 group-hover:bg-indigo-500/10'
                }`}></div>

                {/* Header with Icon and Badge */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`${(isCProgramming || isActivePathCard) ? 'w-16 h-16 md:w-20 md:h-20' : 'w-14 h-14 md:w-16 md:h-16'} bg-white/5 rounded-xl flex items-center justify-center p-2 shadow-inner group-hover:bg-white/10 transition-all`}>
                        <img
                            src={lang.icon}
                            alt={lang.name}
                            className="w-full h-full object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all"
                        />
                    </div>
                    {showBadge && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Beginner
                        </span>
                    )}
                </div>

                {/* Course Name */}
                <h3 className={`font-black text-white mb-2 group-hover:text-indigo-300 transition-colors ${
                    (isCProgramming || isActivePathCard) ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                }`}>
                    {lang.name}
                </h3>

                {/* Outcome Description */}
                <p className={`font-medium mb-6 leading-relaxed ${
                    (isCProgramming || isActivePathCard) ? 'text-slate-300 text-base md:text-lg' : 'text-slate-300 text-sm md:text-base'
                }`}>
                    {LANGUAGE_OUTCOMES[lang.id] || `Learn ${lang.name}`}
                </p>

                {/* Beginner Assurance Text - Only for C Programming or Active Path */}
                {isCProgramming && (
                    <p className="text-slate-500 text-xs md:text-sm font-medium mb-6 italic">
                        Designed for absolute beginners
                    </p>
                )}

                {/* CTA Button - Primary or Secondary */}
                {isCProgramming ? (
                    <div className="space-y-3">
                        <button className="w-full py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-widest text-sm md:text-base transition-all flex items-center justify-center gap-2 px-4 group/btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95">
                            <span>Start C Programming</span>
                        </button>
                        <p className="text-slate-500 text-xs md:text-sm font-medium text-center italic">
                            Best choice if you're new to coding
                        </p>
                    </div>
                ) : isActivePathCard ? (
                    <div className="space-y-3">
                        <button className="w-full py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-widest text-sm md:text-base transition-all flex items-center justify-center gap-2 px-4 group/btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95">
                            <span>Continue {lang.name}</span>
                        </button>
                        <p className="text-slate-500 text-xs md:text-sm font-medium text-center italic">
                            You're {userState.activePath?.progress}% complete
                        </p>
                    </div>
                ) : isAdvancedLocked ? (
                    <div className="flex items-center text-slate-600 font-semibold text-sm">
                        <span>Locked</span>
                    </div>
                ) : sectionIndex === 1 ? (
                    <button className="px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-300 rounded-lg font-semibold text-sm transition-colors border border-slate-700/50 hover:border-slate-600">
                        Explore
                    </button>
                ) : (
                    <div className="flex items-center text-slate-500 group-hover:text-slate-400 font-semibold text-sm transition-colors">
                        <span>Explore</span>
                        <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24">
            {/* Header */}
            <header className="space-y-1 md:space-y-3 px-1">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3">
                    <GraduationCap className="text-indigo-500 w-8 h-8 md:w-9 md:h-9" />
                    Learning Paths
                </h1>
                <p className="text-slate-400 font-medium text-base md:text-lg max-w-2xl">Start with one clear path. No prior coding experience required.</p>
            </header>

            {/* Minimal Search - only show when needed */}
            {searchQuery === '' && sections.length <= 3 ? null : (
                <div className="flex flex-col md:flex-row gap-4 px-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Find a language..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white transition-all shadow-lg text-sm md:text-base"
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="space-y-12 md:space-y-16">
                {sections.map((section, sectionIndex) => {
                    // Skip rendering advanced section if not expanded and not searching
                    const isAdvancedSection = section.title === 'Build Advanced Skills';
                    const shouldRender = !isAdvancedSection || showAdvanced || searchQuery !== '';

                    if (!shouldRender) return null;

                    return (
                        <section key={sectionIndex} className="space-y-4">
                            {/* Section Header */}
                            <div className={`px-1 ${isAdvancedSection && !showAdvanced ? 'opacity-40' : ''}`}>
                                <h2 className={`font-black mb-1 ${
                                    sectionIndex === 0 
                                        ? 'text-2xl md:text-3xl text-white' 
                                        : 'text-lg md:text-xl text-slate-300'
                                }`}>
                                    {section.title}
                                </h2>
                                {section.description && (
                                    <p className={`font-medium ${
                                        sectionIndex === 0
                                            ? 'text-slate-400 text-base'
                                            : 'text-slate-500 text-sm md:text-base'
                                    }`}>
                                        {section.description}
                                    </p>
                                )}
                                
                                {/* Helper text for sections */}
                                {sectionIndex === 1 && (
                                    <p className="text-slate-600 text-xs md:text-sm font-medium mt-2">
                                        Recommended after completing C Programming
                                    </p>
                                )}
                                {isAdvancedSection && (
                                    <p className="text-slate-600 text-xs md:text-sm font-medium mt-2">
                                        Unlock after finishing a beginner path
                                    </p>
                                )}
                            </div>

                            {/* Section Divider (subtle, only between sections) */}
                            {sectionIndex > 0 && (
                                <div className="h-px bg-gradient-to-r from-slate-700/0 via-slate-700/20 to-slate-700/0 my-6"></div>
                            )}

                            {/* Course Grid */}
                            <div className={`${
                                sectionIndex === 0 ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
                            } gap-4 md:gap-6 ${isAdvancedSection && !showAdvanced ? 'opacity-40 pointer-events-none' : ''}`}>
                                {section.courses.map((course, courseIndex) => 
                                    renderCourseCard(course, sectionIndex === 0 && courseIndex === 0, section.showBadge, sectionIndex)
                                )}
                            </div>
                        </section>
                    );
                })}

                {/* Collapse/Expand Advanced Paths */}
                {!showAdvanced && sections.some(s => s.title === 'Build Advanced Skills') && searchQuery === '' && (
                    <div className="text-center">
                        <button
                            onClick={() => setShowAdvanced(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-slate-300 font-semibold text-sm transition-colors"
                        >
                            <span>Explore advanced paths</span>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {sections.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-400 text-lg">No courses found. Try a different search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearnHub;
