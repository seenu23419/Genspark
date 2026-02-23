import React, { useState, useMemo } from 'react';
import { Search, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES, CURRICULUM } from '../../constants';
import { Language } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

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
    const { user, updateUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // helper to get stats for a language
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

    // Detect user learning state
    const userState = useMemo(() => {
        if (!user) return { state: 'no_path_selected' as const, activePath: null, completedBeginnerPaths: [] };

        const lastLanguageId = user.lastLanguageId || null;
        const modules = lastLanguageId ? (CURRICULUM as any)[lastLanguageId] || [] : [];
        const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
        const stats = lastLanguageId ? getLangStats(lastLanguageId) : { progressPercent: 0 };

        const beginnerLanguages = LANGUAGES.filter(lang => DIFFICULTY_MAP[lang.id] === 'Beginner').map(l => l.id);
        const completedBeginnerPaths = beginnerLanguages.filter(id => getLangStats(id).progressPercent === 100);

        if (!lastLanguageId || totalLessons === 0) {
            return { state: 'no_path_selected' as const, activePath: null, completedBeginnerPaths };
        }

        const pathName = LANGUAGES.find(l => l.id === lastLanguageId)?.name || 'Unknown';

        if (stats.progressPercent === 100) {
            return {
                state: 'path_completed' as const,
                activePath: { langId: lastLanguageId, name: pathName, progress: 100 },
                completedBeginnerPaths
            };
        }

        if (stats.progressPercent === 0) {
            return {
                state: 'path_selected' as const,
                activePath: { langId: lastLanguageId, name: pathName, progress: 0 },
                completedBeginnerPaths
            };
        }

        return {
            state: 'path_in_progress' as const,
            activePath: { langId: lastLanguageId, name: pathName, progress: stats.progressPercent },
            completedBeginnerPaths
        };
    }, [user]);

    const recommendedNextTrack = useMemo(() => {
        const unmastered = LANGUAGES.filter(l => getLangStats(l.id).progressPercent < 100);
        if (unmastered.length === 0) return null;

        const statsC = getLangStats('c');
        const statsDSA = getLangStats('dsa');

        if (statsC.progressPercent === 100 && statsDSA.progressPercent < 100) {
            return LANGUAGES.find(l => l.id === 'dsa');
        }

        if (statsDSA.progressPercent === 100) {
            const next = unmastered.find(l => ['cpp', 'java'].includes(l.id));
            if (next) return next;
        }

        return unmastered[0];
    }, [user]);

    const sortCourses = (courses: Language[]) => {
        return [...courses].sort((a, b) => {
            const statsA = getLangStats(a.id);
            const statsB = getLangStats(b.id);

            const isAInProgress = statsA.progressPercent > 0 && statsA.progressPercent < 100;
            const isBInProgress = statsB.progressPercent > 0 && statsB.progressPercent < 100;
            if (isAInProgress && !isBInProgress) return -1;
            if (!isAInProgress && isBInProgress) return 1;

            const isAUnstarted = statsA.progressPercent === 0;
            const isBUnstarted = statsB.progressPercent === 0;
            if (isAUnstarted && !isBUnstarted) return -1;
            if (!isAUnstarted && isBUnstarted) return 1;

            return 0;
        });
    };

    const sections = useMemo((): CourseSection[] => {
        const filtered = LANGUAGES.filter(lang =>
            lang.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const beginnerCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Beginner');
        const intermediateCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Intermediate');
        const advancedCourses = filtered.filter(lang => DIFFICULTY_MAP[lang.id] === 'Advanced');

        const sections: CourseSection[] = [];
        let featuredCourseId: string | null = null;

        if (beginnerCourses.length > 0) {
            if (userState.activePath && (userState.state === 'path_in_progress' || userState.state === 'path_selected')) {
                const activeLang = LANGUAGES.find(l => l.id === userState.activePath?.langId);
                if (activeLang) {
                    featuredCourseId = activeLang.id;
                    sections.push({
                        title: userState.state === 'path_selected' ? 'Selected Path' : 'Continue Learning',
                        description: userState.state === 'path_selected'
                            ? `You've selected ${activeLang.name}. Ready to begin?`
                            : `You're learning ${activeLang.name}. Keep going!`,
                        courses: [activeLang],
                        showBadge: false,
                    });
                }
            } else if (userState.state === 'path_completed') {
                if (recommendedNextTrack) {
                    featuredCourseId = recommendedNextTrack.id;
                    sections.push({
                        title: 'Recommended for You',
                        description: `You've mastered ${userState.activePath?.name}! Ready for ${recommendedNextTrack.name}?`,
                        courses: [recommendedNextTrack],
                        showBadge: true,
                    });
                } else if (userState.activePath) {
                    const activeLang = LANGUAGES.find(l => l.id === userState.activePath?.langId);
                    if (activeLang) {
                        featuredCourseId = activeLang.id;
                        sections.push({
                            title: 'Path Mastered',
                            description: `Congratulations! You've finished the ${activeLang.name} track.`,
                            courses: [activeLang],
                            showBadge: false,
                        });
                    }
                }
            } else {
                featuredCourseId = beginnerCourses[0].id;
                sections.push({
                    title: 'Start Here',
                    description: 'Ready to begin? C Programming is the best foundation.',
                    courses: [beginnerCourses[0]],
                    showBadge: true,
                });
            }

            let otherCourses = sortCourses(beginnerCourses);
            if (featuredCourseId) {
                otherCourses = otherCourses.filter(c => c.id !== featuredCourseId);
            }

            if (otherCourses.length > 0) {
                sections.push({
                    title: 'More for Beginners',
                    description: userState.state === 'path_in_progress' ? 'Explore after completing your current path' : 'Expand your foundation with these beginner paths',
                    courses: otherCourses,
                    showBadge: false,
                });
            }
        }

        let supportingSkills = sortCourses([...intermediateCourses, ...advancedCourses]);
        if (featuredCourseId) {
            supportingSkills = supportingSkills.filter(c => c.id !== featuredCourseId);
        }

        if (supportingSkills.length > 0) {
            sections.push({
                title: 'Advanced Skills',
                description: userState.completedBeginnerPaths.length > 0 ? 'Continue growing your skills' : 'Recommended after completing a beginner path',
                courses: supportingSkills,
                showBadge: false,
            });
        }

        return sections;
    }, [searchQuery, userState, recommendedNextTrack]);

    const renderCourseCard = (lang: Language, isFirst: boolean, showBadge: boolean, sectionIndex: number) => {
        const stats = getLangStats(lang.id);
        const isPathMastered = stats.progressPercent === 100;

        const handleClick = () => {
            if (user?.lastLanguageId !== lang.id) {
                updateUser({ lastLanguageId: lang.id }).catch(console.error);
            }
            navigate(`/track/${lang.id}`);
        };

        return (
            <div
                key={lang.id}
                onClick={handleClick}
                className={`group relative rounded-xl cursor-pointer overflow-hidden transition-all active:scale-[0.98] bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-white/10 p-5 shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col h-full min-h-[250px] md:min-h-[300px] ${sectionIndex === 0 ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/90 dark:to-slate-900/60 shadow-indigo-500/10' : ''}`}
            >
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center p-2.5 transition-all group-hover:bg-indigo-500/10">
                            <img src={lang.icon} alt={lang.name} className="w-full h-full object-contain filter group-hover:brightness-110 transition-all" />
                        </div>
                        {(showBadge || isPathMastered) && (
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${isPathMastered ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80' : sectionIndex === 0 && showBadge && !stats.hasProgress ? 'bg-amber-500/20 text-amber-300 border-amber-500/80' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/80'}`}>
                                {isPathMastered ? 'Mastered' : sectionIndex === 0 && showBadge && !stats.hasProgress ? 'Suggestion' : (DIFFICULTY_MAP[lang.id] || 'Beginner')}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-lg md:text-xl text-white mb-1.5 group-hover:text-indigo-300 transition-colors uppercase italic">{lang.name}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-2 md:line-clamp-3">{LANGUAGE_OUTCOMES[lang.id] || `Learn ${lang.name}`}</p>
                </div>
                <div className="mt-auto pt-4">
                    {isPathMastered ? (
                        <div className="w-full py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 opacity-80 backdrop-blur-sm">
                            <CheckCircle2 size={16} />
                            <span>Course Completed</span>
                        </div>
                    ) : (
                        <div className="w-full py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 px-4 group/btn bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95">
                            <span>Start {lang.name}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 text-white">
            <header className="space-y-4 md:space-y-6 px-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-2 md:gap-3 uppercase italic">
                            <GraduationCap className="text-indigo-400 w-8 h-8 md:w-10 md:h-10" />
                            Learn Hub
                        </h1>
                        <p className="text-slate-300 font-bold text-sm md:text-base max-w-2xl mt-2">Master coding with curated learning paths.</p>
                    </div>
                </div>
            </header>

            <div className="space-y-12 md:space-y-16">
                {/* Search Bar - Always Visible */}
                <div className="flex flex-col md:flex-row gap-4 px-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="Find a language or skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-500 transition-all shadow-xl text-sm md:text-base"
                        />
                    </div>
                </div>

                <div className="space-y-12 md:space-y-16">
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="px-1 space-y-1 md:space-y-2">
                                <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight italic flex items-center gap-2">
                                    <div className="w-1 md:w-1.5 h-5 md:h-6 bg-indigo-500 rounded-full" />
                                    {section.title}
                                </h2>
                                {section.description && (
                                    <p className="text-slate-300 font-bold text-xs md:text-sm">{section.description}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {section.courses.map((lang, langIndex) =>
                                    renderCourseCard(lang, false, section.showBadge, 0)
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {sections.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">No courses found. Try a different search.</p>
                </div>
            )}
        </div>
    );
};

export default LearnHub;
