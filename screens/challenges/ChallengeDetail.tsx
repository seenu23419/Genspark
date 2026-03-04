import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CHALLENGES } from '../../constants';
import CodingWorkspace from '../practice/CodingWorkspace';
import { useAuth } from '../../contexts/AuthContext';

const ChallengeDetail: React.FC = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const challenge = useMemo(() => {
    // 1. Search static challenges first
    const staticChallenge = CHALLENGES.find(c => c.id === challengeId);
    if (staticChallenge) return staticChallenge;

    // 2. Fallback to community challenges in localStorage
    try {
      const local = JSON.parse(localStorage.getItem('user_created_challenges') || '[]');
      return local.find((c: any) => c.id === challengeId);
    } catch (e) {
      return null;
    }
  }, [challengeId]);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Arena Entry Not Found</h2>
        <button onClick={() => navigate('/challenges')} className="px-6 py-2 bg-indigo-600 rounded-xl text-white font-bold">
          Return to Arenas
        </button>
      </div>
    );
  }

  // Find next challenge for sequential flow (arenas are simple IDs)
  const currentIdx = CHALLENGES.indexOf(challenge);
  const nextChallenge = currentIdx !== -1 && currentIdx + 1 < CHALLENGES.length ? CHALLENGES[currentIdx + 1] : null;

  return (
    <CodingWorkspace
      problem={{
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: (challenge.difficulty || 'Easy').toLowerCase() as any,
        concept: (challenge as any).isUserCreated ? 'COMMUNITY ARENA' : 'CORE ARENA',
        inputFormat: (challenge as any).inputFormat || 'Standard Input',
        outputFormat: (challenge as any).outputFormat || 'Standard Output',
        constraints: (challenge as any).constraints || 'N/A',
        initialCode: (challenge as any).starterCode || '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
        starter_codes: (challenge as any).starterCode ? {
          'c': (challenge as any).starterCode,
          'java': '// Not configured for this arena',
          'python': '# Not configured for this arena'
        } : {
          'c': '#include <stdio.h>\n\nint main() {\n    // Solve challenge here\n    return 0;\n}',
          'java': 'public class Solution {\n    public static void main(String[] args) {\n        // Solve challenge here\n    }\n}',
          'python': '# Solve challenge here\nimport sys\n\npass'
        },
        testCases: (challenge as any).testCases || []
      } as any}
      status="NOT_STARTED"
      onBack={() => navigate('/challenges')}
      onComplete={async () => {
        console.log("[Arena] Challenge completed!");
        await refreshProfile();
        setTimeout(() => navigate('/challenges'), 1500);
      }}
      onNext={nextChallenge ? () => navigate(`/challenge/${nextChallenge.id}`) : undefined}
      hasNextProblem={!!nextChallenge}
      nextProblemTitle={nextChallenge?.title}
      topicTitle="Glinto Arenas"
      topicId="arenas"
    />
  );
};

export default ChallengeDetail;
