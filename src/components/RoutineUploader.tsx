import React, { useState } from 'react';
import { Upload, Plus, FileText, FileSpreadsheet } from 'lucide-react';
import { parseRoutineText } from '../utils/routineParser';
import type { CourseSlot } from '../types';

interface RoutineUploaderProps {
  onRoutineParsed: (slots: CourseSlot[]) => void;
  onOpenManualForm: () => void;
}

export const RoutineUploader: React.FC<RoutineUploaderProps> = ({ onRoutineParsed, onOpenManualForm }) => {
  const [rawText, setRawText] = useState('');

  const handleTextParse = () => {
    if (!rawText.trim()) return;
    const parsedSlots = parseRoutineText(rawText);
    onRoutineParsed(parsedSlots);
    setRawText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsedSlots = parseRoutineText(content);
        onRoutineParsed(parsedSlots);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-base-200 p-6 rounded-2xl border border-base-300 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Import Routine
          </h2>
          <p className="text-xs opacity-70 mt-1">
            Upload an Excel/CSV routine file, paste raw text, or add slots manually.
          </p>
        </div>
        <button onClick={onOpenManualForm} className="btn btn-primary btn-sm gap-2 rounded-lg">
          <Plus className="w-4 h-4" /> Add Slot Manually
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-base-300 hover:border-primary/50 p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer relative bg-base-100/50 transition-colors">
          <input
            type="file"
            accept=".csv, .txt, .xlsx, .xls"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <FileSpreadsheet className="w-8 h-8 text-primary mb-2 opacity-80" />
          <p className="text-xs font-semibold">Click to upload Excel / CSV routine</p>
          <p className="text-[10px] opacity-60 mt-1">Supports .csv, .txt, .xlsx files</p>
        </div>

        <div className="space-y-2">
          <textarea
            className="textarea textarea-bordered w-full text-xs font-mono h-24"
            placeholder="Or paste routine text here (e.g. CSE345 Sunday 03:10 PM - 04:40 PM)..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="flex justify-end">
            <button onClick={handleTextParse} className="btn btn-secondary btn-sm gap-2 rounded-lg">
              <FileText className="w-4 h-4" /> Parse Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};