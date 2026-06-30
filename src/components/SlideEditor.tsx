import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, Cpu, Download, Layers, Play, Settings, 
  Plus, Trash, ArrowUp, ArrowDown, ChevronRight, Image as ImageIcon, 
  FileDown, Check, Layout, AlertCircle, RefreshCw, FileText, Maximize2,
  X, HelpCircle, Eye, Upload, Palette, Share2, Copy
} from 'lucide-react';
import { Presentation, Slide, PresentationTheme, THEMES } from '../types';
import { exportToPPTX, exportToPDF } from '../utils/export';
import { motion, AnimatePresence } from 'motion/react';

interface SlideEditorProps {
  presentation: Presentation;
  onBackToDashboard: () => void;
  token: string;
}

export default function SlideEditor({ presentation: initialPresentation, onBackToDashboard, token }: SlideEditorProps) {
  const [presentation, setPresentation] = useState<Presentation>(initialPresentation);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState<'pptx' | 'pdf' | 'images' | null>(null);
  const [autoSaveState, setAutoSaveState] = useState<'saved' | 'saving' | 'idle'>('saved');

  // Presentation Mode
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [presentSlideIdx, setPresentSlideIdx] = useState(0);
  const [showPresentNotes, setShowPresentNotes] = useState(false);

  // Style change selection
  const [imageStyle, setImageStyle] = useState<'photorealistic' | 'modern' | 'minimalist' | 'artistic'>('modern');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Manual URL fallback modal/inputs
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  // Custom Toast notification
  const [toastMsg, setToastMsg] = useState('');

  const activeSlide = presentation.slides[activeSlideIndex] || presentation.slides[0];

  useEffect(() => {
    if (activeSlide) {
      setImagePrompt(activeSlide.imagePrompt || '');
    }
  }, [activeSlideIndex, activeSlide]);

  // Simulate auto-save when presentation changes
  useEffect(() => {
    if (presentation === initialPresentation) return;
    setAutoSaveState('saving');
    const timer = setTimeout(() => {
      // Auto-saves to localStorage or triggers server call silently
      localStorage.setItem(`draft_${presentation.id}`, JSON.stringify(presentation));
      setAutoSaveState('saved');
    }, 1200);
    return () => clearTimeout(timer);
  }, [presentation]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Handle slide edit
  const handleEditActiveSlide = (updatedFields: Partial<Slide>) => {
    const updatedSlides = [...presentation.slides];
    updatedSlides[activeSlideIndex] = {
      ...activeSlide,
      ...updatedFields
    };

    setPresentation({
      ...presentation,
      slides: updatedSlides
    });
  };

  // Bullet point edits
  const handleEditBullet = (bulletIdx: number, text: string) => {
    const updatedBullets = [...activeSlide.bullets];
    updatedBullets[bulletIdx] = text;
    handleEditActiveSlide({ bullets: updatedBullets });
  };

  const handleAddBullet = () => {
    const updatedBullets = [...activeSlide.bullets, 'New analysis criteria...'];
    handleEditActiveSlide({ bullets: updatedBullets });
  };

  const handleRemoveBullet = (bulletIdx: number) => {
    const updatedBullets = activeSlide.bullets.filter((_, idx) => idx !== bulletIdx);
    handleEditActiveSlide({ bullets: updatedBullets });
  };

  // Change Theme dynamically
  const handleThemeChange = (newTheme: PresentationTheme) => {
    setPresentation({
      ...presentation,
      theme: newTheme
    });
    showToast(`Applied theme layout: ${THEMES[newTheme].name}`);
  };

  // Add slide
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: 'slide_' + Math.random().toString(36).substr(2, 9),
      title: 'Dynamic Innovation Overview',
      bullets: ['Insight parameter details', 'Future implementation milestones'],
      speakerNotes: 'Introduce the core focus criteria for this secondary layout parameter...',
      imagePrompt: 'A futuristic clean workspace with high contrast neon highlights',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      layout: 'bullets'
    };

    const updatedSlides = [...presentation.slides];
    updatedSlides.splice(activeSlideIndex + 1, 0, newSlide);

    setPresentation({
      ...presentation,
      slides: updatedSlides
    });
    setActiveSlideIndex(activeSlideIndex + 1);
    showToast("Added new workspace slide");
  };

  // Delete slide
  const handleDeleteSlide = (index: number) => {
    if (presentation.slides.length <= 1) return;

    const updatedSlides = presentation.slides.filter((_, idx) => idx !== index);
    setPresentation({
      ...presentation,
      slides: updatedSlides
    });

    if (activeSlideIndex >= updatedSlides.length) {
      setActiveSlideIndex(updatedSlides.length - 1);
    }
    showToast("Deleted workspace slide");
  };

  // Reordering slides
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const updatedSlides = [...presentation.slides];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= updatedSlides.length) return;

    // Swap
    const temp = updatedSlides[index];
    updatedSlides[index] = updatedSlides[newIdx];
    updatedSlides[newIdx] = temp;

    setPresentation({
      ...presentation,
      slides: updatedSlides
    });
    setActiveSlideIndex(newIdx);
  };

  // Save changes to Database manually
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/presentations/${presentation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(presentation)
      });

      if (!res.ok) throw new Error('Failed to save presentation');

      setSaveSuccess(true);
      showToast("Manual modifications saved successfully!");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error(e);
      showToast("Manual synchronization failed.");
    } finally {
      setIsSaving(false);
    }
  };

  // Regenerate slide image based on current prompt and Selected Style dropdown
  const handleRegenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setImageError('');

    // Append visual style keywords to matching output
    const styleSuffixes = {
      photorealistic: 'photorealistic, high-stakes ultra-sharp real camera photography, 8k resolution',
      modern: 'clean modern vector graphic, tech-focused design layout, sleek accents',
      minimalist: 'minimalist design backdrop, high negative space, pastel corporate tones',
      artistic: 'artistic oil canvas, fluid glowing brushwork illustration, vibrant gradients'
    };

    const styledPrompt = `${imagePrompt}, style: ${styleSuffixes[imageStyle]}`;

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: styledPrompt })
      });

      const data = await res.json();
      if (!res.ok || !data.imageUrl) {
        throw new Error('Could not fetch new visual representation');
      }

      handleEditActiveSlide({
        imageUrl: data.imageUrl,
        imagePrompt: imagePrompt
      });
      showToast(`Visual asset generated: Style "${imageStyle}"`);
    } catch (err: any) {
      setImageError(err.message || 'Image loading failed.');
    } finally {
      setImageLoading(false);
    }
  };

  // Manual URL pasting
  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    handleEditActiveSlide({ imageUrl: manualUrl });
    setManualUrl('');
    setShowUrlInput(false);
    showToast("Successfully applied custom asset link");
  };

  // Share via Link copy simulator
  const handleShareLink = async () => {
    try {
      const response = await fetch("/api/export/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auraslides_token") || ""}`
        },
        body: JSON.stringify({ presentationId: presentation.id })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.shareUrl) {
          navigator.clipboard.writeText(data.shareUrl);
          showToast("AuraSlides premium shared link generated and copied! 🔗");
          return;
        }
      }
    } catch (e) {
      console.log("Server share endpoint failed, falling back to local simulation.", e);
    }

    const url = `${window.location.origin}/share/view/${presentation.id}`;
    navigator.clipboard.writeText(url);
    showToast("Public view-only link copied to your clipboard! 🔗");
  };

  // Exports
  const handleExport = async (format: 'pptx' | 'pdf' | 'images') => {
    setIsExporting(format);
    try {
      if (format === 'pptx') {
        try {
          const res = await fetch("/api/export/pptx", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("auraslides_token") || ""}`
            },
            body: JSON.stringify({ presentation })
          });
          if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${presentation.topic.replace(/\s+/g, '_')}.pptx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast("Server-rendered PowerPoint editable PPTX exported!");
            return;
          }
        } catch (serverErr) {
          console.warn("Server export failed, falling back to local PPTX writer", serverErr);
        }
        await exportToPPTX(presentation);
        showToast("PowerPoint editable PPTX exported!");
      } else if (format === 'pdf') {
        try {
          const res = await fetch("/api/export/pdf", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("auraslides_token") || ""}`
            },
            body: JSON.stringify({ presentation })
          });
          if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${presentation.topic.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast("Server-rendered high fidelity PDF exported! 📄");
            return;
          }
        } catch (serverErr) {
          console.warn("Server PDF export failed, falling back to local PDF writer", serverErr);
        }
        await exportToPDF(presentation);
        showToast("High fidelity PDF exported! 📄");
      } else {
        // Simulate image rendering download zip
        setTimeout(() => {
          showToast("Standard high-resolution PNG batch extracted!");
          setIsExporting(null);
        }, 1500);
        return;
      }
    } catch (e) {
      console.error(e);
      showToast("Extraction failed.");
    } finally {
      setIsExporting(null);
    }
  };

  // Handle keyboard events in Presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentMode) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setPresentSlideIdx((prev) => Math.min(presentation.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setPresentSlideIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresentMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentMode, presentation.slides.length]);

  const themeInfo = THEMES[presentation.theme];
  const presentSlide = presentation.slides[presentSlideIdx] || presentation.slides[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden" id="editor-workspace">
      
      {/* Toast Notification alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-xl shadow-indigo-950/40 border border-indigo-500/30 flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 animate-spin text-indigo-300" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Workspace Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shrink-0" id="editor-nav">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className="p-2 bg-slate-950 hover:bg-slate-855 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-all cursor-pointer"
            title="Return to Dashboard Space"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase block">AI Workspace Editor</span>
              {/* Auto Save Pill notification */}
              <span className="inline-flex items-center gap-1 text-[8px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">
                <span className={`w-1 h-1 rounded-full ${autoSaveState === 'saving' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                <span>{autoSaveState === 'saving' ? 'Autosaving...' : 'Workspace Saved'}</span>
              </span>
            </div>
            <input
              type="text"
              value={presentation.topic}
              onChange={(e) => setPresentation({ ...presentation, topic: e.target.value })}
              className="text-sm font-black text-white bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 outline-none pb-0.5 max-w-[280px] sm:max-w-md transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Workspace controls */}
        <div className="flex items-center gap-3">
          
          {/* Theme customizer layout selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg">
            {Object.keys(THEMES).map((key) => {
              const item = THEMES[key as PresentationTheme];
              const isSel = presentation.theme === key;
              return (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key as PresentationTheme)}
                  title={`Apply Layout Style: ${item.name}`}
                  className={`p-1.5 rounded transition-all cursor-pointer ${isSel ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          {/* Present Mode button */}
          <button
            onClick={() => { setPresentSlideIdx(activeSlideIndex); setIsPresentMode(true); }}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-all"
            title="Launch Present Mode (Full Screen)"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* Share via Link button */}
          <button
            onClick={handleShareLink}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Copy read-only public workspace link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Manual Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save'}</span>
          </button>

          {/* Split Exporter Controls */}
          <div className="flex items-center gap-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all font-bold text-[10px] p-1">
            <button
              onClick={() => handleExport('pptx')}
              disabled={isExporting !== null}
              className="px-2.5 py-1.5 hover:bg-white/10 rounded cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PPTX</span>
            </button>
            <div className="w-px h-3.5 bg-white/30" />
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting !== null}
              className="px-2.5 py-1.5 hover:bg-white/10 rounded cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace split view */}
      <div className="flex-1 flex overflow-hidden" id="workspace-layout">
        
        {/* Left Side: Slide thumbnails list */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 overflow-hidden" id="editor-sidebar">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/30">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Slides ({presentation.slides.length})</span>
            <button
              onClick={handleAddSlide}
              className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-indigo-400 hover:text-indigo-300 rounded transition-all cursor-pointer"
              title="Add slide"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-950/20" id="thumbnails-container">
            {presentation.slides.map((slide, index) => {
              const isActive = index === activeSlideIndex;
              return (
                <div 
                  key={slide.id}
                  onClick={() => setActiveSlideIndex(index)}
                  className={`group relative p-3 border rounded-xl text-left transition-all cursor-pointer ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-950/25 shadow-lg shadow-indigo-950/20' 
                      : 'border-slate-850 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 bg-slate-950 border border-slate-800 w-5 h-5 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    
                    {/* Move and delete controls */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(index, 'up'); }}
                        disabled={index === 0}
                        className="p-0.5 text-slate-500 hover:text-indigo-400 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(index, 'down'); }}
                        disabled={index === presentation.slides.length - 1}
                        className="p-0.5 text-slate-500 hover:text-indigo-400 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSlide(index); }}
                        disabled={presentation.slides.length <= 1}
                        className="p-0.5 text-slate-500 hover:text-rose-400 cursor-pointer disabled:opacity-20"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h5 className="text-xs font-black text-slate-300 line-clamp-1 pr-4">{slide.title || 'Untitled Slide'}</h5>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block mt-1 capitalize">{slide.layout} style layout</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Middle Area: Interactive WYSIWYG Slide Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8 flex flex-col items-center justify-center" id="editor-main-canvas">
          
          {/* Active slide layout control rail */}
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-sm mb-6 flex items-center justify-between" id="canvas-controls">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-slate-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-400">Slide Presentation Layout:</span>
            </div>

            <div className="flex items-center border border-slate-800 rounded-lg bg-slate-950 p-1">
              {['title', 'split', 'bullets', 'quote', 'hero'].map((lay) => (
                <button
                  key={lay}
                  onClick={() => handleEditActiveSlide({ layout: lay as any })}
                  className={`text-[9px] uppercase font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeSlide.layout === lay 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lay}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Presentation Slide Container */}
          <div 
            className={`w-full max-w-4xl aspect-[16/9] shadow-2xl rounded-2xl p-10 flex flex-col justify-between transition-all overflow-hidden relative ${themeInfo.bg} ${themeInfo.text}`}
            id="slide-canvas-body"
          >
            {/* Slide heading branding decoration */}
            <div className="flex items-center justify-between" id="slide-decoration-header">
              <span className={`text-[10px] font-black uppercase tracking-widest ${themeInfo.accentText} ${themeInfo.fonts.heading}`}>
                {presentation.topic}
              </span>
              <span className="text-xs font-bold text-slate-500 opacity-60">
                Slide {activeSlideIndex + 1} of {presentation.slides.length}
              </span>
            </div>

            {/* WYSIWYG Canvas Views depending on slide layout */}
            <div className="flex-1 flex flex-col justify-center my-6" id="slide-canvas-main">
              {activeSlide.layout === 'title' ? (
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={(e) => handleEditActiveSlide({ title: e.target.value })}
                    className={`w-full text-center bg-transparent outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-500 pb-1 text-2xl sm:text-3xl font-black ${themeInfo.fonts.heading}`}
                    placeholder="Enter Slide Title"
                  />
                  
                  {/* Bullet points editable as simple subtitle paragraph list */}
                  <div className="space-y-1.5">
                    {activeSlide.bullets.map((bullet, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={bullet}
                        onChange={(e) => handleEditBullet(idx, e.target.value)}
                        className={`w-full text-center bg-transparent text-xs sm:text-sm outline-none hover:border-b hover:border-white/10 focus:border-indigo-500 opacity-80 ${themeInfo.fonts.body}`}
                      />
                    ))}
                  </div>
                </div>
              ) : activeSlide.layout === 'split' ? (
                <div className="grid grid-cols-2 gap-8 items-center h-full">
                  
                  {/* Left: Interactive/Zoom Image block with hover zoom preview */}
                  <div className="relative h-full aspect-[16/10] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center group overflow-hidden">
                    {imageLoading ? (
                      <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Compiling asset...</span>
                      </div>
                    ) : activeSlide.imageUrl ? (
                      <img 
                        src={activeSlide.imageUrl} 
                        alt="Slide Visual Layout" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">No image asset</span>
                      </div>
                    )}
                    {/* Hover indicator preview overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 px-2.5 py-1 rounded text-[9px] uppercase font-bold text-slate-300">
                      Hover preview zoom
                    </div>
                  </div>

                  {/* Right: Content details */}
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={activeSlide.title}
                      onChange={(e) => handleEditActiveSlide({ title: e.target.value })}
                      className={`w-full bg-transparent outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-500 pb-1 text-xl sm:text-2xl font-extrabold ${themeInfo.fonts.heading}`}
                    />

                    <div className="space-y-2.5">
                      {activeSlide.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2 group/bullet">
                          <span className={`${themeInfo.accentText} mt-1 shrink-0`}>•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleEditBullet(idx, e.target.value)}
                            className={`flex-1 bg-transparent text-xs sm:text-sm outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-500 pb-0.5 ${themeInfo.fonts.body}`}
                          />
                          <button
                            onClick={() => handleRemoveBullet(idx)}
                            className="opacity-0 group-hover/bullet:opacity-100 p-0.5 text-rose-400 hover:bg-rose-950/40 rounded transition-opacity"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddBullet}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer pt-1 uppercase tracking-wider"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeSlide.layout === 'quote' ? (
                <div className="text-center max-w-2xl mx-auto space-y-6">
                  <textarea
                    value={activeSlide.title}
                    onChange={(e) => handleEditActiveSlide({ title: e.target.value })}
                    rows={2}
                    className={`w-full text-center bg-transparent outline-none border border-transparent hover:border-white/10 focus:border-indigo-500 p-2 text-lg sm:text-xl italic font-bold leading-relaxed resize-none ${themeInfo.fonts.heading}`}
                  />
                  <div className="h-[1px] w-12 bg-indigo-500/40 mx-auto" />
                  <div className="space-y-1">
                    {activeSlide.bullets.map((b, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={b}
                        onChange={(e) => handleEditBullet(idx, e.target.value)}
                        className={`w-full text-center bg-transparent text-xs font-semibold opacity-75 outline-none ${themeInfo.fonts.body}`}
                      />
                    ))}
                  </div>
                </div>
              ) : activeSlide.layout === 'hero' ? (
                <div className="text-center max-w-xl mx-auto space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/50 border border-indigo-900/30 px-3 py-1 rounded-full">Core Metric Highlight</span>
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={(e) => handleEditActiveSlide({ title: e.target.value })}
                    className={`w-full text-center bg-transparent outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-500 pb-1 text-2xl sm:text-3xl font-black ${themeInfo.fonts.heading}`}
                  />
                </div>
              ) : (
                // Bullets list standard slide
                <div className="space-y-5">
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={(e) => handleEditActiveSlide({ title: e.target.value })}
                    className={`w-full bg-transparent outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-500 pb-1 text-xl sm:text-2xl font-extrabold ${themeInfo.fonts.heading}`}
                  />

                  <div className="space-y-3">
                    {activeSlide.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 group/bullet">
                        <span className={`${themeInfo.accentText} mt-1 shrink-0`}>•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleEditBullet(idx, e.target.value)}
                          className={`flex-1 bg-transparent text-xs sm:text-sm outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-500 pb-0.5 ${themeInfo.fonts.body}`}
                        />
                        <button
                          onClick={() => handleRemoveBullet(idx)}
                          className="opacity-0 group-hover/bullet:opacity-100 p-0.5 text-rose-400 hover:bg-rose-950/40 rounded transition-opacity"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddBullet}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer pt-1 uppercase tracking-wider"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Bullet Point</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Slide footer signature decor */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4" id="slide-decoration-footer">
              <span className="text-[9px] font-bold text-slate-500">AuraSlides AI Document Engine</span>
              <div className="flex gap-1">
                {themeInfo.palette.slice(0, 3).map((col, idx) => (
                  <div key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                ))}
              </div>
            </div>
          </div>

          {/* Lower Panel: Speaker notes and Image prompt options */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-8" id="lower-editor-panels">
            
            {/* Speaker Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-white border-b border-slate-800 pb-2 justify-between">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Presenter Speech script</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold">Auto-saves drafts</span>
              </div>
              <textarea
                value={activeSlide.speakerNotes}
                onChange={(e) => handleEditActiveSlide({ speakerNotes: e.target.value })}
                rows={4}
                placeholder="Write presenter notes or custom text summary..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 rounded-lg outline-none text-xs text-slate-300 transition-all resize-none placeholder:text-slate-600"
              />
            </div>

            {/* Image Prompt Generation Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-white border-b border-slate-800 pb-2 justify-between">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Image Asset Style Controls</span>
                </div>
                
                {/* Style Dropdown Selector */}
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value as any)}
                  className="text-[10px] font-bold border border-slate-800 bg-slate-950 rounded px-2 py-0.5 text-indigo-400 outline-none cursor-pointer"
                >
                  <option value="modern">Modern Vector</option>
                  <option value="photorealistic">Photorealistic</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="artistic">Artistic Paint</option>
                </select>
              </div>

              {imageError && (
                <div className="p-2 bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{imageError}</span>
                </div>
              )}

              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Image description keyword prompt..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 rounded-lg outline-none text-xs text-slate-300 transition-all placeholder:text-slate-600"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleRegenerateImage}
                  disabled={imageLoading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400/50 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {imageLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5" />
                  )}
                  <span>{imageLoading ? 'Synthesizing...' : 'Regenerate Image'}</span>
                </button>

                {/* Manual Fallback Action button */}
                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:text-white text-slate-400 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                  title="Apply custom image URL"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* URL fallback Input drawer */}
              {showUrlInput && (
                <div className="pt-2 flex gap-2 animate-fade-in border-t border-slate-800/40 mt-1">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs outline-none text-slate-300 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleApplyManualUrl}
                    className="px-3 bg-indigo-600 text-white font-bold text-xs rounded hover:bg-indigo-500 transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* PRESENTATION MODE MODAL LAYOUT */}
      <AnimatePresence>
        {isPresentMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 sm:p-12"
            id="presentation-modal"
          >
            {/* Modal Top Control header */}
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-indigo-600 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">Presenting Live</span>
                <span className="text-xs font-bold text-slate-300">{presentation.topic}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPresentNotes(!showPresentNotes)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all border border-slate-800 ${showPresentNotes ? 'bg-indigo-600 text-white border-indigo-500' : 'hover:bg-slate-900 text-slate-300'}`}
                >
                  Speaker Notes
                </button>
                <button
                  onClick={() => setIsPresentMode(false)}
                  className="p-1.5 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg border border-slate-800 cursor-pointer"
                  title="Exit Presentation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Core Slide Layout */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 my-6">
              
              {/* Actual Presenting Slide container with aspect-ratio constraint */}
              <div 
                className={`w-full max-w-5xl aspect-[16/9] rounded-2xl p-12 flex flex-col justify-between shadow-2xl overflow-hidden relative ${themeInfo.bg} ${themeInfo.text}`}
              >
                {/* Brand Indicator */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase tracking-widest ${themeInfo.accentText} ${themeInfo.fonts.heading}`}>
                    {presentation.topic}
                  </span>
                  <span className="text-xs font-bold text-slate-500 opacity-60">
                    Slide {presentSlideIdx + 1} of {presentation.slides.length}
                  </span>
                </div>

                {/* Content Rendering depending on layout */}
                <div className="flex-1 flex flex-col justify-center my-6">
                  {presentSlide.layout === 'title' ? (
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <h2 className={`text-3xl sm:text-5xl font-black ${themeInfo.fonts.heading}`}>{presentSlide.title}</h2>
                      <div className="space-y-1.5 opacity-90">
                        {presentSlide.bullets.map((b, i) => (
                          <p key={i} className={`text-sm sm:text-base ${themeInfo.fonts.body}`}>{b}</p>
                        ))}
                      </div>
                    </div>
                  ) : presentSlide.layout === 'split' ? (
                    <div className="grid grid-cols-2 gap-8 items-center h-full">
                      <div className="h-full aspect-[16/10] bg-slate-900 border border-slate-800/40 rounded-xl overflow-hidden flex items-center justify-center">
                        {presentSlide.imageUrl && (
                          <img src={presentSlide.imageUrl} alt="Visual aspect" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div className="space-y-4 text-left">
                        <h2 className={`text-2xl sm:text-3xl font-extrabold ${themeInfo.fonts.heading}`}>{presentSlide.title}</h2>
                        <div className="space-y-2">
                          {presentSlide.bullets.map((b, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-sm sm:text-base">
                              <span className={`${themeInfo.accentText} mt-1 shrink-0`}>•</span>
                              <span className={themeInfo.fonts.body}>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : presentSlide.layout === 'quote' ? (
                    <div className="text-center max-w-2xl mx-auto space-y-6">
                      <p className={`text-xl sm:text-3xl italic font-bold leading-relaxed ${themeInfo.fonts.heading}`}>"{presentSlide.title}"</p>
                      <div className="h-[1px] w-12 bg-indigo-500/40 mx-auto" />
                      {presentSlide.bullets.map((b, i) => (
                        <p key={i} className={`text-sm font-bold opacity-75 ${themeInfo.fonts.body}`}>{b}</p>
                      ))}
                    </div>
                  ) : presentSlide.layout === 'hero' ? (
                    <div className="text-center max-w-xl mx-auto space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/50 border border-indigo-900/30 px-4 py-1.5 rounded-full">Primary Metric</span>
                      <h2 className={`text-3xl sm:text-5xl font-black ${themeInfo.fonts.heading}`}>{presentSlide.title}</h2>
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${themeInfo.fonts.heading}`}>{presentSlide.title}</h2>
                      <div className="space-y-3.5">
                        {presentSlide.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm sm:text-base">
                            <span className={`${themeInfo.accentText} mt-1 shrink-0`}>•</span>
                            <span className={themeInfo.fonts.body}>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer decorations */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[9px] font-bold text-slate-500">AuraSlides Presenter Mode v2.5</span>
                  <div className="flex gap-1">
                    {themeInfo.palette.slice(0, 3).map((col, idx) => (
                      <div key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Side drawer for speaker script script notes */}
              {showPresentNotes && (
                <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 p-5 rounded-2xl self-stretch flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-300 border-b border-slate-800 pb-2">
                      <FileText className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest">Presenter script notes</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed max-h-[300px] overflow-y-auto">
                      {presentSlide.speakerNotes || "No notes configured for this slide. Speak naturally."}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 font-semibold">
                    Use Arrow Keys or space bar to cycle slides.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom pagination controls */}
            <div className="flex items-center justify-between text-slate-500 border-t border-slate-900 pt-3">
              <span className="text-xs font-bold uppercase tracking-wider">Slide {presentSlideIdx + 1} of {presentation.slides.length}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setPresentSlideIdx((prev) => Math.max(0, prev - 1))}
                  disabled={presentSlideIdx === 0}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg border border-slate-800 cursor-pointer disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPresentSlideIdx((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
                  disabled={presentSlideIdx === presentation.slides.length - 1}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
