import React, { useState, useRef } from 'react';
import { Upload, FileImage, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ScheduleItem } from '../types';

interface UploadScheduleProps {
  onScheduleGenerated: (schedule: ScheduleItem[]) => void;
}

export const UploadSchedule: React.FC<UploadScheduleProps> = ({ onScheduleGenerated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file (PNG, JPG).");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Max size is 5MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Remove Data URL prefix for API
      const base64Data = previewUrl.split(',')[1];
      const schedule = await geminiService.parseScheduleImage(base64Data);
      
      if (schedule.length === 0) {
        throw new Error("No classes found. Please ensure the image is a clear weekly schedule.");
      }

      onScheduleGenerated(schedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate schedule.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Upload Your Schedule</h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">Take a screenshot of your weekly timetable and let AI build your tracker.</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-10 transition-all text-center group
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-gray-400'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        {!previewUrl ? (
          <div className="flex flex-col items-center cursor-pointer py-4" onClick={() => fileInputRef.current?.click()}>
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <p className="text-base sm:text-lg font-medium text-gray-700">Click to upload or drag and drop</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
          </div>
        ) : (
          <div className="relative group/preview">
            <img 
              src={previewUrl} 
              alt="Schedule Preview" 
              className="max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md object-contain" 
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setPreviewUrl(null);
                setError(null);
              }}
              className="absolute top-2 right-2 bg-white text-gray-700 p-1.5 rounded-full shadow hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-medium text-sm sm:text-base">
              <FileImage className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 text-sm sm:text-base">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button 
          disabled={!selectedFile} 
          isLoading={isProcessing} 
          onClick={handleGenerate}
          className="w-full sm:w-auto text-base py-3 sm:py-2"
        >
          {isProcessing ? 'Analyzing Schedule...' : 'Generate Tracker'}
        </Button>
      </div>
    </div>
  );
};