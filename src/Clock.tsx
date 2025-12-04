import { useState, useEffect } from "react";

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time: 18:05:32 (24-hour with seconds)
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format date: Tue, 2 December 2025
  const date = now.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative text-end m-px py-3 px-6 rounded-3xl bg-black backdrop-blur-sm w-[400px]">
      <h1 className="text-xl font-semibold text-white">{time} (UTC+7)</h1>
      <h2 className="text-[16px] font-semibold text-[#CFE0EA]">{date}</h2>
    </div>
  );
}
