import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const UrgencyBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [prizeLabel, setPrizeLabel] = useState('');
    const [prizeCode, setPrizeCode] = useState('');

    const checkUrgency = () => {
        const expiry = localStorage.getItem('wheel_won_expiry');
        if (!expiry) {
            setIsVisible(false);
            return;
        }

        const now = Date.now();
        const diff = parseInt(expiry) - now;

        if (diff <= 0) {
            // Expired
            localStorage.removeItem('wheel_won_expiry');
            localStorage.removeItem('wheel_prize_label');
            localStorage.removeItem('wheel_prize_code');
            setIsVisible(false);
        } else {
            // Active
            setIsVisible(true);
            setTimeLeft(diff);
            setPrizeLabel(localStorage.getItem('wheel_prize_label'));
            setPrizeCode(localStorage.getItem('wheel_prize_code'));
        }
    };

    // 1. Listen for storage changes (to react immediately after win)
    useEffect(() => {
        window.addEventListener('storage', checkUrgency);
        // Also verify on mount
        checkUrgency();

        // Interval for countdown
        const interval = setInterval(() => {
            checkUrgency();
        }, 1000);

        return () => {
            window.removeEventListener('storage', checkUrgency);
            clearInterval(interval);
        };
    }, []);

    if (!isVisible || !timeLeft) return null;

    // Format minutes:seconds
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#d4af37] text-black font-bold text-center py-3 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex items-center justify-center gap-4 animate-in slide-in-from-bottom">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-[#d4af37] rounded-full flex items-center justify-center animate-pulse">
                    <Timer size={16} />
                </div>
                <p className="text-sm md:text-base">
                    ¡Felicidades! Tu premio <span className="underline">{prizeLabel}</span> (Código: {prizeCode}) vence en:
                </p>
                <div className="font-mono text-xl bg-black text-white px-2 py-0.5 rounded">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
            </div>
        </div>
    );
};

export default UrgencyBanner;
