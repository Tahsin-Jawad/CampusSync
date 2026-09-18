import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Plus } from 'lucide-react';
import type { CourseSlot } from '../types';
import { parseExcelRoutine } from '../utils/routineParser';

interface RoutineUploaderProps {
  onRoutineParsed: (slots: CourseSlot[]) => void;
  onOpenManualForm: () => void;
}

export const RoutineUploader: React.FC<RoutineUploaderProps> = ({ onRoutineParsed, onOpenManualForm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      // Convert the uploaded file into an ArrayBuffer so XLSX can read it properly
      const arrayBuffer = await file.arrayBuffer();
      const slots = parseExcelRoutine(arrayBuffer);

      if (slots.length === 0) {
        setError('No courses found in the file. Please check your advising slip format.');
      } else {
        onRoutineParsed(slots);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to parse file. Make sure it is a valid Advising Slip Excel (.xlsx) file.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-base-200 to-base-300 p-5 sm:p-6 rounded-3xl border border-base-300 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-black text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Import Routine
          </h3>
          <p className="text-xs opacity-70 mt-0.5">
            Upload your official Advising Slip (Excel file) to auto-fill your weekly routine.
          </p>
        </div>

        <button onClick={onOpenManualForm} className="btn btn-primary btn-sm gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Course Manually
        </button>
      </div>

      <div className="border-2 border-dashed border-base-300 hover:border-primary/50 transition-colors rounded-2xl p-6 text-center bg-base-100 relative group cursor-pointer">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
        <div className="space-y-2 pointer-events-none">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <span className="loading loading-spinner text-primary"></span>
              <p className="text-xs font-medium">Parsing advising slip...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-primary mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold">
                Drop your <span className="text-primary underline">Advising Slip (Excel file)</span> here, or browse
              </div>
              <p className="text-[11px] opacity-50">Supports EWU portal generated .xlsx format</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-xs py-2">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};