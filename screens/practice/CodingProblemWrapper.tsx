
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodingWorkspace from './CodingWorkspace';
import { PRACTICE_TOPICS, PracticeProblem } from '../../data/practiceProblems';
import { usePracticeProgress } from '../../hooks/usePracticeProgress';

import { usePractice } from '../../contexts/PracticeContext';
import { Loader2 } from 'lucide-react';

const CodingProblemWrapper: React.FC = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const navigate = useNavigate();
    const { topics, loading, progress, getProblemStatus, refreshProgress } = usePractice();

    // Find the problem in the JSON content
    const problem = useMemo(() => {
        if (!problemId || !topics) return null;
        for (const topic of topics) {
            const found = topic.problems.find(p => p.id === problemId);
            if (found) return found;
        }
        return null;
    }, [problemId, topics]);

    // Find next problem for adaptive flow
    const getNextProblem = (currentId: string) => {
        if (!topics) return null;
        for (const topic of topics) {
            const currentIdx = topic.problems.findIndex(p => p.id === currentId);
            if (currentIdx !== -1) {
                if (currentIdx + 1 < topic.problems.length) {
                    return topic.problems[currentIdx + 1];
                }
                const topicIdx = topics.indexOf(topic);
                if (topicIdx + 1 < topics.length) {
                    return topics[topicIdx + 1].problems[0];
                }
            }
        }
        return null;
    };

    if (loading && !problem) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0a0b14] gap-4">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest animate-pulse">Synchronizing Workspace...</p>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0a0b14] text-white">
                <h2 className="text-2xl font-bold mb-4">Problem Not Found</h2>
                <button
                    onClick={() => navigate('/practice')}
                    className="px-6 py-2 bg-indigo-600 rounded-lg font-bold"
                >
                    Back to Practice
                </button>
            </div>
        );
    }

    const currentStatus = getProblemStatus(problem.id);
    const nextProblem = getNextProblem(problem.id);

    return (
        <CodingWorkspace
            problem={{
                ...problem,
                initialCode: problem.starter_codes['c'] || Object.values(problem.starter_codes)[0],
                solution: '',
                hint: ''
            } as any}
            status={currentStatus}
            onBack={() => navigate('/practice')}
            onComplete={() => {
                // Refresh context so Practice Hub shows updated stats
                refreshProgress();
            }}
            onNext={() => {
                if (nextProblem) navigate(`/practice/problem/${nextProblem.id}`);
                else navigate('/practice');
            }}
            hasNextProblem={!!nextProblem}
            nextProblemTitle={nextProblem?.title}
        />
    );
};

export default CodingProblemWrapper;
