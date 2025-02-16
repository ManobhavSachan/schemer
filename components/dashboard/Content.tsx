"use client";

import { SkeletonCard } from "./SkeletonCard";
import { HoverEffect } from "../ui/card-hover-effect";

interface ContentData {
  id: string;
  image_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Content = ({
  isLoading,
  data,
}: {
  isLoading: boolean;
  data: ContentData[];
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
        {data.length === 0 ? (
          <p className="text-center text-md">No items found</p>
        ) : (
          <HoverEffect items={data} />
        )}
      </div>
    </div>
  );
};

export default Content;
