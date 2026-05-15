import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Clock, Moon, Upload, Plus, MoreHorizontal, Calendar, Undo2, CheckCircle2 } from "lucide-react";
import TaskCard from "./components/task/TaskCard";
import type { Priority } from "./components/task/TaskCard";
import AddTaskModal from "./components/modals/AddTaskModal";
import TimePicker from "./components/ui/TimePicker";
import LiveClock from "./components/ui/LiveClock";
import { cn } from "./lib/utils";

type TaskDef = {
  time: string;
  title: string;
  subtitle?: string;
  duration: string;
  priority: Priority;
  isDone?: boolean;
  isFixed?: boolean;
};

const defaultTasks: TaskDef[] = [
  { time: "10:30", title: "Wake up + bathing", duration: "30m", priority: "routine" },
  { time: "07:00", title: "Breakfast", duration: "30m", priority: "routine", isDone: true },
  { time: "07:30", title: "DSA — Codeforces practice", subtitle: "peak focus window", duration: "2h", priority: "urgent", isDone: true },
  { time: "09:30", title: "Short break", duration: "15m", priority: "routine", isDone: true },
  { time: "09:45", title: "Python basics — functions & OOP", subtitle: "tutorial × 1.8 = coding time", duration: "1h 45m", priority: "medium" },
  { time: "11:30", title: "Break", duration: "15m", priority: "routine" },
  { time: "11:45", title: "Drop sister to college", subtitle: "fixed commitment", duration: "45m", priority: "urgent", isFixed: true },
  { time: "12:30", title: "Lunch", duration: "45m", priority: "routine" },
  { time: "13:15", title: "Power nap (slept at 2am)", subtitle: "sleep debt recovery", duration: "25m", priority: "sleep" },
  { time: "13:40", title: "Digital electronics — sequential circuits", subtitle: "~4 concepts + derivations", duration: "1h 30m", priority: "medium" },
  { time: "15:10", title: "Short break", duration: "15m", priority: "routine" },
  { time: "15:25", title: "YouTube content planning", duration: "45m", priority: "low" },
];

