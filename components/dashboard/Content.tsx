"use client";

import { SkeletonCard } from "./SkeletonCard";
import { HoverEffect } from "../ui/card-hover-effect";
import { Project } from "@/types/projects/project";

const Content = ({
  isLoading,
  data,
}: {
  isLoading: boolean;
  data: Project[] | undefined;
}) => {
  if (isLoading) {
    return (
      <div className="flex p-4 mt-10">
        <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex p-4 mt-10">
      <div className="max-w-5xl mx-auto px-8">
        {(!data || data.length === 0) ? (
          <p className="mt-[200px] text-center text-md">No items found</p>
        ) : (
          <HoverEffect items={data} />
        )}
      </div>
    </div>
  );
};

export default Content;
