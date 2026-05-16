import { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, Trash2, CheckCircle2 } from "lucide-react";

type TimetableModalProps = {
  open: boolean;
  onClose: () => void;
  onTimetableSet: () => void;
};

export default function TimetableModal({ open, onClose, onTimetableSet }: TimetableModalProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const hasTimetable = !!localStorage.getItem("dayplan_timetable");

  if (!open) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/timetable", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.data.timetable) {
        localStorage.setItem("dayplan_timetable", JSON.stringify(res.data.timetable));
        onTimetableSet();
        onClose();
      }
    } catch (error) {
      console.error("Timetable upload failed", error);
      alert("Failed to parse timetable. Please try again.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    localStorage.removeItem("dayplan_timetable");
    onTimetableSet();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111115] border border-[#222] rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-lg hover:bg-white/10 text-gray-400">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-2">College Timetable</h3>
        <p className="text-sm text-gray-400 mb-6">
          Upload your weekly class schedule. We'll automatically lock your classes into your daily schedule.
        </p>

        {hasTimetable ? (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-green-500">Timetable Active</div>
              <div className="text-xs text-green-500/70">Your weekly classes are saved and will auto-inject.</div>
            </div>
          </div>
        ) : null}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleUpload}
          accept="application/pdf"
        />

        <div className="flex flex-col gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {loading ? "Parsing timetable..." : (hasTimetable ? "Replace Timetable" : "Upload Timetable (PDF)")}
          </button>

          {hasTimetable && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold tracking-wide transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Timetable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
