
// ------------------------------------------------------------------
// SERVICE REMOVED
// The application has migrated to a Scalable Supabase Architecture.
// ------------------------------------------------------------------

export const mongoDB = {
    getHealth: () => { throw new Error("MongoDB service is removed. Use supabaseDB."); },
    findOne: () => { throw new Error("MongoDB service is removed. Use supabaseDB."); },
    insertOne: () => { throw new Error("MongoDB service is removed. Use supabaseDB."); },
    updateOne: () => { throw new Error("MongoDB service is removed. Use supabaseDB."); },
    setSession: () => { throw new Error("MongoDB service is removed. Use authService."); },
    clearSession: () => { throw new Error("MongoDB service is removed. Use authService."); },
    getCurrentSessionUser: () => { throw new Error("MongoDB service is removed. Use authService."); },
    onAuthStateChange: () => { throw new Error("MongoDB service is removed. Use authService."); }
};
