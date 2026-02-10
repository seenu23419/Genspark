import React, { useState } from 'react';
import { supabaseDB } from '../../services/supabaseService';

const DiagnosticTool: React.FC = () => {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            tests: {}
        };

        try {
            // Test 1: Check auth session
            const { data: { session }, error: sessionError } = await supabaseDB.supabase.auth.getSession();
            diagnostics.tests.session = {
                status: sessionError ? 'FAIL' : 'PASS',
                userId: session?.user?.id,
                email: session?.user?.email,
                error: sessionError?.message
            };

            // Test 2: Check if users table exists
            try {
                const { data, error } = await supabaseDB.supabase
                    .from('users')
                    .select('count', { count: 'exact', head: true });
                diagnostics.tests.usersTable = {
                    status: error ? 'FAIL' : 'PASS',
                    error: error?.message,
                    code: error?.code,
                    hint: error?.hint
                };
            } catch (e: any) {
                diagnostics.tests.usersTable = {
                    status: 'FAIL',
                    error: e.message
                };
            }

            // Test 3: Try to read current user profile
            if (session?.user?.id) {
                try {
                    const { data, error } = await supabaseDB.supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    diagnostics.tests.userProfile = {
                        status: error ? 'FAIL' : 'PASS',
                        exists: !!data,
                        data: data,
                        error: error?.message,
                        code: error?.code
                    };
                } catch (e: any) {
                    diagnostics.tests.userProfile = {
                        status: 'FAIL',
                        error: e.message
                    };
                }
            }

            // Test 4: Check RLS policies
            try {
                const { data, error } = await supabaseDB.supabase
                    .rpc('pg_policies')
                    .select('*');
                diagnostics.tests.rlsPolicies = {
                    status: error ? 'FAIL' : 'PASS',
                    error: error?.message
                };
            } catch (e: any) {
                diagnostics.tests.rlsPolicies = {
                    status: 'SKIP',
                    note: 'RPC not available'
                };
            }

        } catch (e: any) {
            diagnostics.error = e.message;
        }

        setResults(diagnostics);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">GenSpark Diagnostic Tool</h1>

                <button
                    onClick={runDiagnostics}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold mb-6 disabled:opacity-50"
                >
                    {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
                </button>

                {results && (
                    <div className="bg-slate-200/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 p-6 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center">
                        <pre className="text-xs text-slate-300 overflow-auto">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosticTool;
