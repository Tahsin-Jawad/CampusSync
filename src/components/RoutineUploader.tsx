import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';
import type { CourseSlot } from '../types/routine';
import { parseTimeAndDays } from '../utils/routineParser';

interface RoutineUploaderProps {
  onRoutineParsed: (slots: CourseSlot[]) => void;
  onOpenManualForm?: () => void;
}

export const RoutineUploader: React.FC<RoutineUploaderProps> = ({ onRoutineParsed, onOpenManualForm }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const slots: CourseSlot[] = [];
        let lastCourseCode = '';

        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          const strRow = row.map((cell) => (cell !== undefined && cell !== null ? String(cell).trim() : ''));

          strRow.forEach((cell, colIndex) => {
            const parsedTime = parseTimeAndDays(cell);
            if (parsedTime) {
              const potentialCode = strRow.find((val) => /^[A-Z]{2,4}\d{3,4}/i.test(val)) || lastCourseCode || 'COURSE';
              if (/^[A-Z]{2,4}\d{3,4}/i.test(potentialCode)) {
                lastCourseCode = potentialCode;
              }

              const room = strRow[colIndex + 1] || strRow[colIndex - 1] || 'TBA';

              parsedTime.days.forEach((day, dIdx) => {
                slots.push({
                  id: `slot-${i}-${colIndex}-${dIdx}-${Date.now()}`,
                  courseCode: potentialCode,
                  courseTitle: potentialCode,
                  instructor: 'TBA',
                  room,
                  day,
                  startTime: parsedTime.startTime,
                  endTime: parsedTime.endTime,
                });
              });
            }
          });
        }

        if (slots.length === 0) {
          throw new Error('No valid class slots found. Try adding manually.');
        }

        onRoutineParsed(slots);
        setSuccessMsg(`Successfully parsed ${slots.length} class slots!`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not parse routine file.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="card bg-base-200 border border-base-300 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Upload Schedule (Excel/CSV)</h2>
        </div>
        {onOpenManualForm && (
          <button onClick={onOpenManualForm} className="btn btn-sm btn-outline gap-1 rounded-lg">
            <PlusCircle className="w-4 h-4" /> Add Manually
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="alert alert-error text-sm py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success text-sm py-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:border-primary transition-colors bg-base-100">
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-6 h-6 mb-1 text-primary opacity-80" />
          <p className="text-sm font-semibold">Upload Advising Slip or Routine Excel</p>
          <p className="text-xs opacity-60 mt-0.5">Supports EWU Advising Slip & standard XLSX/CSV</p>
        </div>
        <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
      </label>
    </div>
  );
};