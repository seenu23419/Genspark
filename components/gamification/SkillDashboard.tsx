import React, { useEffect, useState } from 'react';
import { supabaseDB } from '../../services/supabaseService';
import SkillHexagon from './SkillHexagon';
import { Code, Database, Cpu, Layers, Braces, Terminal } from 'lucide-react';

interface UserSkill {
    skill_id: string;
    mastery_level: number;
}

const SKILL_METADATA: Record<string, { name: string, icon: React.ReactNode }> = {
    'python_basics': { name: 'Python Core', icon: <Code size={18} /> },
    'loops': { name: 'Loop Logic', icon: <RotateCcw size={18} /> },
    'data_structures': { name: 'Data Structs', icon: <Database size={18} /> },
    'algorithms': { name: 'Algorithms', icon: <Cpu size={18} /> },
    'frontend': { name: 'UI/UX', icon: <Layers size={18} /> },
    'logic': { name: 'Pure Logic', icon: <Braces size={18} /> }
};

import { RotateCcw } from 'lucide-react';

const SkillDashboard: React.FC = () => {
    const [skills, setSkills] = useState<UserSkill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        try {
            const { data: { user } } = await supabaseDB.supabase.auth.getUser();
            if (!user) return;

            // Mocking initial data if empty for visualization
            const { data, error } = await supabaseDB.supabase
                .from('user_skills')
                .select('*')
                .eq('user_id', user.id);

            if (data && data.length > 0) {
                setSkills(data);
            } else {
                // Temporary Mock for Demo
                setSkills([
                    { skill_id: 'python_basics', mastery_level: 45 },
                    { skill_id: 'loops', mastery_level: 20 },
                    { skill_id: 'logic', mastery_level: 75 }
                ]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={20} className="text-indigo-400" />
                    Skill Mastery
                </h3>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 justify-items-center">
                {Object.entries(SKILL_METADATA).map(([id, meta]) => {
                    const userSkill = skills.find(s => s.skill_id === id);
                    return (
                        <SkillHexagon
                            key={id}
                            skillId={id}
                            name={meta.name}
                            level={userSkill?.mastery_level || 0}
                            icon={meta.icon}
                            locked={!userSkill}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SkillDashboard;
