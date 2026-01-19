import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiRewardProps {
    trigger: boolean;
    onComplete?: () => void;
}

const ConfettiReward: React.FC<ConfettiRewardProps> = ({ trigger, onComplete }) => {

    const fireConfetti = useCallback(() => {
        // School Pride style
        const end = Date.now() + (1.5 * 1000); // 1.5 seconds

        const colors = ['#6366f1', '#a855f7', '#ec4899'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            } else {
                if (onComplete) onComplete();
            }
        }());
    }, [onComplete]);

    useEffect(() => {
        if (trigger) {
            fireConfetti();
        }
    }, [trigger, fireConfetti]);

    return null; // Logic only component, renders on canvas overlay by library
};

export default ConfettiReward;
