"use client";

import Image from "next/image";

const ContentCard = () => {
  return (
    <div className="flex flex-col">
      <Image
        src="https://picsum.photos/250/125"
        alt="Description"
        width={300}
        height={175}
        className="rounded-t-lg"
      />
      <div
        className={"flex justify-between p-2 mb-4 items-center rounded-b-lg"}
      >
        <div className="space-y-1">
          <p className="text-md font-medium">Project Name</p>
          <p className="text-sm">Last Edited 3 days ago</p>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
