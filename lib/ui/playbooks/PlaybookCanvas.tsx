'use client';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from '@xyflow/react';
import StepNode, { type StepNodeData } from './StepNode';

const NODE_TYPES = { step: StepNode };

const AUTO_LAYOUT_X = 250;
const AUTO_LAYOUT_Y_STEP = 150;
const AUTO_LAYOUT_START_Y = 50;

type StepWithTargets = {
  id: number;
  type: string;
  order?: number | null;
  positionX?: number | null;
  positionY?: number | null;
  nextStepId?: string | null;
  targets: { instanceId: string }[];
};

type PlaybookCanvasProps = {
  steps: StepWithTargets[];
};

export default function PlaybookCanvas({ steps }: PlaybookCanvasProps) {
  const sorted = [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Build edges first so we can compute entry points
  const edges: Edge[] = sorted.flatMap((step, index) => {
    const targetId = step.nextStepId ?? (sorted[index + 1] ? String(sorted[index + 1].id) : null);
    if (!targetId) return [];
    return [{
      id: `e-${step.id}-${targetId}`,
      source: String(step.id),
      target: targetId,
      animated: false,
    }];
  });

  const entryIds = new Set(edges.map((e) => e.target));
  const nodes: Node<StepNodeData>[] = sorted.map((step, index) => ({
    id: String(step.id),
    type: 'step',
    position: {
      x: step.positionX ?? AUTO_LAYOUT_X,
      y: step.positionY ?? AUTO_LAYOUT_START_Y + index * AUTO_LAYOUT_Y_STEP,
    },
    data: {
      type: step.type,
      targets: step.targets.map((t) => t.instanceId),
      isStart: !entryIds.has(String(step.id)),
    },
  }));

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#374151" gap={16} />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              'start-instances': '#22c55e',
              'stop-instances': '#ef4444',
              'restore-instances': '#3b82f6',
            };
            return colors[(node.data as { type: string }).type] ?? '#6b7280';
          }}
          maskColor="rgba(3,7,18,0.75)"
          style={{ background: '#1f2937', border: '1px solid #374151' }}
        />
        <Controls showInteractive={false} className="!bg-gray-800 !border-gray-700" />
      </ReactFlow>
    </div>
  );
}
