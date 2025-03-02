import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Position,
  MarkerType,
} from "@xyflow/react";
import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { useTheme } from "next-themes";
import { toPng } from "html-to-image";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import { ArrowDownToLine, LayoutGrid, Maximize2, Save } from "lucide-react";
import DatabaseSchemaEdge from "./Edge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/app/(app)/project/[project_id]/ctx";
import { Loader2 } from "lucide-react";

// ReactFlow is scaling everything by the factor of 2
const TABLE_NODE_WIDTH = 320;
const TABLE_NODE_ROW_HEIGHT = 40;

// const NODE_SEP = 25;
// const RANK_SEP = 50;

const defaultNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    type: "databaseSchema",
    data: {
      label: "Products",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "description", type: "varchar" },
        { title: "warehouse_id", type: "uuid" },
        { title: "supplier_id", type: "uuid" },
        { title: "price", type: "money" },
        { title: "quantity", type: "int4" },
      ],
    },
  },
  {
    id: "2",
    position: { x: 350, y: -100 },
    type: "databaseSchema",
    data: {
      label: "Warehouses",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "address", type: "varchar" },
        { title: "capacity", type: "int4" },
      ],
    },
  },
  {
    id: "3",
    position: { x: 350, y: 200 },
    type: "databaseSchema",
    data: {
      label: "Suppliers",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "description", type: "varchar" },
        { title: "country", type: "varchar" },
      ],
    },
  },
];

const defaultEdges: Edge[] = [
  {
    id: "products-warehouses",
    type: "databaseSchema",
    label: "Warehouse",
    source: "1",
    target: "2",
    sourceHandle: "warehouse_id",
    targetHandle: "id",
  },
  {
    id: "products-suppliers",
    type: "databaseSchema",
    source: "1",
    target: "3",
    sourceHandle: "supplier_id",
    targetHandle: "id",
    label: "Supplier",
  },
];

type SchemaData = {
  schema: { title: string; type: string }[];
  label: string;
};

const getLayoutedElementsViaDagre = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "LR",
    align: "UL",
    nodesep: 100,
    ranksep: 200,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: TABLE_NODE_WIDTH / 2,
      height:
        (TABLE_NODE_ROW_HEIGHT / 2) *
        ((node.data as SchemaData).schema.length + 1),
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let maxX = Number.MIN_VALUE;
  let maxY = Number.MIN_VALUE;

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    
    const x = nodeWithPosition.x - nodeWithPosition.width / 2;
    const y = nodeWithPosition.y - nodeWithPosition.height / 2;
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + nodeWithPosition.width);
    maxY = Math.max(maxY, y + nodeWithPosition.height);
    
    node.position = { x, y };
  });

  return { nodes, edges };
};

const nodeTypes = {
  databaseSchema: DatabaseSchemaNode,
};

const edgeTypes = {
  databaseSchema: DatabaseSchemaEdge,
};

