import React, { useState } from 'react';
import { 
  Cpu, ArrowLeft, Sliders, Layers, Eye, Check, Plus, 
  Trash, ArrowUp, ArrowDown, HelpCircle, AlertCircle, RefreshCw, Compass
} from 'lucide-react';
import { PresentationTheme, THEMES, Slide } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CreateFlowProps {
  onBackToDashboard: () => void;
  onPresentationCreated: (presentation: any) => void;
  token: string;
}

interface OutlineSlide {
  title: string;
  description: string;
}

export default function CreateFlow({ onBackToDashboard, onPresentationCreated, token }: CreateFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1 states
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [isContextFocused, setIsContextFocused] = useState(false);
  const [slideCount, setSlideCount] = useState(6);
  const [aiImagesEnabled, setAiImagesEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<PresentationTheme>('modern');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2 states (Outline)
  const [outline, setOutline] = useState<OutlineSlide[]>([]);

  // Step 3 states (Full slide generation progress)
  const [progressMsg, setProgressMsg] = useState('');
  const [percentProgress, setPercentProgress] = useState(0);

  // Trigger Outline Generation
  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('A presentation topic is required to guide the AI.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          context,
          slideCount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate outline.');
      }

      setOutline(data.slides || []);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Outline generation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reordering Outline
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const updated = [...outline];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= updated.length) return;

    // Swap
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setOutline(updated);
  };

  // Editing slide titles and descriptions
  const handleEditOutline = (index: number, field: 'title' | 'description', val: string) => {
    const updated = [...outline];
    updated[index][field] = val;
    setOutline(updated);
  };

  // Add slide
  const handleAddSlideToOutline = () => {
    setOutline([
      ...outline,
      { title: 'New slide aspect', description: 'Brief overview focus description...' }
    ]);
  };

  // Remove slide
  const handleRemoveSlideFromOutline = (index: number) => {
    if (outline.length <= 3) {
      setError('Your presentation should contain at least 3 slides for logical flow.');
      return;
    }
    setError('');
    const updated = outline.filter((_, idx) => idx !== index);
    setOutline(updated);
  };

  // Generate full presentation based on outline
  const handleGenerateFullSlides = async () => {
    setError('');
    setStep(3);
    setPercentProgress(10);
    setProgressMsg('AI is structuring slide contents and extracting core concepts...');

    try {
      // Step 1: Query Gemini on server to produce slides
      const res = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          theme: selectedTheme,
          outline
        })
      });

      setPercentProgress(45);
      setProgressMsg('Writing high-impact bullet points and generating presentation script...');

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate full slides.');
      }

      const generatedSlides = data.slides || [];
      const enrichedSlides: Slide[] = [];

      setPercentProgress(70);
      setProgressMsg('Designing beautiful visual layouts and matching stock imagery...');

      // Step 2: Extract prompts & generate or resolve high quality visuals
      for (let i = 0; i < generatedSlides.length; i++) {
        const slideItem = generatedSlides[i];
        let imageUrl = null;

        if (aiImagesEnabled && slideItem.imagePrompt) {
          try {
            const imgRes = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: slideItem.imagePrompt })
            });
            const imgData = await imgRes.json();
            imageUrl = imgData.imageUrl;
          } catch (e) {
            console.error("Image gen failed for slide", i, e);
          }
        }

        enrichedSlides.push({
          id: 'slide_' + Math.random().toString(36).substr(2, 9),
          title: slideItem.title,
          bullets: slideItem.bullets || [],
          speakerNotes: slideItem.speakerNotes || '',
          imagePrompt: slideItem.imagePrompt || '',
          imageUrl,
          layout: slideItem.layout || 'bullets'
        });
      }

      setPercentProgress(90);
      setProgressMsg('Finalizing database registration and theme configurations...');

      // Save to server database
      const saveRes = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          slideCount: enrichedSlides.length,
          theme: selectedTheme,
          slides: enrichedSlides,
          status: 'complete'
        })
      });

      const finalPresentation = await saveRes.json();
      setPercentProgress(100);
      setProgressMsg('Presentation completed! Launching editor workspace...');

      setTimeout(() => {
        onPresentationCreated(finalPresentation);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Slide generation workspace failed.');
      setStep(2); // Roll back to outline editor
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden" id="create-flow-page">
      {/* Dynamic Animated background particles */}
      <div className="absolute top-1/3 left-10 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping opacity-30" />
      <div className="absolute bottom-1/4 right-10 w-2 h-2 bg-rose-500 rounded-full animate-ping opacity-25" />
      <div className="absolute top-10 right-1/4 w-1 h-1 bg-purple-500 rounded-full animate-pulse opacity-40" />

      {/* Mini Progress Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/85 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shrink-0" id="create-header">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-950 border border-slate-800 hover:bg-slate-900 px-3.5 py-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-3" id="steps-indicator">
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1</span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hidden sm:block">Configuration</span>
          </div>
          <div className="w-6 h-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2</span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hidden sm:block">Outline Review</span>
          </div>
          <div className="w-6 h-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>3</span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hidden sm:block">Compilation</span>
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/30 text-rose-300 rounded-xl flex items-start gap-3 text-xs shadow-sm" id="create-error">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Input Topic & Configuration */}
        {step === 1 && (
          <form onSubmit={handleGenerateOutline} className="bg-slate-900 border border-slate-800/80 shadow-2xl rounded-2xl p-8 space-y-8" id="step-1-form">
            <div className="border-b border-slate-800 pb-5">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <span>Describe Your Presentation Focus</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Provide a primary topic, slide quantity, and preferred design theme.</p>
            </div>

            {/* Topic Input with scale on focus */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presentation Topic</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Future of Sustainable Hydrogen Propulsion Systems"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            {/* Additional Context - expanding textarea on focus */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Context & Guidance (Optional)</label>
              <motion.textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                onFocus={() => setIsContextFocused(true)}
                onBlur={() => setIsContextFocused(false)}
                animate={{ height: isContextFocused ? 120 : 70 }}
                transition={{ duration: 0.3 }}
                placeholder="e.g., Target audience is automotive investors. Use analytical, high-stakes tone. Keep slides clean and technical."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-xs outline-none transition-all resize-none placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slide Count Slider */}
              <div className="space-y-1.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slide Deck Length</label>
                  <motion.span 
                    key={slideCount}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-black text-indigo-400 bg-indigo-950/60 border border-indigo-900/30 px-2.5 py-0.5 rounded"
                  >
                    {slideCount} Slides
                  </motion.span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={15}
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none mt-3"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1">
                  <span>5 Slides</span>
                  <span>10 Slides</span>
                  <span>15 Slides</span>
                </div>
              </div>

              {/* AI Image toggle */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI Generated Visuals</label>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Generate high-fidelity graphics</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiImagesEnabled(!aiImagesEnabled)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer outline-none ${aiImagesEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-white shadow transition-all ${aiImagesEnabled ? 'translate-x-5.5' : ''}`} />
                </button>
              </div>
            </div>

            {/* Theme selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Aesthetic Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" id="theme-grid-selector">
                {Object.keys(THEMES).map((key) => {
                  const theme = THEMES[key as PresentationTheme];
                  const isSelected = selectedTheme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedTheme(key as PresentationTheme)}
                      className={`p-3.5 border rounded-xl text-left flex flex-col justify-between h-28 transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-950/20' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black text-white block leading-tight">{theme.name}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 block capitalize">{theme.id} layout</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {theme.palette.slice(0, 3).map((color, idx) => (
                          <div key={idx} className="w-3.5 h-3.5 rounded-full border border-slate-900" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit button with pulse animation */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-indigo-400/50 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              id="generate-outline-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Drafting Outline structure...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-indigo-300 animate-pulse" />
                  <span>Create Slide Outline</span>
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* STEP 2: Outline Review and Edit */}
        {step === 2 && (
          <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 space-y-6 animate-fade-in" id="outline-editor">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <span>Review Presentation Outline</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Verify slide structure sequence, insert new focus panels, or edit layout topics.</p>
              </div>

              <button
                onClick={handleAddSlideToOutline}
                className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>

            {/* Outline Cards List with stagger animation */}
            <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-2" id="outline-cards-container">
              {outline.map((slide, index) => (
                <div 
                  key={index} 
                  className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col items-center gap-1.5 shrink-0 pt-1">
                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-950/60 border border-indigo-900/30 w-7 h-7 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1 mt-1">
                      <button
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === outline.length - 1}
                        className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleEditOutline(index, 'title', e.target.value)}
                      placeholder="Slide Title"
                      className="w-full font-extrabold text-white bg-transparent border-b border-dashed border-slate-800 focus:border-indigo-500 outline-none pb-0.5 text-sm"
                    />
                    <input
                      type="text"
                      value={slide.description}
                      onChange={(e) => handleEditOutline(index, 'description', e.target.value)}
                      placeholder="Slide focus description"
                      className="w-full text-xs text-slate-400 bg-transparent focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveSlideFromOutline(index)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer self-start"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-5 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                Back to Config
              </button>

              <button
                onClick={handleGenerateFullSlides}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                id="generate-slides-final-btn"
              >
                <Cpu className="w-4 h-4 text-indigo-300" />
                <span>Compile & Create Slides</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Progress State */}
        {step === 3 && (
          <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-10 text-center space-y-6 flex flex-col items-center justify-center" id="generation-loader">
            <div className="relative w-20 h-20 mb-2">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                <Cpu className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h4 className="text-lg font-black text-white">AuraSlides AI compiling</h4>
              <p className="text-slate-400 text-xs min-h-[32px] leading-relaxed font-semibold">{progressMsg}</p>
            </div>

            {/* Custom Progress bar */}
            <div className="w-full max-w-xs bg-slate-950 h-2 rounded-full overflow-hidden relative border border-slate-800">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-rose-500 h-full transition-all duration-500"
                style={{ width: `${percentProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{percentProgress}% Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
