"use client";

import { createContext, useContext, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edge, Node } from "@xyflow/react";

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
  // Schema operations
  saveSchema: (nodes: Node[], edges: Edge[]) => Promise<void>;
  isSavingSchema: boolean;
  loadSchema: () => Promise<{ nodes: Node[]; edges: Edge[] }>;
  isLoadingSchema: boolean;
};

const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.project_id as string;
  const queryClient = useQueryClient();
  
  // Add enum state
  const [enums, setEnums] = useState<Enum[]>([]);

  // Schema mutations
  const { mutateAsync: saveSchemaAsync, isPending: isSavingSchema } = useMutation({
    mutationFn: async ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      const response = await fetch(`/api/project/${projectId}/schema`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          enums,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save schema');
      }
      
      return response.json();
    },
    onMutate: async ({ nodes, edges }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['schema', projectId] });
      
      // Snapshot the previous value
      const previousSchema = queryClient.getQueryData(['schema', projectId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['schema', projectId], { nodes, edges });
      
      // Return a context object with the snapshot
      return { previousSchema };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSchema) {
        queryClient.setQueryData(['schema', projectId], context.previousSchema);
      }
    },
    onSuccess: () => {
      // Don't invalidate the query as it causes a refetch loop
      // queryClient.invalidateQueries({ queryKey: ['schema', projectId] });
    },
  });

  // Schema query
  const { 
    // data: schemaData,
    isLoading: isLoadingSchema,
    refetch: refetchSchema
  } = useQuery({
    queryKey: ['schema', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/project/${projectId}/schema`);
      
      if (!response.ok) {
        // If it's a 404, return empty schema
        if (response.status === 404) {
          return { nodes: [], edges: [] };
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load schema');
      }
      
      return response.json();
    },
    // Don't refetch on window focus to avoid disrupting user's work
    refetchOnWindowFocus: false,
  });

  // Wrapper function for saving schema
  const saveSchema = async (nodes: Node[], edges: Edge[]) => {
    await saveSchemaAsync({ nodes, edges });
  };

  // Wrapper function for loading schema
  const loadSchema = async () => {
    const result = await refetchSchema();
    if (result.error) {
      throw result.error;
    }
    return result.data || { nodes: [], edges: [] };
  };

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
        deleteEnumValue,
        // Add schema operations
        saveSchema,
        isSavingSchema,
        loadSchema,
        isLoadingSchema
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
