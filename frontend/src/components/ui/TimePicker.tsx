import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

type TimePickerProps = {
  value: string; // "HH:MM" 24hr format
  onChange: (value: string) => void;
};

const Column = ({ items, selected, onChangeItem, infinite = false }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const displayItems = infinite ? [...items, ...items, ...items] : items;
  const lastSelected = useRef(selected);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let idx = -1;
    if (infinite) {
      idx = items.length + items.indexOf(selected);
    } else {
      idx = items.indexOf(selected);
    }
    
    if (idx !== -1 && itemRefs.current[idx]) {
      itemRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selected, items, infinite]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollTop / 40);

    if (infinite) {
      if (idx <= items.length / 2) {
        el.style.scrollBehavior = 'auto';
        el.scrollTop = (idx + items.length) * 40;
        requestAnimationFrame(() => el.style.scrollBehavior = 'smooth');
        return;
      }
      if (idx >= items.length * 2.5) {
        el.style.scrollBehavior = 'auto';
        el.scrollTop = (idx - items.length) * 40;
        requestAnimationFrame(() => el.style.scrollBehavior = 'smooth');
        return;
      }
    }

    if (displayItems[idx] !== undefined && displayItems[idx] !== selected) {
      if (lastSelected.current !== displayItems[idx]) {
        lastSelected.current = displayItems[idx];
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        onChangeItem(displayItems[idx]);
      }
    }
  };

  return (
    <div 
      ref={ref}
      onScroll={handleScroll}
      className="h-[120px] overflow-y-auto snap-y snap-mandatory relative flex-1 mx-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
    >
      <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />
      <div className="h-[40px]" />
      {displayItems.map((item: any, i: number) => (
        <div 
          key={`${item}-${i}`}
          ref={(el) => (itemRefs.current[i] = el)}
          className={cn(
            "h-[40px] flex items-center justify-center snap-center text-sm font-medium transition-colors select-none",
            selected === item ? "text-white text-base" : "text-[#555]"
          )}
        >
          {typeof item === 'number' && item < 10 && items.length > 2 ? `0${item}` : item}
        </div>
      ))}
      <div className="h-[40px]" />
    </div>
  );
};

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const [hStr, mStr] = value.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const isPM = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;

  const [hour, setHour] = useState(h12);
  const [minute, setMinute] = useState(m);
  const [ampm, setAmpm] = useState(isPM ? "PM" : "AM");

  useEffect(() => {
    let newH24 = hour;
    if (ampm === "PM" && hour < 12) newH24 += 12;
    if (ampm === "AM" && hour === 12) newH24 = 0;
    
    const newVal = `${newH24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    if (newVal !== value) {
      onChange(newVal);
    }
  }, [hour, minute, ampm]);

  const hours = Array.from({length: 12}, (_, i) => i + 1);
  const minutes = Array.from({length: 60}, (_, i) => i);
  const ampms = ["AM", "PM"];

  return (
    <div className="flex items-center justify-center bg-[#111115] border border-[#333] rounded-xl px-2 py-1 w-full mt-2 relative before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:w-[90%] before:h-[40px] before:bg-white/5 before:rounded-md before:pointer-events-none">
      <Column items={hours} selected={hour} onChangeItem={setHour} />
      <span className="text-[#555] font-bold pb-1 z-10">:</span>
      <Column items={minutes} selected={minute} onChangeItem={setMinute} infinite={true} />
      <Column items={ampms} selected={ampm} onChangeItem={setAmpm} />
    </div>
  );
}
