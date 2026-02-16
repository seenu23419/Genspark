import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CurriculumProvider } from './contexts/CurriculumContext';
import { PracticeProvider } from './contexts/PracticeContext';
import { MainErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <MainErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurriculumProvider>
          <PracticeProvider>
            <App />
          </PracticeProvider>
        </CurriculumProvider>
      </AuthProvider>
    </QueryClientProvider>
  </MainErrorBoundary>
);

