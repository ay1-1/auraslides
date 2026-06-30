import React, { useState } from 'react';
import { 
  Plus, Grid, List, Trash2, Edit2, Download, Clock, Sparkles, 
  Layers, Search, FileText, FileDown, Trash, Shield, ArrowUpRight, BarChart3, HelpCircle, LogOut
} from 'lucide-react';
import { Presentation, PresentationTheme, THEMES } from '../types';
import { exportToPPTX, exportToPDF } from '../utils/export';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  presentations: Presentation[];
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  userName: string;
  onLogout: () => void;
}

export default function Dashboard({ 
  presentations, 
  onCreateNew, 
  onEdit, 
  onDelete, 
  userName,
  onLogout 
}: DashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('all');
  const [isExportingId, setIsExportingId] = useState<string | null>(null);

  // Filters
  const filteredPresentations = presentations.filter((p) => {
    const matchesSearch = p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = themeFilter === 'all' || p.theme === themeFilter;
    return matchesSearch && matchesTheme;
  });

  const handleExport = async (presentation: Presentation, format: 'pptx' | 'pdf') => {
    setIsExportingId(presentation.id);
    try {
      if (format === 'pptx') {
        await exportToPPTX(presentation);
      } else {
        await exportToPDF(presentation);
      }
    } catch (e) {
      console.error("Failed to export", e);
    } finally {
      setIsExportingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden" id="dashboard-container">
      {/* Decorative Matrix Background to match landing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 -z-20 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shrink-0" id="header-nav">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">AuraSlides</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-extrabold text-white">{userName}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Workspace Designer</p>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <button 
            onClick={onLogout}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-900 px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="hero-welcome">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Your Presentation Deck Space</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Create beautiful slides, download PowerPoint vectors, and customize inline scripts.</p>
          </div>
          
          {/* Create New Presentation Button with continuous pulse effect */}
          <motion.button
            onClick={onCreateNew}
            animate={{ boxShadow: ["0 0 0 0px rgba(99,102,241,0.4)", "0 0 0 8px rgba(99,102,241,0)"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer transition-all self-start md:self-auto group"
            id="create-presentation-btn"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>New AI Presentation</span>
          </motion.button>
        </div>

        {/* Analytics Summary Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-dashboard">
          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Presentations</p>
              <h3 className="text-2xl font-black text-white mt-1">{presentations.length}</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-950/50 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-900/30">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Generated Slides</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {presentations.reduce((acc, curr) => acc + (curr.slides?.length || 0), 0)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-rose-950/30 text-rose-400 rounded-xl flex items-center justify-center border border-rose-900/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Google OAuth status</p>
              <h3 className="text-xs font-bold text-slate-300 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                <span>Active Connection</span>
              </h3>
            </div>
            <div className="w-10 h-10 bg-emerald-950/30 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-900/20">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Creator Plan</p>
              <h3 className="text-xs font-black text-indigo-400 mt-2 flex items-center gap-1">
                <span>Enterprise Active</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </h3>
            </div>
            <div className="w-10 h-10 bg-indigo-950/50 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-900/30">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800/80 shadow-inner" id="dashboard-filters">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search presentations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="text-xs border border-slate-800 bg-slate-950 rounded-lg px-3 py-2 text-slate-300 outline-none cursor-pointer focus:border-indigo-500"
            >
              <option value="all">All Theme Layouts</option>
              {Object.keys(THEMES).map((key) => (
                <option key={key} value={key}>{THEMES[key as PresentationTheme].name}</option>
              ))}
            </select>

            <div className="flex items-center border border-slate-800 rounded-lg bg-slate-950 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Presentation List / Grid */}
        {filteredPresentations.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center" id="empty-dashboard-state">
            <div className="w-16 h-16 bg-slate-950 text-slate-500 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-white">No decks found</h4>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              {searchQuery || themeFilter !== 'all' 
                ? "Try updating your search query or layout parameters."
                : "Your professional workspace is empty. Let our AI construct your first presentation."}
            </p>
            <button
              onClick={onCreateNew}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Presentation</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="presentation-grid">
            {filteredPresentations.map((presentation) => {
              const themeInfo = THEMES[presentation.theme];
              return (
                <div 
                  key={presentation.id} 
                  className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:shadow-indigo-950/10 transition-all relative overflow-hidden group"
                >
                  {/* Subtle color palette accent lines */}
                  <div className="absolute top-0 left-0 w-full h-1 flex">
                    {themeInfo.palette.slice(0, 3).map((col, idx) => (
                      <div key={idx} className="flex-1 h-full" style={{ backgroundColor: col }} />
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${themeInfo.bg} ${themeInfo.accentText}`}>
                        {themeInfo.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(presentation.updatedAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white tracking-tight line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                      {presentation.topic}
                    </h4>

                    <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{presentation.slides?.length || 0} Professional Slides</span>
                    </p>
                  </div>

                  {/* Actions Area */}
                  <div className="border-t border-slate-800/80 pt-4 mt-5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onEdit(presentation.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-indigo-900/30 hover:text-indigo-400 text-slate-300 font-bold text-xs py-2 rounded-lg border border-slate-850 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Editor</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleExport(presentation, 'pptx')}
                        title="Export editable PowerPoint vector (PPTX)"
                        disabled={isExportingId === presentation.id}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-950 rounded-lg transition-colors cursor-pointer disabled:opacity-30 border border-transparent hover:border-slate-800"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExport(presentation, 'pdf')}
                        title="Export standard PDF format"
                        disabled={isExportingId === presentation.id}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-950 rounded-lg transition-colors cursor-pointer disabled:opacity-30 border border-transparent hover:border-slate-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(presentation.id)}
                        title="Delete Presentation"
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-950 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-800"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm" id="presentation-list-view">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Presentation Topic</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Theme Style</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Slides Count</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Sync</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPresentations.map((presentation) => {
                  const themeInfo = THEMES[presentation.theme];
                  return (
                    <tr key={presentation.id} className="hover:bg-slate-950/40 transition-colors group">
                      <td className="p-4">
                        <div className="font-extrabold text-white text-sm group-hover:text-indigo-400 transition-colors">
                          {presentation.topic}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${themeInfo.bg} ${themeInfo.accentText}`}>
                          {themeInfo.name}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-semibold">
                        {presentation.slides?.length || 0} slides
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(presentation.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(presentation.id)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-950 rounded-lg border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                            title="Edit Presentation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExport(presentation, 'pptx')}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-950 rounded-lg border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                            title="Export PowerPoint (PPTX)"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExport(presentation, 'pdf')}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-950 rounded-lg border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                            title="Export PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(presentation.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-950 rounded-lg border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                            title="Delete Deck"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
