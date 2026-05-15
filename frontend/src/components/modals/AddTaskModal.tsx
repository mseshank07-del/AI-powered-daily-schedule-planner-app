import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (task: any) => void;
};

export default function AddTaskModal({ open, onClose, onAdd }: AddTaskModalProps) {
  const [priority, setPriority] = useState<"urgent" | "medium" | "low" | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111115] w-full max-w-[480px] rounded-2xl border border-[#222]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Add task mid-day</h2>
            <p className="text-[#888] text-sm">AI will reschedule remaining tasks around this</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#888]" />
          </button>
        </div>

        <div className="px-6 space-y-5">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold text-[#888] tracking-wider mb-2 uppercase">
              Task Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish OS assignment, Drop sister..."
              className="w-full bg-[#1a1a21] border border-transparent focus:border-[#444] rounded-xl px-4 py-3.5 text-white placeholder-[#555] outline-none transition-colors text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#888] tracking-wider mb-2 uppercase">
              Description / Notes (Optional)
            </label>
            <textarea
              placeholder="Any context — e.g. 3 chapters, watch tutorial first, 20km drive..."
              rows={3}
              className="w-full bg-[#1a1a21] border border-transparent focus:border-[#444] rounded-xl px-4 py-3.5 text-white placeholder-[#555] outline-none transition-colors resize-none text-sm"
            />
          </div>

          <div className="flex gap-4">
            {/* Estimated Time */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#888] tracking-wider mb-2 uppercase">
                Estimated Time
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2h, 45m"
                className="w-full bg-[#1a1a21] border border-transparent focus:border-[#444] rounded-xl px-4 py-3.5 text-white placeholder-[#555] outline-none transition-colors text-sm"
              />
            </div>

            {/* Deadline */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#888] tracking-wider mb-2 uppercase">
                Deadline
              </label>
              <div className="relative">
                <select className="w-full appearance-none bg-[#1a1a21] border border-transparent focus:border-[#444] rounded-xl px-4 py-3.5 text-white outline-none transition-colors text-sm font-medium">
                  <option>AI decides</option>
                  <option>Today</option>
                  <option>Tomorrow</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 1.5L6 6L10.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[#888] tracking-wider mb-2 uppercase">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPriority("urgent")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors font-medium text-sm",
                  priority === "urgent" ? "bg-[#1a1a21] border-[#555] text-white" : "border-[#222] text-[#888] hover:bg-[#1a1a21] hover:text-white"
                )}
              >
                <span className="w-2 h-2 rounded-sm bg-red-500" />
                Urgent
              </button>
              <button
                onClick={() => setPriority("medium")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors font-medium text-sm",
                  priority === "medium" ? "bg-[#1a1a21] border-[#555] text-white" : "border-[#222] text-[#888] hover:bg-[#1a1a21] hover:text-white"
                )}
              >
                <span className="w-2 h-2 rounded-sm bg-orange-400" />
                Medium
              </button>
              <button
                onClick={() => setPriority("low")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors font-medium text-sm",
                  priority === "low" ? "bg-[#1a1a21] border-[#555] text-white" : "border-[#222] text-[#888] hover:bg-[#1a1a21] hover:text-white"
                )}
              >
                <span className="w-2 h-2 rounded-sm bg-green-500" />
                Low
              </button>
            </div>
          </div>

          {/* Reschedule Preview */}
          <div className="mt-6 border border-[#222] rounded-xl bg-[#15151a] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#888] tracking-wider uppercase mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
              Reschedule Preview
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#888] font-mono">15:25</span>
                <span className="flex-1 ml-4 text-green-400 font-medium">— your new task here —</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-green-500/10 text-green-500 border border-green-500/30">new</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#555] font-mono line-through">16:10</span>
                <span className="flex-1 mx-4 text-[#aaa] truncate">YouTube content planning</span>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-mono">17:10</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-orange-500/10 text-orange-500 border border-orange-500/30">shifted</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#555] font-mono line-through">17:10</span>
                <span className="flex-1 mx-4 text-[#aaa] truncate">Break + snack</span>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-mono">18:10</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-orange-500/10 text-orange-500 border border-orange-500/30">shifted</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#555] font-mono">—</span>
                <span className="flex-1 mx-4 text-[#aaa] truncate">Review + plan tomorrow</span>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-400 font-mono">tmrw</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">moved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 pt-5 mt-2 border-t border-[#222] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-[#222] text-white font-medium hover:bg-[#222] transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAdd({
                title: title || "New Task",
                duration: duration || "1h",
                priority: priority || "medium",
                isDone: false,
                isFixed: false
              });
              setTitle("");
              setDuration("");
              setPriority(null);
            }}
            className="flex-[1.5] py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            Confirm & reschedule
          </button>
        </div>

      </div>
    </div>
  );
}