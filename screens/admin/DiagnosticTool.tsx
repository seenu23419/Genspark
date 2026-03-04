import React, { useState } from 'react';
import { supabaseDB } from '../../services/supabaseService';
import { Loader2, Globe, Server, Database, Shield, Zap, Search, Layout, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';

const DiagnosticTool: React.FC = () => {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [netStatus, setNetStatus] = useState<Record<string, string>>({});
    const [isNetTesting, setIsNetTesting] = useState(false);

    const checkConnectivity = async () => {
        setIsNetTesting(true);
        const tests = [
            { name: 'Piston API', url: 'https://emkc.org/api/v2/piston/runtimes', tech: 'External Compiler' },
            { name: 'Google Gemini', url: 'https://generativelanguage.googleapis.com', tech: 'AI Mentor' },
            { name: 'Supabase API', url: (supabaseDB as any).supabaseUrl || 'https://ljejqqkkacqravcpruac.supabase.co', tech: 'Database' },
            { name: 'Local Judge0', url: 'http://localhost:2358/submissions', tech: 'Self-Hosted' }
        ];

        const newResults: Record<string, string> = {};
        for (const test of tests) {
            try {
                newResults[test.name] = 'Testing...';
                setNetStatus({ ...newResults });

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                // no-cors for simple reachability check
                await fetch(test.url, { mode: 'no-cors', signal: controller.signal });
                clearTimeout(timeoutId);

                newResults[test.name] = 'Connected';
            } catch (e: any) {
                newResults[test.name] = e.name === 'AbortError' ? 'Timeout' : 'Blocked/Offline';
            }
            setNetStatus({ ...newResults });
        }
        setIsNetTesting(false);
    };

    const runDiagnostics = async () => {
        setLoading(true);
        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            tests: {}
        };

        try {
            // Test 1: Project URL
            diagnostics.tests.projectUrl = (supabaseDB as any).supabaseUrl;

            // Test 2: Auth Session
            const { data: { session }, error: sessionError } = await supabaseDB.supabase.auth.getSession();
            diagnostics.tests.session = {
                status: sessionError ? 'FAIL' : 'PASS',
                userId: session?.user?.id,
                email: session?.user?.email,
            };

            // Test 3: Table Finder
            const tableNames = ['users', 'profiles', 'user_profiles', 'players', 'scores'];
            const counts: any = {};
            for (const name of tableNames) {
                try {
                    const { count, error } = await supabaseDB.supabase
                        .from(name)
                        .select('*', { count: 'exact', head: true });
                    counts[name] = error ? `Error: ${error.code}` : (count || 0);
                } catch (e: any) {
                    counts[name] = 'Not Found';
                }
            }
            diagnostics.tests.tableCounts = counts;

            // Test 4: Deep Column Scan
            try {
                const { data } = await supabaseDB.supabase.from('users').select('*').limit(1);
                if (data && data.length > 0) {
                    diagnostics.tests.columns = Object.keys(data[0]);
                    diagnostics.tests.sampleUser = data[0];
                } else {
                    diagnostics.tests.columns = [];
                }
            } catch (e: any) {
                diagnostics.tests.columnsError = e.message;
            }

            // Test 5: Fetch List of Visible Users
            try {
                const { data, error } = await supabaseDB.supabase.from('users').select('*').limit(100);
                diagnostics.tests.allUsers = {
                    status: error ? 'FAIL' : 'PASS',
                    count: data?.length || 0,
                    users: data || [],
                    error: error?.message
                };
            } catch (e: any) {
                diagnostics.tests.allUsers = { status: 'FAIL', error: e.message };
            }

        } catch (e: any) {
            diagnostics.error = e.message;
        }

        setResults(diagnostics);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0b14] p-4 md:p-10 text-slate-200 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Shield size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Maintenance Mode</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white italic">
                            GLINTO <span className="text-indigo-500">DIAGNOSTIC</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Identify database, network, and AI brain issues.</p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button
                            onClick={checkConnectivity}
                            disabled={isNetTesting}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 disabled:opacity-50"
                        >
                            {isNetTesting ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                            {isNetTesting ? 'Testing Net...' : 'Test Network'}
                        </button>

                        <button
                            onClick={runDiagnostics}
                            disabled={loading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
                            {loading ? 'Analyzing...' : 'Database Scan'}
                        </button>
                    </div>
                </div>

                {/* Network Status Grid */}
                {Object.keys(netStatus).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {Object.entries(netStatus).map(([name, status]) => (
                            <div key={name} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${status === 'Connected' ? 'bg-emerald-500/10 text-emerald-500' :
                                        status === 'Testing...' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    {status === 'Connected' ? <CheckCircle2 size={20} /> :
                                        status === 'Testing...' ? <Loader2 size={20} className="animate-spin" /> : <AlertCircle size={20} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{name}</span>
                                    <span className={`text-sm font-bold ${status === 'Connected' ? 'text-white' :
                                            status === 'Testing...' ? 'text-indigo-400' : 'text-rose-400'
                                        }`}>{status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {results && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* 1. Database & Tables */}
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                                <div className="flex items-center gap-2 mb-6">
                                    <Layout size={18} className="text-indigo-400" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Table Structure</h3>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(results.tests.tableCounts || {}).map(([name, count]) => (
                                        <div key={name} className="bg-white/2 p-3 rounded-2xl flex justify-between items-center border border-white/5">
                                            <span className="text-slate-400 text-[11px] font-bold capitalize">{name}</span>
                                            <span className={typeof count === 'number' && count > 0 ? 'text-emerald-400 font-black' : 'text-slate-600 font-bold'}>
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                                <div className="flex items-center gap-2 mb-6">
                                    <Zap size={18} className="text-amber-500" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Column Detection</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/2 p-3 rounded-2xl">
                                        <span className="text-[11px] text-slate-400 font-bold">'points' Column</span>
                                        <span className={results.tests.columns?.includes('points') ? 'text-emerald-400 font-black' : 'text-rose-500/30'}>
                                            {results.tests.columns?.includes('points') ? 'DETECTED' : 'MISSING'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/2 p-3 rounded-2xl">
                                        <span className="text-[11px] text-slate-400 font-bold">'xp' Column</span>
                                        <span className={results.tests.columns?.includes('xp') ? 'text-emerald-400 font-black' : 'text-rose-500/30'}>
                                            {results.tests.columns?.includes('xp') ? 'DETECTED' : 'MISSING'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. User Data List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Search size={18} className="text-indigo-400" />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                                            Live Discovery ({results.tests.allUsers?.count})
                                        </h3>
                                    </div>
                                    {results.tests.allUsers?.status === 'PASS' ?
                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">Read Secure</span> :
                                        <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">RLS Blocked</span>
                                    }
                                </div>

                                <div className="space-y-3 overflow-y-auto max-h-[500px] no-scrollbar pr-2">
                                    {results.tests.allUsers?.users?.map((u: any, i: number) => (
                                        <div key={u.id} className="bg-white/2 hover:bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors group">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-[10px]">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white leading-none mb-1">
                                                            {u.name || u.full_name || (u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.email.split('@')[0])}
                                                        </span>
                                                        <span className="text-slate-500 font-mono text-[10px]">{u.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-black text-indigo-400 uppercase leading-none">XP</div>
                                                        <div className="text-lg font-black text-white leading-none">{u.xp || 0}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-black text-emerald-500 uppercase leading-none">PTS</div>
                                                        <div className="text-lg font-black text-white leading-none">{u.points || 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) || (
                                            <div className="h-64 flex flex-col items-center justify-center text-slate-600 space-y-2 italic">
                                                <Database size={32} />
                                                <p>No user data matches found for the app yet.</p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Terminal / Logs */}
                        <div className="lg:col-span-3">
                            <div className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden">
                                <div className="flex items-center gap-2 px-6 py-4 bg-white/5 border-b border-white/10">
                                    <Terminal size={14} className="text-slate-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw System Logs</span>
                                </div>
                                <pre className="p-8 text-[11px] font-mono text-indigo-400/80 overflow-x-auto whitespace-pre leading-relaxed max-h-[400px]">
                                    {JSON.stringify(results, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* Visual Placeholder when no results */}
                {!results && !loading && (
                    <div className="h-96 flex flex-col items-center justify-center bg-white/2 rounded-[3rem] border border-white/5 border-dashed space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Zap size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">Select a scan type to begin troubleshooting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosticTool;
