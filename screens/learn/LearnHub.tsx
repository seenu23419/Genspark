import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, GraduationCap, ChevronDown, CheckCircle2, BookOpen } from 'lucide-react';
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
        let filtered = LANGUAGES.filter(lang =>
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

    const renderCourseCard = (lang: Language, isFirst: boolean, showBadge: boolean, sectionIndex: number) => {
        const stats = getLangStats(lang.id);
        const isPathMastered = stats.progressPercent === 100;
        const isFeaturedCard = sectionIndex === 0;

        // C is only special if nothing else is started/selected
        const isCProgramming = lang.id === 'c' && userState.state === 'no_path_selected';

        const isBeginnerCompleted = userState.completedBeginnerPaths.length > 0;
        const isAdvancedSection = sectionIndex >= 2;
        const isAdvancedLocked = isAdvancedSection && !isBeginnerCompleted && userState.state !== 'no_path_selected';

        const handleClick = () => {
            if (!isAdvancedLocked) {
                // Determine if we should "Swap" the featured path
                // Only swap if:
                // 1. Current path is completed
                // 2. OR No path is selected yet (state is 'no_path_selected')
                // 3. AND we are clicking a different language than the current lastLanguageId
                const isMastered = userState.state === 'path_completed';
                const isNoPath = userState.state === 'no_path_selected';
                const isDifferent = lang.id !== user?.lastLanguageId;

                if ((isMastered || isNoPath) && isDifferent) {
                    console.log(`LearnHub: Swapping featured path from ${user?.lastLanguageId} to ${lang.id}`);
                    updateUser({ lastLanguageId: lang.id }).catch(console.error);
                }

                navigate(`/track/${lang.id}`);
            }
        };

        const borderClass = isPathMastered
            ? 'border-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/30'
            : 'border-indigo-500 shadow-indigo-500/30 hover:shadow-indigo-500/40';

        return (
            <div
                key={lang.id}
                onClick={handleClick}
                className={`group relative rounded-2xl cursor-pointer overflow-hidden transition-all active:scale-[0.98] ${isAdvancedLocked ? 'opacity-50 cursor-not-allowed' : ''
                    } ${isFeaturedCard
                        ? `col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 bg-slate-900 border-2 p-6 md:p-8 shadow-2xl transition-all ${borderClass}`
                        : 'bg-slate-900/80 border border-slate-800 p-5 md:p-6 shadow-lg hover:border-slate-700 hover:bg-slate-900'
                    }`}
            >
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-all ${isFeaturedCard
                    ? (isPathMastered ? 'bg-emerald-500/20 group-hover:bg-emerald-500/25' : 'bg-indigo-500/20 group-hover:bg-indigo-500/25')
                    : 'bg-indigo-500/5 group-hover:bg-indigo-500/10'
                    }`}></div>

                <div className="flex items-start justify-between mb-4">
                    <div className={`${isFeaturedCard ? 'w-16 h-16 md:w-20 md:h-20' : 'w-14 h-14 md:w-16 md:h-16'} bg-white/5 rounded-xl flex items-center justify-center p-2 shadow-inner group-hover:bg-white/10 transition-all`}>
                        <img
                            src={lang.icon}
                            alt={lang.name}
                            className="w-full h-full object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all"
                        />
                    </div>
                    {showBadge && (
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${isPathMastered
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            }`}>
                            {isPathMastered ? 'Mastered' : 'Beginner'}
                        </span>
                    )}
                </div>

                <h3 className={`font-black text-white mb-2 group-hover:text-indigo-300 transition-colors ${isFeaturedCard ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                    }`}>
                    {lang.name}
                </h3>

                <p className={`font-medium mb-6 leading-relaxed ${isFeaturedCard ? 'text-slate-300 text-base md:text-lg' : 'text-slate-300 text-sm md:text-base'
                    }`}>
                    {LANGUAGE_OUTCOMES[lang.id] || `Learn ${lang.name}`}
                </p>

                {isCProgramming && (
                    <p className="text-slate-500 text-xs md:text-sm font-medium mb-6 italic">
                        Designed for absolute beginners
                    </p>
                )}

                {isPathMastered ? (
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="flex-1 py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-widest text-sm md:text-base transition-all flex items-center justify-center gap-2 px-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 size={20} />
                                <span>Mastered</span>
                            </button>
                            {isFeaturedCard && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Scroll to More for Beginners
                                        const moreSection = document.getElementById('more-beginner-paths');
                                        if (moreSection) {
                                            moreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        } else {
                                            document.querySelector('input')?.focus();
                                        }
                                    }}
                                    className="flex-[1.5] py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-widest text-sm md:text-base transition-all flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95"
                                >
                                    <span>Select Another Language</span>
                                    <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                        <p className="text-slate-500 text-xs md:text-sm font-medium text-center italic">
                            {isFeaturedCard ? "Congratulations! Ready for your next challenge?" : "You've successfully finished this track."}
                        </p>
                    </div>
                ) : isCProgramming ? (
                    <div className="space-y-3">
                        <button className="w-full py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-widest text-sm md:text-base transition-all flex items-center justify-center gap-2 px-4 group/btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95">
                            <span>Start C Programming</span>
                        </button>
                        <p className="text-slate-500 text-xs md:text-sm font-medium text-center italic">
                            Best choice if you're new to coding
                        </p>
                    </div>
                ) : stats.hasProgress ? (
                    <div className="space-y-3">
                        <button className="w-full py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-widest text-sm md:text-base transition-all flex items-center justify-center gap-2 px-4 group/btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95">
                            <span>Continue {lang.name}</span>
                        </button>
                        <p className="text-slate-500 text-xs md:text-sm font-medium text-center italic">
                            You're {stats.progressPercent}% complete
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button className="w-full py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-widest text-sm md:text-base transition-all flex items-center justify-center gap-2 px-4 group/btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95">
                            <span>Start {lang.name}</span>
                        </button>
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
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3">
                            <GraduationCap className="text-indigo-500 w-8 h-8 md:w-9 md:h-9" />
                            Learn Hub
                        </h1>
                        <p className="text-slate-400 font-medium text-base md:text-lg max-w-2xl mt-1">Master coding with curated learning paths.</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-slate-900 border border-white/5 rounded-xl p-1 shrink-0">
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
                                    className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white transition-all shadow-lg text-sm md:text-base"
                                />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="space-y-12 md:space-y-16">
                        {sections.map((section, sectionIndex) => {
                            const isAdvancedSection = section.title === 'Build Advanced Skills';
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

                                    {sectionIndex > 0 && (
                                        <div className="h-px bg-gradient-to-r from-slate-700/0 via-slate-700/20 to-slate-700/0 my-6"></div>
                                    )}

                                    <div className={`${sectionIndex === 0 ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
                                        } gap-4 md:gap-6`}>
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
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase italic tracking-tight">Your Achievements</h2>
                            <p className="text-slate-400 font-medium">You have mastered {completedLessons.length} lessons so far. Revisit them anytime to reinforce your knowledge.</p>
                        </div>
                        <div className="px-8 py-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-center">
                            <div className="text-4xl font-black text-emerald-400">{completedLessons.length}</div>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Lessons Done</div>
                        </div>
                    </div>

                    {completedLessons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedLessons.map((lesson, idx) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                                    className="group p-5 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-slate-900 hover:border-emerald-500/30 transition-all active:scale-[0.98] text-left"
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
