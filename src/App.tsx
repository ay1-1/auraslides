import React, { useState, useEffect } from 'react';
import { User, Presentation } from './types';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CreateFlow from './components/CreateFlow';
import SlideEditor from './components/SlideEditor';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'create' | 'editor'>('landing');
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [activePresentation, setActivePresentation] = useState<Presentation | null>(null);
  const [appReady, setAppReady] = useState(false);

  // Authenticate persistent session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auraslides_token');
    const savedUser = localStorage.getItem('auraslides_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    } else {
      setView('landing');
    }
    setAppReady(true);
  }, []);

  // Fetch user's presentations list
  const fetchPresentations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/presentations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPresentations(data || []);
      }
    } catch (e) {
      console.error("Failed to load presentations", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPresentations();
    }
  }, [token, view]);

  const handleAuthSuccess = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auraslides_token');
    localStorage.removeItem('auraslides_user');
    setUser(null);
    setToken(null);
    setView('auth');
  };

  const handleEditPresentation = (id: string) => {
    const p = presentations.find((item) => item.id === id);
    if (p) {
      setActivePresentation(p);
      setView('editor');
    }
  };

  const handleDeletePresentation = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/presentations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPresentations(presentations.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error("Deletion failed", e);
    }
  };

  const handlePresentationCreated = (p: Presentation) => {
    setActivePresentation(p);
    setView('editor');
  };

  if (!appReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Synchronizing aura workspace space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {view === 'landing' && (
        <LandingPage 
          onGetStarted={() => setView('auth')}
          onLoginClick={() => setView('auth')}
        />
      )}

      {view === 'auth' && (
        <Auth 
          onAuthSuccess={handleAuthSuccess} 
          onBackToHome={() => setView('landing')}
        />
      )}

      {view === 'dashboard' && user && (
        <Dashboard
          presentations={presentations}
          onCreateNew={() => setView('create')}
          onEdit={handleEditPresentation}
          onDelete={handleDeletePresentation}
          userName={user.name}
          onLogout={handleLogout}
        />
      )}

      {view === 'create' && token && (
        <CreateFlow
          token={token}
          onBackToDashboard={() => setView('dashboard')}
          onPresentationCreated={handlePresentationCreated}
        />
      )}

      {view === 'editor' && activePresentation && token && (
        <SlideEditor
          presentation={activePresentation}
          token={token}
          onBackToDashboard={() => setView('dashboard')}
        />
      )}
    </div>
  );
}
