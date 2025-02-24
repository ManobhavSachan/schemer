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

// ReactFlow is scaling everything by the factor of 2
const TABLE_NODE_WIDTH = 320;
const TABLE_NODE_ROW_HEIGHT = 40;

const NODE_SEP = 25;
const RANK_SEP = 50;

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
    align: "UR",
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
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

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
    };

    return node;
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
  const reactFlowInstance = useReactFlow();

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

  useEffect(() => {
    reactFlowInstance.setNodes(nodes);
    reactFlowInstance.setEdges(edges);
    setTimeout(() => reactFlowInstance.fitView({})); // it needs to happen during next event tick
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
          variant="ghost"
          onClick={() =>
            toast({
              title: "Coming soon",
              description: "This feature is not available yet",
            })
          }
          title="Center View"
        >
          <Save className="h-4 w-4" />
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
    </ReactFlow>
  );
}
