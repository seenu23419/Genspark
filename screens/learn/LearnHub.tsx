import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, GraduationCap, ChevronDown, CheckCircle2, BookOpen, Code2, Star, Zap, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const { user, updateProfile } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

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
                sections.push({
                    title: 'Start Here',
                    description: 'Ready to begin? C Programming is the best foundation.',
                    courses: [beginnerCourses[0]],
                    showBadge: true,
                });
            }

            let otherCourses = beginnerCourses;
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

        const handleClick = () => {
            if (user?.lastLanguageId !== lang.id) {
                updateProfile({ lastLanguageId: lang.id }).catch(console.error);
            }
            navigate(`/track/${lang.id}`);
        };

        return (
            <div
                key={lang.id}
                onClick={handleClick}
                className="group relative card-base cursor-pointer overflow-hidden transition-all active:scale-[0.98] p-5 hover:card-active"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center p-2.5 transition-all group-hover:bg-blue-500/10">
                        <img
                            src={lang.icon}
                            alt={lang.name}
                            className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                        />
                    </div>
                    {showBadge && (
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${isPathMastered
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                            {isPathMastered ? 'Mastered' : 'Beginner'}
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-xl md:text-2xl text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lang.name}
                </h3>

                <p className="text-slate-500 dark:text-white font-bold text-sm md:text-base leading-relaxed mb-6 line-clamp-2 opacity-80">
                    {LANGUAGE_OUTCOMES[lang.id] || `Learn ${lang.name}`}
                </p>

                {lang.id === 'c' && userState.state === 'no_path_selected' && (
                    <p className="text-slate-500 text-xs md:text-sm font-medium mb-6 italic">
                        Designed for absolute beginners
                    </p>
                )}

                {isPathMastered ? (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/[0.08] pb-2">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={12} className="shrink-0" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Mastered</span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 italic text-center">Course successfully completed</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-auto pt-4">
                        <div className="w-full py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 px-4 group/btn bg-blue-600 hover:bg-blue-500 text-white active:scale-95">
                            <span>Start {lang.name}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10 md:space-y-16 pb-24">
                <header className="space-y-4 md:space-y-6 px-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 text-blue-600 dark:text-blue-400 py-1">
                                <GraduationCap size={32} className="text-blue-600 dark:text-blue-400" />
                                Learn Hub
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mt-2">Master coding with curated learning paths.</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    {searchQuery === '' && sections.length <= 3 ? null : (
                        <div className="flex flex-col md:flex-row gap-4 px-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Find a language..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white transition-all text-sm md:text-base"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-12 md:space-y-16">
                        {sections.map((section, sectionIndex) => (
                            <section key={sectionIndex} className="space-y-4">
                                <div className="px-1">
                                    <h2 className={`font-bold mb-1 ${sectionIndex === 0
                                        ? 'text-3xl md:text-4xl text-slate-900 dark:text-white'
                                        : 'text-2xl md:text-3xl text-slate-900 dark:text-white'
                                        }`}>
                                        {section.title}
                                    </h2>
                                    {section.description && (
                                        <p className={`font-bold ${sectionIndex === 0
                                            ? 'text-slate-600 dark:text-slate-400 text-lg'
                                            : 'text-blue-600 dark:text-blue-400 text-base md:text-lg'
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
                        ))}

                        {sections.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-slate-400 text-lg">No courses found. Try a different search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnHub;
