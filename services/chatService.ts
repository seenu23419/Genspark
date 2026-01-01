
export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const STORAGE_KEYS = {
    SESSIONS: 'genspark_chat_sessions',
    MESSAGES: 'genspark_chat_messages',
};

class ChatService {
    /**
     * Get all chat sessions, sorted by most recent update
     */
    getSessions(): ChatSession[] {
        const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        if (!sessionsJson) return [];

        try {
            const sessions: ChatSession[] = JSON.parse(sessionsJson);
            return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
        } catch (e) {
            console.error('Failed to parse chat sessions', e);
            return [];
        }
    }

    /**
     * Create a new chat session
     */
    createSession(firstMessage: string): ChatSession {
        const sessions = this.getSessions();

        // Generate a title from the first few words of the message
        let title = firstMessage.substring(0, 30);
        if (firstMessage.length > 30) title += '...';

        const newSession: ChatSession = {
            id: Date.now().toString(),
            title,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        sessions.unshift(newSession); // Add to beginning
        this.saveSessions(sessions);
        return newSession;
    }

    /**
     * Update session title
     */
    updateSessionTitle(sessionId: string, newTitle: string) {
        const sessions = this.getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            session.title = newTitle;
            this.saveSessions(sessions);
        }
    }

    /**
     * Delete a session and its messages
     */
    deleteSession(sessionId: string) {
        // 1. Remove session
        const sessions = this.getSessions().filter(s => s.id !== sessionId);
        this.saveSessions(sessions);

        // 2. Remove messages for this session
        const allMessages = this.getAllMessages();
        const filteredMessages = allMessages.filter(m => m.sessionId !== sessionId);
        this.saveAllMessages(filteredMessages);
    }

    /**
     * Get messages for a specific session
     */
    getMessages(sessionId: string): ChatMessage[] {
        const allMessages = this.getAllMessages();
        return allMessages
            .filter(m => m.sessionId === sessionId)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Add a message to a session
     */
    addMessage(sessionId: string, message: Omit<ChatMessage, 'sessionId'>) {
        const allMessages = this.getAllMessages();
        const newMessage: ChatMessage = {
            ...message,
            sessionId
        };

        allMessages.push(newMessage);
        this.saveAllMessages(allMessages);

        // Update session timestamp for sorting
        this.touchSession(sessionId);

        return newMessage;
    }

    // --- Private Helpers ---

    private saveSessions(sessions: ChatSession[]) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }

    private getAllMessages(): ChatMessage[] {
        const msgsJson = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (!msgsJson) return [];
        try {
            return JSON.parse(msgsJson);
        } catch (e) {
            console.error('Failed to parse chat messages', e);
            return [];
        }
    }

    private saveAllMessages(messages: ChatMessage[]) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }

    private touchSession(sessionId: string) {
        const sessions = this.getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            session.updatedAt = Date.now();
            this.saveSessions(sessions);
        }
    }
}

export const chatService = new ChatService();
