import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "../../lib/utils";

export type Priority = "urgent" | "medium" | "low" | "routine" | "sleep";

export type TaskCardProps = {
  title: string;
  subtitle?: string;
  time: string;
  duration: string;
  priority: Priority;
  isDone?: boolean;
  isFixed?: boolean;
  extended?: string;
  shifted?: boolean;
};

const priorityColors = {
  urgent: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-green-500",
  routine: "bg-gray-600",
  sleep: "bg-purple-600",
};

export default function TaskCard({
  title,
  subtitle,
  time,
  duration,
  priority,
  isDone = false,
  isFixed = false,
  extended,
  shifted = false,
}: TaskCardProps) {
  const [checked, setChecked] = useState(isDone);

  return (
    <div className="flex items-start gap-4 w-full">
      {/* Time column */}
      <div className="w-14 shrink-0 text-gray-500 text-sm pt-4 font-mono font-medium text-right">
        {time}
      </div>

      {/* Card */}
      <div
        className={cn(
          "flex-1 relative bg-[#131317] rounded-xl p-4 transition-all group",
          shifted && "ring-1 ring-orange-500/50",
          extended && "ring-1 ring-orange-500"
        )}
      >
        {/* Priority color strip */}
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-1 rounded-r-md",
            priorityColors[priority]
          )}
        />

        <div className="flex items-start gap-4 ml-2">
          {/* Checkbox */}
          <button
            onClick={() => setChecked(!checked)}
            className={cn(
              "shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors border",
              checked
                ? "bg-green-500 border-green-500 text-black"
                : "border-gray-600 bg-transparent hover:border-gray-400"
            )}
          >
            {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
          </button>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center min-h-[24px]">
            <div className="flex items-center justify-between">
              <h3
                className={cn(
                  "font-semibold text-gray-200",
                  checked && "line-through text-gray-500"
                )}
              >
                {title}
              </h3>
              
              {/* Duration / Badges */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 font-mono">{duration}</span>
                
                {isFixed && !extended && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1a1a24] text-gray-400 text-xs font-medium">
                    <Lock className="w-3 h-3" />
                    fixed
                  </div>
                )}
                
                {extended && (
                  <div className="px-2 py-0.5 rounded border border-orange-500/30 text-orange-400 text-xs font-medium bg-orange-500/10">
                    {extended}
                  </div>
                )}
              </div>
            </div>

            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
            
            {/* Extended state subtitle overwrite */}
            {extended && isFixed && (
              <p className="text-orange-400/80 text-sm mt-1 flex items-center gap-2">
                fixed commitment — extended {extended}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}