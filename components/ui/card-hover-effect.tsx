import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import React from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    id: string;
    description: string;
    image_url: string;
    name: string;
    created_at: string;
    updated_at: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={`/dashboard/${item.id}`}
          aria-label={`View details for ${item.name}`}
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
  content: {
    id: string;
    description: string;
    image_url: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
}) => {
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
            src={content.image_url}
            alt="Description"
            width={300}
            height={175}
            className={
              "rounded-lg h-[175px] w-[300px] object-cover bg-neutral-300/[0.8] dark:bg-slate-800/[0.8]"
            }
          />
          <div className={"flex justify-between p-2 items-center rounded-b-lg"}>
            <div className="space-y-1">
              <p className="text-md font-medium">{content.name}</p>
              <p className="text-sm">{content.created_at}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MemoizedCard = React.memo(Card);