export default function App() {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [nodes, , onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [, setIsDownloading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const reactFlowInstance = useReactFlow();
  const { 
    // projectId, 
    // enums, 
    saveSchema, 
    isSavingSchema, 
    loadSchema, 
    isLoadingSchema 
  } = useProject();

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      // Check if target node already has an incoming connection
      for (const edge of edges) {
        if (
          edge.target === connection.target &&
          edge.targetHandle === connection.targetHandle
        ) {
          return false;
        }
      }
      return true;
    },
    [edges]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  // Load schema from the server using React Query
  const fetchAndSetSchema = useCallback(async () => {
    try {
      const data = await loadSchema();
      
      if (data.nodes && data.nodes.length > 0) {
        // Apply layout to the loaded nodes
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElementsViaDagre(
          data.nodes as Node[],
          data.edges || []
        );
        
        // Set nodes and edges in React Flow instance
        reactFlowInstance.setNodes(layoutedNodes);
        reactFlowInstance.setEdges(layoutedEdges);
        
        // Fit view after a short delay to ensure nodes are rendered
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2 });
        }, 200);
        
        // Show success toast
        toast({
          title: "Schema loaded",
          description: `Loaded ${data.nodes.length} tables and ${data.edges?.length || 0} relationships`,
        });
      } else {
        // If no schema is found, use the default nodes
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElementsViaDagre(
          defaultNodes,
          defaultEdges
        );
        
        // Set nodes and edges in React Flow instance
        reactFlowInstance.setNodes(layoutedNodes);
        reactFlowInstance.setEdges(layoutedEdges);
        
        // Fit view after a short delay to ensure nodes are rendered
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2 });
        }, 200);
        
        // Show info toast for new schema
        toast({
          title: "New schema created",
          description: "Starting with a sample schema. You can modify it and save when ready.",
        });
      }
    } catch (error) {
      console.error('Error loading schema:', error);
      // Use default nodes if there's an error
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElementsViaDagre(
        defaultNodes,
        defaultEdges
      );
      
      // Set nodes and edges in React Flow instance
      reactFlowInstance.setNodes(layoutedNodes);
      reactFlowInstance.setEdges(layoutedEdges);
      
      // Fit view after a short delay to ensure nodes are rendered
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 200);
      
      // Only show error toast if it's not a 404 (no schema found yet)
      if (!(error instanceof Error && error.message.includes('not found'))) {
        toast({
          title: "Error loading schema",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  }, [loadSchema, reactFlowInstance, toast]);

  useEffect(() => {
    fetchAndSetSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetLayout = () => {
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();

    getLayoutedElementsViaDagre(nodes, edges);
    reactFlowInstance.setNodes(nodes);
    reactFlowInstance.setEdges(edges);
    setTimeout(() => reactFlowInstance.fitView({}));
    saveNodePositions();
  };

  const saveNodePositions = () => {
    //   const nodes = reactFlowInstance.getNodes();
    //   if (nodes.length > 0) {
    //     const nodesPositionData = nodes.reduce((a, b) => {
    //       return { ...a, [b.id]: b.position };
    //     }, {});
    //     // setStoredPositions(nodesPositionData)
    //   }
  };

  const downloadImage = () => {
    const reactflowViewport = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement;
    if (!reactflowViewport) return;

    setIsDownloading(true);

    // Temporarily disable animations on edges
    const edgeElements = reactflowViewport.querySelectorAll('.react-flow__edge');
    edgeElements.forEach(edge => {
      edge.classList.add('!animate-none');
      // Force edge paths to be visible
      const paths = edge.querySelectorAll('path');
      paths.forEach(path => {
        path.style.strokeOpacity = '1';
        path.style.stroke = 'currentColor';
      });
      // Force markers to be visible
      const markers = edge.querySelectorAll('marker');
      markers.forEach(marker => {
        marker.style.opacity = '1';
        marker.style.fill = 'currentColor';
      });
    });

    const width = reactflowViewport.clientWidth;
    const height = reactflowViewport.clientHeight;
    const { x, y, zoom } = reactFlowInstance.getViewport();

    // Get all edges and set them to the current state
    const currentEdges = reactFlowInstance.getEdges();
    currentEdges.forEach(edge => {
      const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
      if (edgeElement) {
        edgeElement.classList.add('!animate-none');
        // Force edge paths to be visible
        const paths = edgeElement.querySelectorAll('path');
        paths.forEach(path => {
          path.style.strokeOpacity = '1';
          path.style.strokeWidth = '1';
          path.style.stroke = 'currentColor';
        });
      }
    });

    toPng(reactflowViewport, {
      backgroundColor: "white",
      width,
      height,
      style: {
        width: width.toString(),
        height: height.toString(),
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
      },
      filter: (node) => {
        // Include edges in the export
        return node.classList?.contains('react-flow__edge') || !node.classList?.contains('react-flow__edge');
      },
    })
      .then((data) => {
        const a = document.createElement("a");
        a.setAttribute("download", `schemer.png`);
        a.setAttribute("href", data);
        a.click();
      })
      .finally(() => {
        // Re-enable animations and restore styles
        edgeElements.forEach(edge => {
          edge.classList.remove('!animate-none');
          const paths = edge.querySelectorAll('path');
          paths.forEach(path => {
            path.style.removeProperty('stroke-opacity');
            path.style.removeProperty('stroke');
          });
          const markers = edge.querySelectorAll('marker');
          markers.forEach(marker => {
            marker.style.removeProperty('opacity');
            marker.style.removeProperty('fill');
          });
        });
        // Re-enable animations and restore styles for specific edges
        currentEdges.forEach(edge => {
          const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
          if (edgeElement) {
            edgeElement.classList.remove('!animate-none');
            const paths = edgeElement.querySelectorAll('path');
            paths.forEach(path => {
              path.style.removeProperty('stroke-opacity');
              path.style.removeProperty('stroke');
            });
            const markers = edgeElement.querySelectorAll('marker');
            markers.forEach(marker => {
              marker.style.removeProperty('opacity');
              marker.style.removeProperty('fill');
            });
          }
        });
        setIsDownloading(false);
      });
  };

  // Save schema using React Query
  const handleSaveSchema = async () => {
    try {
      const currentNodes = reactFlowInstance.getNodes();
      const currentEdges = reactFlowInstance.getEdges();
      
      await saveSchema(currentNodes, currentEdges);
      setLastSaved(new Date());
      
      toast({
        title: "Schema saved",
        description: "Your database schema has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving schema:', error);
      toast({
        title: "Error saving schema",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    // Don't auto-save if we're still loading the initial schema
    if (isLoadingSchema) return;
    
    // Create a debounced save function
    const debouncedSave = setTimeout(async () => {
      try {
        const currentNodes = reactFlowInstance.getNodes();
        const currentEdges = reactFlowInstance.getEdges();
        
        // Only save if there are nodes to save
        if (currentNodes.length > 0) {
          await saveSchema(currentNodes, currentEdges);
          setLastSaved(new Date());
          
          // Show a subtle toast
          toast({
            title: "Auto-saved",
            description: `Schema auto-saved at ${new Date().toLocaleTimeString()}`,
            duration: 2000, // shorter duration for auto-save notifications
          });
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        // Don't show error toasts for auto-save to avoid disrupting the user
      }
    }, 5000); // 5 second debounce
    
    // Cleanup the timeout
    return () => clearTimeout(debouncedSave);
  }, [nodes, edges, autoSaveEnabled, isLoadingSchema, reactFlowInstance, saveSchema, toast]);

  return (
    <ReactFlow
      defaultNodes={[]}
      defaultEdges={[]}
      isValidConnection={isValidConnection}
      defaultEdgeOptions={{
        type: "databaseSchema",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        label: "Relationship",
        animated: true,
        deletable: true,
        style: {
          strokeWidth: 1,
        },
      }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      proOptions={{ hideAttribution: true }}
      fitView
      onNodeDragStop={() => saveNodePositions()}
    >
      <Background
        gap={16}
        className="[&>*]:stroke-foreground-muted"
        bgColor={"hsl(var(--sidebar-background))"}
        variant={BackgroundVariant.Dots}
      />
      <MiniMap
        pannable
        zoomable
        className="border rounded-lg overflow-hidden"
      />
      <Controls
        showZoom={false}
        showFitView={false}
        showInteractive={false}
        position="top-right"
        orientation="horizontal"
        aria-label="Controls"
        className="flex gap-1.5 bg-background backdrop-blur-sm border rounded-md p-1"
      >
          <Button
          className="h-5 px-2"
          variant={autoSaveEnabled ? "default" : "ghost"}
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          title={autoSaveEnabled ? "Disable Auto-Save" : "Enable Auto-Save"}
        >
          <span className="text-xs">Auto Save</span>
        </Button>
        <Button
          className="h-5 px-2"
          variant="ghost"
          onClick={handleSaveSchema}
          disabled={isSavingSchema}
          title={`Save Schema${lastSaved ? ` (Last saved: ${lastSaved.toLocaleTimeString()})` : ''}`}
        >
          {isSavingSchema ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
        
      

        <Button
          className="h-5 px-2"
          variant="ghost"
          onClick={() => reactFlowInstance.fitView({})}
          title="Center View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          className="h-5 px-2"
          variant="ghost"
          onClick={resetLayout}
          title="Reset Layout"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          className="h-5 px-2"
          variant="ghost"
          onClick={downloadImage}
          title="Download as PNG"
        >
          <ArrowDownToLine className="h-4 w-4" />
        </Button>
      </Controls>
      
      {isLoadingSchema && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading schema...</p>
          </div>
        </div>
      )}
    </ReactFlow>
  );
}
