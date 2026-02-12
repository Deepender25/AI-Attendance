import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileImage, AlertCircle, X, Trash2, Save, Filter, Clock, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ScheduleItem } from '../types';
import { detectConflicts, resolveConflicts, Conflict } from '../utils/conflictDetector';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadScheduleProps {
  onScheduleGenerated: (schedule: ScheduleItem[]) => void;
}

type ViewState = 'upload' | 'conflicts' | 'review';

export const UploadSchedule: React.FC<UploadScheduleProps> = ({ onScheduleGenerated }) => {
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flow State
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [rawSchedule, setRawSchedule] = useState<ScheduleItem[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [conflictSelections, setConflictSelections] = useState<Record<string, string>>({});
  const [finalSchedule, setFinalSchedule] = useState<ScheduleItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Upload Logic ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file (PNG, JPG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Max size is 5MB.");
      return;
    }
    setSelectedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsProcessing(true);
    setError(null);

    try {
      const base64Data = previewUrl.split(',')[1];
      const items = await geminiService.parseScheduleImage(base64Data);

      if (items.length === 0) {
        throw new Error("No classes found. Please upload a clearer image.");
      }

      setRawSchedule(items);

      // Detect conflicts
      const detectedConflicts = detectConflicts(items);
      setConflicts(detectedConflicts);

      if (detectedConflicts.length > 0) {
        setViewState('conflicts');
      } else {
        setFinalSchedule(items);
        setViewState('review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Conflict Resolution ---
  const handleConflictSelect = (conflictId: string, group: string) => {
    setConflictSelections(prev => ({ ...prev, [conflictId]: group }));
  };

  const allConflictsResolved = conflicts.every(c => conflictSelections[c.id]);

  const handleResolveConflicts = () => {
    const resolved = resolveConflicts(rawSchedule, conflicts, conflictSelections);
    setFinalSchedule(resolved);
    setViewState('review');
  };

  // --- Review Logic ---
  const handleDelete = (id: string) => {
    setFinalSchedule(prev => prev.filter(item => item.id !== id));
  };

  const groupedByDay = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped: Record<string, ScheduleItem[]> = {};
    days.forEach(d => grouped[d] = []);
    finalSchedule.forEach(item => {
      if (grouped[item.day]) grouped[item.day].push(item);
    });
    return grouped;
  }, [finalSchedule]);

  const resetFlow = () => {
    setViewState('upload');
    setSelectedFile(null);
    setPreviewUrl(null);
    setRawSchedule([]);
    setConflicts([]);
    setConflictSelections({});
    setFinalSchedule([]);
    setError(null);
  };

  // ===================== CONFLICT RESOLUTION VIEW =====================
  if (viewState === 'conflicts') {
    return (
      <GlassCard className="w-full max-w-2xl mx-auto bg-surface border-border flex flex-col h-full max-h-[85vh] md:max-h-full" noPadding>
        <div className="flex items-center gap-3 p-6 border-b border-border shrink-0">
          <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 text-text flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Resolve Conflicts</h2>
            <p className="text-zinc-500 text-sm">Select your group for conflicting time slots.</p>
          </div>
        </div>

        <div className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          <AnimatePresence>
            {conflicts.map((conflict, index) => (
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-text" />
                  <span className="font-semibold text-text">
                    {conflict.day} • {conflict.startTime} - {conflict.endTime}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {conflict.options.map((option) => {
                    const isSelected = conflictSelections[conflict.id] === option.group;
                    const subjects = option.items.map(i => i.subject).join(', ');

                    return (
                      <button
                        key={option.group}
                        onClick={() => handleConflictSelect(conflict.id, option.group)}
                        className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                          ? 'border-primary bg-primary text-background'
                          : 'border-border bg-transparent text-zinc-500 hover:border-text hover:text-text'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-background bg-background' : 'border-zinc-500'
                            }`}>
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </div>
                          <span className={`font-semibold text-sm ${isSelected ? 'text-background' : 'text-text'}`}>Group {option.group}</span>
                        </div>
                        <p className={`text-xs ml-6 truncate ${isSelected ? 'opacity-70' : 'text-zinc-500'}`}>{subjects}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-border bg-surface shrink-0 flex justify-between">
          <Button variant="secondary" onClick={resetFlow}>Cancel</Button>
          <Button disabled={!allConflictsResolved} onClick={handleResolveConflicts}>
            Continue
          </Button>
        </div>
      </GlassCard>
    );
  }

  // ===================== REVIEW VIEW =====================
  if (viewState === 'review') {
    return (
      <GlassCard className="w-full max-w-4xl mx-auto bg-surface border-border flex flex-col h-full max-h-[85vh] md:max-h-full" noPadding>
        <div className="flex items-center gap-3 p-6 border-b border-border shrink-0">
          <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 text-text flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Review Schedule</h2>
            <p className="text-zinc-500 text-sm">
              {finalSchedule.length} classes found. Scroll to review all.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {Object.entries(groupedByDay).map(([day, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={day} className="border border-border rounded-xl overflow-hidden shrink-0">
                <div className="bg-black/5 dark:bg-white/5 px-4 py-3 border-b border-border font-medium text-text flex justify-between">
                  <span>{day}</span>
                  <span className="text-xs opacity-70">{items.length} classes</span>
                </div>
                <div className="divide-y divide-border bg-zinc-50 dark:bg-black/20">
                  {items.map(item => (
                    <div key={item.id} className="p-3 flex gap-3 items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text truncate">{item.subject}</div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span>{item.startTime} - {item.endTime}</span>
                          {item.room && <span>📍 {item.room}</span>}
                          {item.group && <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 text-text rounded text-[10px] font-bold">G{item.group}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-border bg-surface shrink-0 flex justify-between">
          <Button variant="secondary" onClick={resetFlow}>Start Over</Button>
          <Button onClick={() => onScheduleGenerated(finalSchedule)}>
            <Save className="h-4 w-4 mr-2" />
            Save Schedule
          </Button>
        </div>
      </GlassCard>
    );
  }

  // ===================== UPLOAD VIEW =====================
  return (
    <GlassCard className="w-full max-w-xl mx-auto bg-surface border-border flex flex-col" noPadding>
      <div className="p-4 md:p-8 pb-0 md:pb-0 text-center">
        <div className="mb-4 md:mb-6 inline-flex p-3 md:p-4 rounded-full bg-black/5 dark:bg-white/5 text-text">
          <Calendar className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-text mb-1.5 md:mb-2">
          No Schedule Found
        </h2>
        <p className="text-zinc-500 mb-5 md:mb-8 max-w-sm mx-auto text-sm md:text-base">
          Upload your timetable image to get started. We'll extract your classes automatically.
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 pb-4 md:pb-8 gap-3 md:gap-4">
        <div className="flex-1 min-h-0 flex flex-col">
          <div
            className={`flex-1 relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 text-center group cursor-pointer overflow-hidden flex flex-col justify-center items-center ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary hover:bg-black/5 dark:hover:bg-white/5'
              } ${error ? 'border-red-500/50 bg-red-500/10' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

            {!previewUrl ? (
              <div className="flex flex-col items-center py-6">
                <div className="h-16 w-16 bg-black/5 dark:bg-white/5 text-zinc-400 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 shadow-sm">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="font-semibold text-text text-lg">Click to upload or drag and drop</p>
                <p className="text-sm text-zinc-500 mt-2">Supports PNG, JPG (max 5MB)</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center group/preview">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full rounded-xl shadow-lg object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg">Click to change</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110 z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 p-4 bg-red-500/10 text-red-500 rounded-xl flex items-center gap-3 text-sm border border-red-500/20"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="shrink-0 mt-2">
          <Button
            disabled={!selectedFile}
            isLoading={isProcessing}
            onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
            className="w-full py-6 text-lg shadow-none"
          >
            {isProcessing ? 'Analyzing Schedule...' : 'Analyze Schedule'}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};