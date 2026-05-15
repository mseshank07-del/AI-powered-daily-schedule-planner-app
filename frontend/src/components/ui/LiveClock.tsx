import { useState, useEffect } from "react";

export default function LiveClock() {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-gray-400 font-mono text-sm tracking-wide mt-1">
      {time}
    </div>
  );
}
