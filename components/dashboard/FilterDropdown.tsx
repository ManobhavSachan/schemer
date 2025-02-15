import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type SortType = "date" | "name";
export type SortOrder = "asc" | "desc";

interface FilterDropdownProps {
  selectedSorts: { date: SortOrder; name: SortOrder };
  onSort: (sortType: SortType, sortOrder: SortOrder) => void;
}

export function FilterDropdown({ selectedSorts, onSort }: FilterDropdownProps) {
  const handleSortChange = (sortType: SortType, sortOrder: SortOrder) => {
    onSort(sortType, sortOrder);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Filter</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Date</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={selectedSorts.date === "asc"}
          onCheckedChange={(checked) =>
            handleSortChange("date", checked ? "asc" : "desc")
          }
        >
          Ascending
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedSorts.date === "desc"}
          onCheckedChange={(checked) =>
            handleSortChange("date", checked ? "desc" : "asc")
          }
        >
          Descending
        </DropdownMenuCheckboxItem>
        <DropdownMenuLabel>Name</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={selectedSorts.name === "asc"}
          onCheckedChange={(checked) =>
            handleSortChange("name", checked ? "asc" : "desc")
          }
        >
          Ascending
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedSorts.name === "desc"}
          onCheckedChange={(checked) =>
            handleSortChange("name", checked ? "desc" : "asc")
          }
        >
          Descending
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
