import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import React from "react";
import { Project } from "@/types/projects/project";

export const HoverEffect = ({
  items,
  className,
}: {
  items: Project[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Add safety check for items
  if (!Array.isArray(items)) {
    return null; // or return a loading state/error message
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items?.map((item, idx) => (
        <Link
          href={`/project/${item.id}`}
          aria-label={`View details for ${item.title}`}
          key={item.id}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <MemoizedCard content={item} />
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  content,
}: {
  className?: string;
  content: Project;
}) => {
  
  const formatDate = (date: string) => {
    const now = new Date();
    const pastDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full overflow-hidden group-hover:border-slate-700 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="flex flex-col p-2 rounded-lg">
          <Image
            src={content.imageUrl || ""}
            alt="Description"
            width={300}
            height={175}
            className={
              "rounded-lg h-[175px] w-[300px] object-cover bg-neutral-300/[0.8] dark:bg-slate-800/[0.8]"
            }
          />
          <div className={"flex justify-between p-2 items-center rounded-b-lg"}>
            <div className="space-y-1">
              <p className="text-md font-medium">{content.title}</p>
              <p className="text-sm">{formatDate(content.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MemoizedCard = React.memo(Card);