function getDuration(start: string, end: string) {
  if (!start || !end) return "";
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);
  let diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diffMin < 0) diffMin += 24 * 60;
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function mapPriority(p: string, name: string): Priority {
  if (name.toLowerCase().includes("nap") || name.toLowerCase().includes("sleep")) return "sleep";
  if (p === "high") return "urgent";
  if (p === "medium") return "medium";
  if (p === "low") return "low";
  return "routine";
}

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExtendedState, setIsExtendedState] = useState(false);

  const [tasks, setTasks] = useState<TaskDef[]>(() => {
    try {
      const saved = localStorage.getItem("dayplan_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed; // Fix Bug 1: keep ticked state
      }
    } catch (e) { }
    return defaultTasks.map(t => ({ ...t, isDone: false }));
  });

  useEffect(() => {
    localStorage.setItem("dayplan_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const lastSavedDate = localStorage.getItem('dayplan_date');
    const today = new Date().toDateString();
    if (lastSavedDate !== today) {
      localStorage.removeItem('dayplan_sleptAt');
      localStorage.removeItem('dayplan_wakeTime');
      localStorage.setItem('dayplan_date', today);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [sleptAt, setSleptAt] = useState(() => localStorage.getItem('dayplan_sleptAt') || "02:00");
  const [wakeTime, setWakeTime] = useState(() => localStorage.getItem('dayplan_wakeTime') || "07:00");
  
  const [isWakeLocked, setIsWakeLocked] = useState(() => !!localStorage.getItem('dayplan_wakeTime'));
  const [isSleptLocked, setIsSleptLocked] = useState(() => !!localStorage.getItem('dayplan_sleptAt'));

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const b64 = localStorage.getItem("dayplan_last_pdf");
    const fname = localStorage.getItem("dayplan_last_pdf_name");
    if (b64 && fname) {
      fetch(b64).then(res => res.blob()).then(blob => {
        const file = new File([blob], fname, { type: 'application/pdf' });
        setUploadedFile(file);
        generateSchedule(file, true, wakeTime, sleptAt);
      });
    }
  }, []);

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const generateSchedule = async (file: File, isRegenerate = false, wTime = wakeTime, sAt = sleptAt) => {

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await axios.post(
        `http://127.0.0.1:8000/upload?wake_time=${wTime}&slept_at=${sAt}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newTasks: TaskDef[] = response.data.schedule.map((t: any) => ({
        time: t.start_time,
        title: t.name,
        subtitle: t.type,
        duration: getDuration(t.start_time, t.end_time),
        priority: mapPriority(t.priority, t.name),
        isFixed: t.is_fixed,
        isDone: false
      }));

      setTasks(prev => {
        if (isRegenerate || prev.length === 0) return newTasks;
        // Merge and sort by time
        return [...prev, ...newTasks].sort((a, b) => a.time.localeCompare(b.time));
      });
      setIsExtendedState(false);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("dayplan_last_pdf", reader.result as string);
      localStorage.setItem("dayplan_last_pdf_name", file.name);
    };
    reader.readAsDataURL(file);

    setUploadedFile(file);
    await generateSchedule(file, false, wakeTime, sleptAt);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRegenerate = async (wTime = wakeTime, sAt = sleptAt) => {
    if (!uploadedFile) return;
    await generateSchedule(uploadedFile, true, wTime, sAt);
  };

  const handleToggleWakeLock = async () => {
    if (isWakeLocked) {
      localStorage.removeItem('dayplan_wakeTime');
      setIsWakeLocked(false);
    } else {
      localStorage.setItem('dayplan_wakeTime', wakeTime);
      setIsWakeLocked(true);
      if (uploadedFile) await handleRegenerate(wakeTime, sleptAt);
    }
  };

  const handleToggleSleptLock = async () => {
    if (isSleptLocked) {
      localStorage.removeItem('dayplan_sleptAt');
      setIsSleptLocked(false);
    } else {
      localStorage.setItem('dayplan_sleptAt', sleptAt);
      setIsSleptLocked(true);
      if (uploadedFile) await handleRegenerate(wakeTime, sleptAt);
    }
  };

  const handleAddTask = (newTask: any) => {
    setTasks(prev => {
      // Find next available slot time
      let nextTime = "15:25"; // default fallback
      if (prev.length > 0) {
        const lastTask = prev[prev.length - 1];
        // naive time addition for next slot (assuming duration in 'h' or 'm')
        // We'll just append it with a generated time for now to satisfy requirements
        const [h, m] = lastTask.time.split(":").map(Number);
        let durationMins = 60; // assume 1h if parsing fails
        if (lastTask.duration.includes("h")) {
          durationMins = parseInt(lastTask.duration) * 60;
        } else if (lastTask.duration.includes("m")) {
          durationMins = parseInt(lastTask.duration);
        }
        let totalMins = h * 60 + m + durationMins;
        const nextH = Math.floor(totalMins / 60) % 24;
        const nextM = totalMins % 60;
        nextTime = `${nextH.toString().padStart(2, "0")}:${nextM.toString().padStart(2, "0")}`;
      }

      const taskWithTime = { ...newTask, time: nextTime };
      return [...prev, taskWithTime].sort((a, b) => a.time.localeCompare(b.time));
    });
    setIsAddModalOpen(false);
  };

  const handleExport = async () => {
    try {
      const schedulePayload = tasks.map(t => {
        const [h, m] = t.time.split(":").map(Number);
        let durMins = 60;
        if (t.duration.includes("h") && t.duration.includes("m")) {
          const parts = t.duration.split(" ");
          durMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else if (t.duration.includes("h")) {
          durMins = parseInt(t.duration) * 60;
        } else if (t.duration.includes("m")) {
          durMins = parseInt(t.duration);
        }
        const totalMins = h * 60 + m + durMins;
        const endH = Math.floor(totalMins / 60) % 24;
        const endM = totalMins % 60;
        const end_time = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;

        return {
          name: t.title,
          start_time: t.time,
          end_time: end_time,
          priority: t.priority,
          type: t.subtitle || "general",
          is_fixed: t.isFixed || false
        };
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/export",
        { schedule: schedulePayload },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dayplan.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Export failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex font-sans">

      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-[#222] flex flex-col p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <h1 className="text-xl font-bold tracking-tight">dayplan</h1>
        </div>

        {/* Today section */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-[#666] tracking-wider mb-2">TODAY</div>
          <div className="text-lg font-medium text-gray-200">{formattedDate}</div>
          <LiveClock />
        {/* Slept at */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-[#666] tracking-wider mb-2 uppercase">Slept at</div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <TimePicker value={sleptAt} onChange={setSleptAt} />
            </div>
            <button 
              onClick={handleToggleSleptLock}
              className={cn("mt-2 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isSleptLocked ? "bg-green-500/20 border border-green-500/30 text-green-500 hover:bg-green-500/30" : "bg-gray-500/10 border border-gray-500/20 text-gray-500 hover:bg-gray-500/20"
              )}
              title="Lock slept at time"
            >
              {isSleptLocked ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-500" />}
            </button>
          </div>
          {(() => {
            const h = parseInt(sleptAt.split(":")[0]);
            if (h >= 1 && h <= 5) {
              return (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold mt-2 inline-flex">
                  <Moon className="w-3.5 h-3.5" />
                  nap
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Wake Time */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-[#666] tracking-wider mb-2 uppercase">Wake Time</div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <TimePicker value={wakeTime} onChange={setWakeTime} />
            </div>
            <button 
              onClick={handleToggleWakeLock}
              className={cn("mt-2 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isWakeLocked ? "bg-green-500/20 border border-green-500/30 text-green-500 hover:bg-green-500/30" : "bg-gray-500/10 border border-gray-500/20 text-gray-500 hover:bg-gray-500/20"
              )}
              title="Lock wake time"
            >
              {isWakeLocked ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-500" />}
            </button>
          </div>
          {uploadedFile && (
            <button 
              onClick={() => handleRegenerate()}
              disabled={loading}
              className="w-full mt-3 py-2 bg-blue-600/20 text-blue-500 border border-blue-500/30 hover:bg-blue-600/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? "Generating..." : "Regenerate"}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-white mb-1">{tasks.length}</div>
            <div className="text-xs font-medium text-[#666]">tasks today</div>
          </div>
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-green-500 mb-1">{tasks.filter(t => t.isDone).length}</div>
            <div className="text-xs font-medium text-[#666]">done</div>
          </div>
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-red-500 mb-1">{tasks.filter(t => t.priority === "urgent").length}</div>
            <div className="text-xs font-medium text-[#666]">urgent</div>
          </div>
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-[#888] mb-1">0</div>
            <div className="text-xs font-medium text-[#666]">moved tmrw</div>
          </div>
        </div>

        {/* Priority Legend */}
        <div className="mb-auto">
          <div className="text-xs font-semibold text-[#666] tracking-wider mb-4 uppercase">Priority</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#aaa] font-medium"><div className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Urgent</div>
            <div className="flex items-center gap-3 text-sm text-[#aaa] font-medium"><div className="w-2.5 h-2.5 rounded-sm bg-orange-400" /> Medium</div>
            <div className="flex items-center gap-3 text-sm text-[#aaa] font-medium"><div className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Low priority</div>
            <div className="flex items-center gap-3 text-sm text-[#aaa] font-medium"><div className="w-2.5 h-2.5 rounded-sm bg-[#555]" /> Routine</div>
            <div className="flex items-center gap-3 text-sm text-[#aaa] font-medium"><div className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Nap / Sleep</div>
          </div>
        </div>

        {/* Export Action */}
        <div className="mt-8">
          {exportSuccess && (
            <div className="mb-3 text-center text-xs font-semibold text-green-500 bg-green-500/10 border border-green-500/20 py-2 rounded-lg">
              Exported! Open on iPhone to import
            </div>
          )}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-[#333] rounded-xl hover:bg-[#15151a] transition-colors font-medium text-sm"
          >
            <Calendar className="w-4 h-4 text-gray-400" />
            Export to iPhone
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* Top Header - Normal or Extended */}
          {!isExtendedState ? (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Today's schedule</h2>
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase rounded-full tracking-wide">
                  plan active
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="application/pdf"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#333] hover:bg-[#1a1a21] rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {loading ? "uploading..." : "upload schedule"}
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  add task
                </button>
                <button className="p-2.5 border border-[#333] rounded-xl hover:bg-[#1a1a21] transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-white">Drop sister to college — extended +45min</h2>
                  <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase rounded-full tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> schedule adjusted
                  </div>
                </div>
                <button
                  onClick={() => setIsExtendedState(false)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#333] hover:bg-[#1a1a21] rounded-xl text-sm font-medium transition-colors"
                >
                  <Undo2 className="w-4 h-4 text-gray-400" />
                  undo
                </button>
              </div>
              <div className="w-full bg-green-500/10 border border-green-500/20 rounded-xl p-3 px-4 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">Schedule adjusted — 4 tasks shifted forward, 1 moved to tomorrow</span>
              </div>
            </div>
          )}

          {/* Timeline Wrapper */}
          <div className="relative pl-4 space-y-2 pb-24 border-l border-[#1a1a21] ml-4">
            {tasks.map((task, i) => {
              // Apply extended state logic simply for demonstration matching screenshot 3
              const isDropTask = task.title.includes("Drop sister");
              const isShifted = isExtendedState && i > 6 && !task.isFixed;
              const isFixed = task.isFixed || (isExtendedState && task.isDone) || task.priority === "routine";
              const isOverdue = currentTime > task.time && !task.isDone && !isFixed; // only glow if it's not routine/fixed, or glow anyway? Let's glow all tasks that are late.
              const finalIsOverdue = currentTime > task.time && !task.isDone;

              return (
                <div key={`${task.title}-${task.time}-${i}`} className="relative -ml-[42px] pr-2">
                  <TaskCard
                    {...task}
                    isFixed={isFixed}
                    extended={isExtendedState && isDropTask ? "+45min" : undefined}
                    shifted={isShifted}
                    isOverdue={finalIsOverdue}
                    onToggleDone={(isDone) => {
                      setTasks(prev => {
                        const newTasks = [...prev];
                        newTasks[i] = { ...newTasks[i], isDone };
                        return newTasks;
                      });
                    }}
                    onDelete={() => {
                      setTasks(prev => prev.filter((_, idx) => idx !== i));
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom Extension Actions (Only in extended state demo) */}
          {isExtendedState && (
            <div className="fixed bottom-0 left-[280px] right-0 bg-[#0a0a0f]/90 backdrop-blur-md border-t border-[#222] p-4 px-8 flex items-center gap-4 z-10">
              <span className="text-[#666] text-sm font-medium mr-2">Extend by:</span>
              <button className="px-6 py-2.5 rounded-xl border border-[#333] hover:bg-[#1a1a21] font-medium text-sm transition-colors text-white">+15 min</button>
              <button className="px-6 py-2.5 rounded-xl border border-[#333] hover:bg-[#1a1a21] font-medium text-sm transition-colors text-white">+45 min</button>
              <button className="px-6 py-2.5 rounded-xl border border-[#333] hover:bg-[#1a1a21] font-medium text-sm transition-colors text-white">+1 hour</button>
              <button className="px-6 py-2.5 rounded-xl border border-[#333] hover:bg-[#1a1a21] font-medium text-sm transition-colors text-white">+1.5 hrs</button>
              <div className="flex-1" />
              <button className="px-6 py-2.5 rounded-xl border border-[#333] hover:bg-[#1a1a21] font-medium text-sm transition-colors text-white">reset</button>
            </div>
          )}
        </div>
      </main>

      <AddTaskModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddTask} />
    </div>
  );
}