'use client';

import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type OnNodesDelete,
  type OnEdgesDelete,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import StepNode, { type StepNodeData } from './StepNode';
import NodeConfigPanel from './NodeConfigPanel';
import { type PlaybookData } from '@/lib/forms/PlaybookForm/index';

const NODE_TYPES = { step: StepNode };

const AUTO_LAYOUT_X = 250;
const AUTO_LAYOUT_Y_STEP = 150;
const AUTO_LAYOUT_START_Y = 50;

const ACTION_OPTIONS = [
  { label: 'Start Instances', value: 'start-instances' },
  { label: 'Stop Instances', value: 'stop-instances' },
  { label: 'Restore Instances', value: 'restore-instances' },
];

type StepEntry = PlaybookData['steps'][number];

type ContextMenu = {
  x: number;
  y: number;
  type: 'pane' | 'node';
  nodeId?: string;
  flowPosition?: { x: number; y: number };
};

function applyStartFlags(nodes: Node<StepNodeData>[], edges: Edge[]): Node<StepNodeData>[] {
  const targetIds = new Set(edges.map((e) => e.target));
  return nodes.map((n) => ({ ...n, data: { ...n.data, isStart: !targetIds.has(n.id) } }));
}

function stepsToNodesAndEdges(steps: StepEntry[]): { nodes: Node<StepNodeData>[]; edges: Edge[] } {
  const edges: Edge[] = steps.flatMap((step, index) => {
    const targetId = step.nextStepId ?? (steps[index + 1] ? String(index + 1) : null);
    if (!targetId) return [];
    return [{ id: `e-${index}-${targetId}`, source: String(index), target: targetId }];
  });
  const targetIds = new Set(edges.map((e) => e.target));
  const nodes: Node<StepNodeData>[] = steps.map((step, index) => ({
    id: String(index),
    type: 'step',
    position: {
      x: step.positionX ?? AUTO_LAYOUT_X,
      y: step.positionY ?? AUTO_LAYOUT_START_Y + index * AUTO_LAYOUT_Y_STEP,
    },
    data: { type: step.type, targets: step.targets, isStart: !targetIds.has(String(index)) },
  }));
  return { nodes, edges };
}

type PlaybookCanvasEditorProps = {
  steps: PlaybookData['steps'];
  onChange: (steps: PlaybookData['steps']) => void;
};

