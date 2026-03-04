import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#0a0b14] text-white flex flex-col items-center justify-center px-6">
            <h1 className="text-5xl font-bold mb-6">Welcome to GenSpark</h1>
            <p className="text-lg text-slate-400 max-w-xl text-center mb-8">
                Learn coding, build projects, and level up your skills with free interactive
                courses. Log in to continue where you left off or sign up to get started
                immediately.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
                >
                    Log In
                </button>
                <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold"
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default Landing;
