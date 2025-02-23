'use client';

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export function LoadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Exponential progress that accelerates towards 100
        const remaining = 100 - oldProgress;
        const increment = Math.max(0.5, remaining * 0.1);
        return Math.min(oldProgress + increment, 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <Progress value={progress} className="w-[60%]" />
    </div>
  );
}