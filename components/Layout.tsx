import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onReset: () => void;
  hasSchedule: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onReset, hasSchedule }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AttendAI</h1>
          </div>
          
          {hasSchedule && (
            <button 
              onClick={() => {
                if(window.confirm("Are you sure? This will delete your schedule and all records.")) {
                  onReset();
                }
              }}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Reset App
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>AttendAI &copy; {new Date().getFullYear()} • Powered by Gemini 3 Flash</p>
        </div>
      </footer>
    </div>
  );
};