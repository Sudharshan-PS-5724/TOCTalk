import React, { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'

/**
 * CytoscapeDiagram — SRS visualization contract (unified graph in, rendering out).
 *
 * Props:
 *   graph            : { nodes, edges }
 *   highlightStates  : Set<string>   currently active states (simulation)
 *   highlightEdgeIds : Set<string>   currently traversed edge ids
 *   onSelectNode     : (nodeId) => void
 *   onSelectEdge     : (edgeId) => void
 *
 * Layout: custom BFS-based x/y so the start state is on the LEFT, depth
 * grows to the RIGHT (SRS §4 "Left-to-right flow"). Falls back to preset
 * positions — no randomness.
 *
 * Rules enforced:
 *   • Start state: cyan border (thicker).
 *   • Accept state: double-circle border (native Cytoscape `border-style: double`).
 *   • ε-edges: dashed and in a distinct colour.
 *   • Self-loops and multi-edges: Cytoscape bezier curve style.
 */
export default function CytoscapeDiagram({
  graph,
  highlightStates,
  highlightEdgeIds,
  onSelectNode,
  onSelectEdge,
  height = 420,
}) {
  const containerRef = useRef(null)
  const cyRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !graph) return
    const positions = computeLeftToRightLayout(graph)
    const cy = cytoscape({
      container: containerRef.current,
      elements: buildElements(graph),
      style: STYLE,
      layout: { name: 'preset', positions, padding: 32, fit: true },
      wheelSensitivity: 0.25,
      boxSelectionEnabled: false,
    })
    cy.on('tap', 'node', (evt) => onSelectNode?.(evt.target.id()))
    cy.on('tap', 'edge', (evt) => onSelectEdge?.(evt.target.id()))
    cyRef.current = cy
    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [graph, onSelectNode, onSelectEdge])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.batch(() => {
      cy.elements().removeClass('active')
      if (highlightStates) {
        for (const id of highlightStates) cy.$id(id).addClass('active')
      }
      if (highlightEdgeIds) {
        for (const id of highlightEdgeIds) cy.$id(id).addClass('active')
      }
    })
  }, [highlightStates, highlightEdgeIds])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-border bg-[hsl(0_0%_4%)]"
      style={{ height }}
    />
  )
}

function buildElements(graph) {
  const nodes = graph.nodes.map((n) => ({
    data: { id: n.id, label: n.label || n.id },
    classes: [n.isStart && 'start', n.isAccept && 'accept']
      .filter(Boolean)
      .join(' '),
  }))
  const edges = graph.edges.map((e) => ({
    data: {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
    },
    classes: e.label === 'ε' || /(^|,\s*)ε/.test(e.label) ? 'epsilon' : '',
  }))
  return [...nodes, ...edges]
}

/**
 * Custom LR layout:
 *   depth(start) = 0; depth(v) = min depth(u)+1 over reverse edges.
 *   Unreachable nodes are put into their own trailing column.
 *   Within a column, nodes are stacked vertically and centered.
 */
function computeLeftToRightLayout(graph) {
  const adj = new Map()
  for (const n of graph.nodes) adj.set(n.id, [])
  for (const e of graph.edges) adj.get(e.source)?.push(e.target)

  const depth = new Map()
  const roots = graph.nodes.filter((n) => n.isStart).map((n) => n.id)
  const seeds = roots.length ? roots : graph.nodes.slice(0, 1).map((n) => n.id)
  const queue = [...seeds]
  for (const s of seeds) depth.set(s, 0)

  while (queue.length) {
    const u = queue.shift()
    const du = depth.get(u)
    for (const v of adj.get(u) || []) {
      if (!depth.has(v)) {
        depth.set(v, du + 1)
        queue.push(v)
      }
    }
  }

  let maxDepth = 0
  for (const d of depth.values()) if (d > maxDepth) maxDepth = d
  const unreachableDepth = maxDepth + 1
  for (const n of graph.nodes) {
    if (!depth.has(n.id)) depth.set(n.id, unreachableDepth)
  }

  const columns = new Map()
  for (const n of graph.nodes) {
    const d = depth.get(n.id)
    if (!columns.has(d)) columns.set(d, [])
    columns.get(d).push(n.id)
  }

  const dx = 150
  const dy = 95
  const positions = {}
  for (const [d, ids] of columns) {
    ids.forEach((id, i) => {
      positions[id] = {
        x: d * dx,
        y: i * dy - ((ids.length - 1) * dy) / 2,
      }
    })
  }
  return positions
}

const STYLE = [
  {
    selector: 'node',
    style: {
      'background-color': 'hsl(0, 0%, 8%)',
      'border-color': 'hsl(355, 90%, 48%)',
      'border-width': 2,
      label: 'data(label)',
      color: 'hsl(120, 6%, 96%)',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': 12,
      'font-family': 'Inter, system-ui, sans-serif',
      width: 44,
      height: 44,
      shape: 'ellipse',
    },
  },
  {
    selector: 'node.start',
    style: {
      'border-color': 'hsl(186, 100%, 50%)',
      'border-width': 3,
    },
  },
  {
    selector: 'node.accept',
    style: {
      'border-style': 'double',
      'border-width': 6,
      'border-color': 'hsl(355, 90%, 55%)',
    },
  },
  {
    selector: 'node.start.accept',
    style: {
      'border-style': 'double',
      'border-width': 6,
      'border-color': 'hsl(186, 100%, 50%)',
    },
  },
  {
    selector: 'node.active',
    style: {
      'background-color': 'hsl(355, 90%, 45%)',
      color: 'hsl(0, 0%, 98%)',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': 'hsl(186, 90%, 55%)',
      'target-arrow-color': 'hsl(186, 90%, 55%)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'control-point-step-size': 40,
      label: 'data(label)',
      'font-size': 11,
      'font-family': 'JetBrains Mono, ui-monospace, monospace',
      color: 'hsl(120, 6%, 92%)',
      'text-background-color': 'hsl(0, 0%, 8%)',
      'text-background-opacity': 0.92,
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle',
      'text-rotation': 'autorotate',
      'loop-direction': '0deg',
      'loop-sweep': '45deg',
    },
  },
  {
    selector: 'edge.epsilon',
    style: {
      'line-style': 'dashed',
      'line-color': 'hsl(355, 85%, 55%)',
      'target-arrow-color': 'hsl(355, 85%, 55%)',
    },
  },
  {
    selector: 'edge.active',
    style: {
      width: 4,
      'line-color': 'hsl(355, 100%, 60%)',
      'target-arrow-color': 'hsl(355, 100%, 60%)',
    },
  },
]
