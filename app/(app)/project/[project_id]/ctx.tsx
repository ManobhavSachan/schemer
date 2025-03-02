"use client";

import { createContext, useContext, useState } from "react";
import { useParams } from "next/navigation";

// Define the Enum types
export type EnumValue = {
  id: string;
  value: string;
};

export type Enum = {
  id: string;
  name: string;
  values: EnumValue[];
};

type ProjectContextType = {
  projectId: string;
  // Enum state and functions
  enums: Enum[];
  setEnums: React.Dispatch<React.SetStateAction<Enum[]>>;
  addEnum: (name: string) => void;
  updateEnum: (id: string, name: string) => void;
  deleteEnum: (id: string) => void;
  addEnumValue: (enumId: string, value: string) => void;
  updateEnumValue: (enumId: string, valueId: string, newValue: string) => void;
  deleteEnumValue: (enumId: string, valueId: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.project_id as string;
  
  // Add enum state
  const [enums, setEnums] = useState<Enum[]>([]);

  // Add a new enum
  const addEnum = (name: string) => {
    const newEnum: Enum = {
      id: `enum-${Date.now()}`,
      name,
      values: [
        { id: `enum-value-${Date.now()}-1`, value: "VALUE_1" },
        { id: `enum-value-${Date.now()}-2`, value: "VALUE_2" },
      ],
    };
    setEnums((prev) => [...prev, newEnum]);
  };

  // Update an enum name
  const updateEnum = (id: string, name: string) => {
    setEnums((prev) =>
      prev.map((enumItem) =>
        enumItem.id === id ? { ...enumItem, name } : enumItem
      )
    );
  };

  // Delete an enum
  const deleteEnum = (id: string) => {
    setEnums((prev) => prev.filter((enumItem) => enumItem.id !== id));
  };

  // Add a value to an enum
  const addEnumValue = (enumId: string, value: string) => {
    setEnums((prev) =>
      prev.map((enumItem) => {
        if (enumItem.id === enumId) {
          return {
            ...enumItem,
            values: [
              ...enumItem.values,
              { id: `enum-value-${Date.now()}`, value },
            ],
          };
        }
        return enumItem;
      })
    );
  };

  // Update an enum value
  const updateEnumValue = (enumId: string, valueId: string, newValue: string) => {
    setEnums((prev) =>
      prev.map((enumItem) => {
        if (enumItem.id === enumId) {
          return {
            ...enumItem,
            values: enumItem.values.map((value) =>
              value.id === valueId ? { ...value, value: newValue } : value
            ),
          };
        }
        return enumItem;
      })
    );
  };

  // Delete an enum value
  const deleteEnumValue = (enumId: string, valueId: string) => {
    setEnums((prev) =>
      prev.map((enumItem) => {
        if (enumItem.id === enumId) {
          return {
            ...enumItem,
            values: enumItem.values.filter((value) => value.id !== valueId),
          };
        }
        return enumItem;
      })
    );
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        projectId: projectId as string,
        enums,
        setEnums,
        addEnum,
        updateEnum,
        deleteEnum,
        addEnumValue,
        updateEnumValue,
        deleteEnumValue
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
