import { useState } from "react";
import { Clock, Moon, Upload, Plus, MoreHorizontal, Calendar, Undo2, CheckCircle2 } from "lucide-react";
import TaskCard from "./components/task/TaskCard";
import type { Priority } from "./components/task/TaskCard";
import AddTaskModal from "./components/modals/AddTaskModal";

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
  { time: "06:30", title: "Wake up + bathing", duration: "30m", priority: "routine" },
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

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExtendedState, setIsExtendedState] = useState(false);

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
          <div className="text-lg font-medium text-gray-200">Thursday, 14 May</div>
        </div>

        {/* Slept at */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-[#666] tracking-wider mb-2 uppercase">Slept at</div>
          <div className="flex items-center gap-3">
            <div className="bg-[#1a1a21] border border-[#333] rounded-xl px-4 py-3 flex items-center justify-between w-40">
              <span className="font-mono text-gray-200 font-medium tracking-wide">02:00 AM</span>
              <Clock className="w-4 h-4 text-[#888]" />
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold">
              <Moon className="w-3.5 h-3.5" />
              nap
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-white mb-1">7</div>
            <div className="text-xs font-medium text-[#666]">tasks today</div>
          </div>
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-green-500 mb-1">1</div>
            <div className="text-xs font-medium text-[#666]">done</div>
          </div>
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-red-500 mb-1">2</div>
            <div className="text-xs font-medium text-[#666]">urgent</div>
          </div>
          <div className="bg-[#111115] border border-[#222] rounded-xl p-4">
            <div className="text-3xl font-medium text-[#888] mb-1">1</div>
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
        <button className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 border border-[#333] rounded-xl hover:bg-[#15151a] transition-colors font-medium text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          Export to iPhone
        </button>
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
                <button 
                  onClick={() => setIsExtendedState(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#333] hover:bg-[#1a1a21] rounded-xl text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  upload schedule
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
            {defaultTasks.map((task, i) => {
              // Apply extended state logic simply for demonstration matching screenshot 3
              const isDropTask = task.title.includes("Drop sister");
              const isShifted = isExtendedState && i > 6 && !task.isFixed;
              const isFixed = task.isFixed || (isExtendedState && task.isDone) || task.priority === "routine";

              return (
                <div key={i} className="relative -ml-[42px] pr-2">
                  <TaskCard
                    {...task}
                    isFixed={isFixed}
                    extended={isExtendedState && isDropTask ? "+45min" : undefined}
                    shifted={isShifted}
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

      <AddTaskModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}