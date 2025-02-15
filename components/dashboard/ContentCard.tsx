"use client"

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const ContentCard = () => {
    const { resolvedTheme } = useTheme();
    return (
        <div className="flex flex-col">
            <img src="https://picsum.photos/250/125" alt="Description" className="h-[175px] w-[300px] rounded-t-lg" />
            <div className={"flex justify-between p-2 mb-4 items-center rounded-b-lg"}>
                <div className="space-y-1">
                    <p className="text-md font-medium">Project Name</p>
                    <p className="text-sm">Last Edited 3 days ago</p>
                </div>
            </div>
        </div>
    )
}

export default ContentCard;
