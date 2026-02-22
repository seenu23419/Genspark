import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, GraduationCap, ChevronDown, CheckCircle2, BookOpen, Code2, Star, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LANGUAGES, CURRICULUM } from '../../constants';
import { Language } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// ... (Outcome descriptions and difficulty mapping stay same)
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

interface CourseSection {
    title: string;
    description?: string;
    courses: Language[];
    showBadge: boolean;
}

const LearnHub: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'TRACKS' | 'COMPLETED'>('TRACKS');

    // Handle initial filter from navigation state
    useEffect(() => {
        if (location.state?.initialFilter === 'completed') {
            setActiveTab('COMPLETED');
            // Clear state so it doesn't stick on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Detect user learning state
    const userState = useMemo(() => {
        if (!user) return { state: 'no_path_selected' as const, activePath: null, completedBeginnerPaths: [] };

        const lastLanguageId = user.lastLanguageId || null;
        const modules = lastLanguageId ? (CURRICULUM as any)[lastLanguageId] || [] : [];

        const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
        const completedCount = user.completedLessonIds?.filter((id: string) => {
            return modules.some((m: any) => m.lessons.some((l: any) => l.id === id));
        }).length || 0;

        const beginnerLanguages = LANGUAGES.filter(lang => DIFFICULTY_MAP[lang.id] === 'Beginner').map(l => l.id);
        const completedBeginnerPaths = beginnerLanguages.filter(langId => {
            const langModules = (CURRICULUM as any)[langId] || [];
            const totalLessonsInLang = langModules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
            const completedInLang = user.completedLessonIds?.filter((id: string) => {
                return langModules.some((m: any) => m.lessons.some((l: any) => l.id === id));
            }).length || 0;
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

        if (completedCount === 0) {
            return {
                state: 'path_selected' as const,
                activePath: { langId: lastLanguageId, name: pathName, progress: 0 },
                completedBeginnerPaths
            };
        }

        return {
            state: 'path_in_progress' as const,
            activePath: { langId: lastLanguageId, name: pathName, progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0 },
            completedBeginnerPaths
        };
    }, [user, CURRICULUM]);

    // Get all completed lessons across all paths
    const completedLessons = useMemo(() => {
        if (!user) return [];
        const completed: any[] = [];
        const langIds = Object.keys(CURRICULUM);

        langIds.forEach(langId => {
            const modules = (CURRICULUM as any)[langId] || [];
            const langName = LANGUAGES.find(l => l.id === langId)?.name || langId;
            modules.forEach((mod: any) => {
                mod.lessons.forEach((lesson: any) => {
                    if (user.completedLessonIds?.includes(lesson.id)) {
                        completed.push({ ...lesson, langName, langId });
                    }
                });
            });
        });
        return completed;
    }, [user]);

    const getLangStats = (langId: string) => {
        const modules = (CURRICULUM as any)[langId] || [];
        const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);

        const completedCount = user?.completedLessonIds?.filter((id: string) => {
            return modules.some((m: any) => m.lessons.some((l: any) => l.id === id));
        }).length || 0;

        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        let nextLessonId = null;
        if (user?.lastLanguageId === langId && user?.lastLessonId) {
            nextLessonId = user.lastLessonId;
        } else if (progressPercent === 0) {
            if (modules.length > 0 && modules[0].lessons?.length > 0) {
                nextLessonId = modules[0].lessons[0].id;
            }
        } else {
            outer: for (const module of modules) {
                for (const lesson of module.lessons || []) {
                    if (!user?.completedLessonIds?.includes(lesson.id)) {
                        nextLessonId = lesson.id;
                        break outer;
                    }
                }
            }
            if (!nextLessonId && modules.length > 0 && modules[0].lessons?.length > 0) {
                nextLessonId = modules[0].lessons[0].id;
            }
        }

        return { progressPercent, nextLessonId, langId, hasProgress: progressPercent > 0 };
    };

    const sections = useMemo((): CourseSection[] => {
        const filtered = LANGUAGES.filter(lang =>
            lang.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const beginnerCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Beginner');
        const intermediateCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Intermediate');
        const advancedCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Advanced');

        const sections: CourseSection[] = [];

        if (beginnerCourses.length > 0) {
            const isPathInProgress = userState.state === 'path_in_progress' && userState.activePath;
            const isPathSelected = userState.state === 'path_selected' && userState.activePath;
            const isPathCompleted = userState.state === 'path_completed' && userState.activePath;

            if (isPathInProgress || isPathSelected) {
                const activeLang = LANGUAGES.find(l => l.id === userState.activePath?.langId);
                if (activeLang) {
                    sections.push({
                        title: isPathSelected ? 'Selected Path' : 'Continue Learning',
                        description: isPathSelected
                            ? `You've selected ${activeLang.name}. Ready to begin?`
                            : `You're learning ${activeLang.name}. Keep going!`,
                        courses: [activeLang],
                        showBadge: false,
                    });
                }
            } else if (isPathCompleted) {
                // If current path is completed, show a "Next Recommended" beginner course if available
                const activeLangId = userState.activePath?.langId;
                const nextBeginner = beginnerCourses.find(c => c.id !== activeLangId && !userState.completedBeginnerPaths.includes(c.id));

                if (nextBeginner) {
                    sections.push({
                        title: 'Up Next',
                        description: `You've mastered ${userState.activePath?.name}! Ready for ${nextBeginner.name}?`,
                        courses: [nextBeginner],
                        showBadge: true,
                    });
                } else {
                    // Fallback to the completed path card but with mastered status
                    const activeLang = LANGUAGES.find(l => l.id === activeLangId);
                    if (activeLang) {
                        sections.push({
                            title: 'Path Mastered',
                            description: `Congratulations! You've finished the ${activeLang.name} track.`,
                            courses: [activeLang],
                            showBadge: false,
                        });
                    }
                }
            } else {
                // No path selected, show the default "Start Here" (C)
                sections.push({
                    title: 'Start Here',
                    description: 'Ready to begin? C Programming is the best foundation.',
                    courses: [beginnerCourses[0]],
                    showBadge: true,
                });
            }

            // Other beginner courses
            let otherCourses = beginnerCourses;
            // Filter out the one already shown in the top section
            if (sections.length > 0 && sections[0].courses.length > 0) {
                const mainCourseId = sections[0].courses[0].id;
                otherCourses = otherCourses.filter(c => c.id !== mainCourseId);
            }

            if (otherCourses.length > 0) {
                const helperText = isPathInProgress
                    ? 'Explore after completing your current path'
                    : 'Expand your foundation with these beginner paths';

                sections.push({
                    title: 'More for Beginners',
                    description: helperText,
                    courses: otherCourses,
                    showBadge: false,
                });
            }
        }

        const supportingSkills = [...intermediateCourses, ...advancedCourses];
        if (supportingSkills.length > 0) {
            const isBeginnerCompleted = userState.completedBeginnerPaths.length > 0;

            sections.push({
                title: 'Advanced Skills',
                description: isBeginnerCompleted
                    ? 'Continue growing your skills'
                    : 'Recommended after completing a beginner path',
                courses: supportingSkills,
                showBadge: false,
            });
        }

        return sections;
    }, [searchQuery, userState]);

    const renderCourseCard = (lang: Language, isFirst: boolean, showBadge: boolean, sectionIndex: number) => {
        const stats = getLangStats(lang.id);
        const isPathMastered = stats.progressPercent === 100;
        const isFeaturedCard = sectionIndex === 0;

        // C is only special if nothing else is started/selected
        const isCProgramming = lang.id === 'c' && userState.state === 'no_path_selected';

        const isAdvancedLocked = false;

        const handleClick = () => {
            if (!isAdvancedLocked) {
                // Always set as active path when clicked
                if (user?.lastLanguageId !== lang.id) {
                    console.log(`LearnHub: Switching active path to ${lang.id}`);
                    updateUser({ lastLanguageId: lang.id }).catch(console.error);
                }
                navigate(`/track/${lang.id}`);
            }
        };

        return (
            <div
                key={lang.id}
                onClick={handleClick}
                className={`group relative rounded-xl cursor-pointer overflow-hidden transition-all active:scale-[0.98] ${isAdvancedLocked ? 'opacity-50 cursor-not-allowed' : ''
                    } bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-white/10 p-5 shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-xl hover:shadow-indigo-500/5`}
            >

                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center p-2.5 transition-all group-hover:bg-indigo-500/10">
                        <img
                            src={lang.icon}
                            alt={lang.name}
                            className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                        />
                    </div>
                    {showBadge && (
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${isPathMastered
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/80'
                            }`}>
                            {isPathMastered ? 'Mastered' : 'Beginner'}
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    {lang.name}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6 line-clamp-2">
                    {LANGUAGE_OUTCOMES[lang.id] || `Learn ${lang.name}`}
                </p>

                {isCProgramming && (
                    <p className="text-slate-500 text-xs md:text-sm font-medium mb-6 italic">
                        Designed for absolute beginners
                    </p>
                )}

                {/* Action Section */}
                {isPathMastered ? (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 space-y-5">
                        {/* Achievement State */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle2 size={12} className="shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Mastered</span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 italic">Course successfully completed</p>
                        </div>

                        {/* Focused Next Step */}
                        {(() => {
                            const unmastered = LANGUAGES.filter(l => {
                                const stats = getLangStats(l.id);
                                return stats.progressPercent < 100 && l.id !== lang.id;
                            });

                            if (unmastered.length === 0) return (
                                <div className="py-2 text-center">
                                    <p className="text-[10px] font-bold text-slate-500 italic">
                                        Amazing! You've mastered everything! 🎉
                                    </p>
                                </div>
                            );

                            // Simple Path Logic for Primary recommendation
                            let next: Language | undefined;
                            if (lang.id === 'c') next = unmastered.find(l => l.id === 'dsa');
                            else if (lang.id === 'dsa') next = unmastered.find(l => l.id === 'cpp') || unmastered.find(l => l.id === 'java');
                            if (!next) next = unmastered[0];

                            // Don't show recommendation if it's already the active path
                            const isAlreadyActive = user?.lastLanguageId === next?.id;
                            if (isAlreadyActive) return null;

                            return (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <span className="text-[9px] font-black text-indigo-500/80 uppercase tracking-[0.15em]">Recommended Next</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            updateUser({ lastLanguageId: next!.id }).catch(console.error);
                                            navigate(`/track/${next!.id}`);
                                        }}
                                        className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 group/next"
                                    >
                                        <Zap size={14} className="fill-current group-hover:animate-pulse" />
                                        <span>Start {next.name}</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            );
                        })()}

                        {/* Minimal Browse Link */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const moreSection = document.getElementById('more-beginner-paths');
                                if (moreSection) {
                                    moreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="w-full text-[9px] font-black text-slate-500 hover:text-indigo-500 transition-colors py-1 text-center uppercase tracking-widest"
                        >
                            Or Browse All Available Tracks
                        </button>
                    </div>
                ) : (
                    <div className="mt-auto pt-4">
                        <div className="w-full py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 px-4 group/btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95">
                            <span>Start {lang.name}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24">
            {/* Header */}
            <header className="space-y-4 md:space-y-6 px-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 md:gap-3 uppercase italic">
                            <GraduationCap className="text-indigo-500 w-7 h-7 md:w-8 md:h-8" />
                            Learn Hub
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl">Master coding with curated learning paths.</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-xl p-1 shrink-0 shadow-inner">
                        <button
                            onClick={() => setActiveTab('TRACKS')}
                            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'TRACKS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Browse Tracks
                        </button>
                        <button
                            onClick={() => setActiveTab('COMPLETED')}
                            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <CheckCircle2 size={14} />
                            Completed
                        </button>
                    </div>
                </div>
            </header>

            {activeTab === 'TRACKS' ? (
                <>
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
                                    className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white transition-all shadow-lg text-sm md:text-base"
                                />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="space-y-12 md:space-y-16">
                        {sections.map((section, sectionIndex) => {
                            const isAdvancedSection = section.title === 'Advanced Skills';
                            const shouldRender = true;

                            if (!shouldRender) return null;

                            return (
                                <section key={sectionIndex} className="space-y-4">
                                    <div id={sectionIndex === 1 ? "more-beginner-paths" : undefined} className={`px-1`}>
                                        <h2 className={`font-black mb-1 ${sectionIndex === 0
                                            ? 'text-2xl md:text-3xl text-white'
                                            : 'text-lg md:text-xl text-slate-300'
                                            }`}>
                                            {section.title}
                                        </h2>
                                        {section.description && (
                                            <p className={`font-medium ${sectionIndex === 0
                                                ? 'text-slate-400 text-base'
                                                : 'text-slate-500 text-sm md:text-base'
                                                }`}>
                                                {section.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                        {section.courses.map((course, courseIndex) =>
                                            renderCourseCard(course, sectionIndex === 0 && courseIndex === 0, section.showBadge, sectionIndex)
                                        )}
                                    </div>
                                </section>
                            );
                        })}



                        {sections.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-slate-400 text-lg">No courses found. Try a different search.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Completed Lessons View */
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-sm">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase italic tracking-tight">Your Achievements</h2>
                            <p className="text-slate-500 text-sm font-medium">You have mastered {completedLessons.length} lessons so far.</p>
                        </div>
                        <div className="px-6 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center min-w-[120px]">
                            <div className="text-3xl font-black text-emerald-500">{completedLessons.length}</div>
                            <div className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-0.5">Lessons Done</div>
                        </div>
                    </div>

                    {completedLessons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedLessons.map((lesson, idx) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                                    className="group p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-emerald-500/30 transition-all active:scale-[0.98] text-left shadow-sm"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{lesson.langName}</p>
                                            <h4 className="text-base font-bold text-white truncate">{lesson.title}</h4>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-white/5">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                                <BookOpen size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-500">No lessons completed yet</h3>
                            <p className="text-slate-600 mt-2">Start your first lesson to see it here!</p>
                            <button
                                onClick={() => setActiveTab('TRACKS')}
                                className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm"
                            >
                                Browse Tracks
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LearnHub;