function Editor({ steps, onChange }: PlaybookCanvasEditorProps) {
  const { nodes: initialNodes, edges: initialEdges } = stepsToNodesAndEdges(steps);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StepNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const [pendingPosition, setPendingPosition] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(steps.length);
  const { screenToFlowPosition } = useReactFlow();

  // Keep isStart flags in sync with edges
  useEffect(() => {
    setNodes((nds) => applyStartFlags(nds, edges));
  }, [edges, setNodes]);

  // Sync nodes+edges state back to PlaybookData steps
  const syncToForm = useCallback(
    (updatedNodes: Node<StepNodeData>[], updatedEdges: Edge[]) => {
      const edgeMap = new Map(updatedEdges.map((e) => [e.source, e.target]));
      const newSteps: PlaybookData['steps'] = updatedNodes.map((node, index) => ({
        type: node.data.type,
        targets: node.data.targets,
        order: index,
        positionX: node.position.x,
        positionY: node.position.y,
        nextStepId: edgeMap.get(node.id) ?? null,
      }));
      onChange(newSteps);
    },
    [onChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const updated = addEdge(connection, eds);
        syncToForm(nodes, updated);
        return updated;
      });
    },
    [nodes, setEdges, syncToForm]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node<StepNodeData>) => {
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        );
        syncToForm(updated, edges);
        return updated;
      });
    },
    [edges, setNodes, syncToForm]
  );

  const onNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      setNodes((nds) => {
        const remaining = nds.filter((n) => !deleted.find((d) => d.id === n.id));
        const remainingEdges = edges.filter(
          (e) => !deleted.find((d) => d.id === e.source || d.id === e.target)
        );
        syncToForm(remaining, remainingEdges);
        return remaining;
      });
    },
    [edges, setNodes, syncToForm]
  );

  const onEdgesDelete: OnEdgesDelete = useCallback(
    (deleted) => {
      setEdges((eds) => {
        const remaining = eds.filter((e) => !deleted.find((d) => d.id === e.id));
        syncToForm(nodes, remaining);
        return remaining;
      });
    },
    [nodes, setEdges, syncToForm]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_evt, node) => {
    setSelectedNodeId(node.id);
    setContextMenu(null);
  }, []);

  const onContainerDoubleClick = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
    const target = evt.target as HTMLElement;
    if (target.closest('.react-flow__node') || target.closest('[data-picker]') || target.closest('[data-context-menu]')) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPickerPosition({ x: evt.clientX - rect.left, y: evt.clientY - rect.top });
    setPendingPosition(screenToFlowPosition({ x: evt.clientX, y: evt.clientY }));
    setShowTypePicker(true);
    setContextMenu(null);
  }, [screenToFlowPosition]);

  const onContainerContextMenu = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const target = evt.target as HTMLElement;
    if (target.closest('.react-flow__node') || target.closest('[data-picker]') || target.closest('[data-context-menu]')) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
      type: 'pane',
      flowPosition: screenToFlowPosition({ x: evt.clientX, y: evt.clientY }),
    });
    setShowTypePicker(false);
  }, [screenToFlowPosition]);

  const onNodeContextMenu: NodeMouseHandler = useCallback((evt, node) => {
    evt.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
      type: 'node',
      nodeId: node.id,
    });
    setShowTypePicker(false);
  }, []);

  const addNode = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      const id = String(nextIdRef.current++);
      const pos = position ?? pendingPosition;
      const newNode: Node<StepNodeData> = {
        id,
        type: 'step',
        position: pos,
        data: { type, targets: [], isStart: false },
      };
      setNodes((nds) => {
        const updated = [...nds, newNode];
        syncToForm(updated, edges);
        return updated;
      });
      setShowTypePicker(false);
      setContextMenu(null);
    },
    [edges, pendingPosition, setNodes, syncToForm]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const remaining = nds.filter((n) => n.id !== nodeId);
        const remainingEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        setEdges(remainingEdges);
        syncToForm(remaining, remainingEdges);
        return remaining;
      });
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
      setContextMenu(null);
    },
    [edges, selectedNodeId, setEdges, setNodes, syncToForm]
  );

  const openAddNodeAtCenter = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPickerPosition({ x: rect.width / 2, y: rect.height / 2 });
    setPendingPosition(screenToFlowPosition({ x: cx, y: cy }));
    setShowTypePicker(true);
    setContextMenu(null);
  }, [screenToFlowPosition]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<StepNodeData>) => {
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        );
        syncToForm(updated, edges);
        return updated;
      });
    },
    [edges, setNodes, syncToForm]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden border border-gray-700"
      onDoubleClick={onContainerDoubleClick}
      onContextMenu={onContainerContextMenu}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span>Double-click canvas to add a step</span>
          <span className="text-gray-600">·</span>
          <span>Select + <kbd className="px-1 py-0.5 bg-gray-700 text-gray-300 rounded text-[10px] font-mono">Delete</kbd> to remove</span>
          <span className="text-gray-600">·</span>
          <span>Drag handles to connect steps</span>
          <span className="text-gray-600">·</span>
          <span>Right-click for options</span>
        </div>
        <button
          onClick={openAddNodeAtCenter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition shrink-0 ml-4"
        >
          <FaPlus className="w-3 h-3" />
          Add Step
        </button>
      </div>

      {/* Canvas */}
      <div className="h-[560px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={() => { setSelectedNodeId(null); setShowTypePicker(false); setContextMenu(null); }}
          deleteKeyCode="Delete"
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#374151" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Step-type picker popover */}
      {showTypePicker && (
        <div
          data-picker=""
          className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-2 min-w-[200px]"
          style={{ left: pickerPosition.x, top: pickerPosition.y }}
        >
          <p className="text-xs text-gray-500 px-2 pb-1">Choose step type</p>
          {ACTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => addNode(opt.value)}
              className="w-full text-left px-3 py-2 text-sm text-gray-200 rounded hover:bg-gray-700 transition"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          data-context-menu=""
          className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === 'pane' ? (
            <>
              <p className="text-xs text-gray-500 px-3 py-1.5 border-b border-gray-700">Add Step</p>
              {ACTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => addNode(opt.value, contextMenu.flowPosition)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition"
                >
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                onClick={() => { setSelectedNodeId(contextMenu.nodeId!); setContextMenu(null); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition"
              >
                Configure Step
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() => deleteNode(contextMenu.nodeId!)}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition"
              >
                Delete Step
              </button>
            </>
          )}
        </div>
      )}

      {/* Node config panel */}
      {selectedNode && (
        <NodeConfigPanel
          nodeId={selectedNode.id}
          data={selectedNode.data}
          onUpdate={updateNodeData}
          onDelete={() => deleteNode(selectedNode.id)}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}

export default function PlaybookCanvasEditor(props: PlaybookCanvasEditorProps) {
  return (
    <ReactFlowProvider>
      <Editor {...props} />
    </ReactFlowProvider>
  );
}
