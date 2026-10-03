/**
 * TruthGuard AI - Misinformation Knowledge Graph & Semantic Relation Engine
 * Constructs directed graphs linking entities, claims, evidence, and debunk sources.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export type NodeType = 'claim' | 'entity' | 'evidence_doc' | 'debunk' | 'actor';

export type EdgeRelation =
  | 'asserts'
  | 'contradicts'
  | 'supports'
  | 'amplifies'
  | 'refutes'
  | 'mentions';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  relation: EdgeRelation;
  confidence: number; // 0.0 - 1.0
  notes?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ContradictionPair {
  claimNode: GraphNode;
  evidenceNode: GraphNode;
  relation: 'contradicts' | 'refutes';
  confidence: number;
}

export class MisinformationGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  addNode(node: GraphNode): this {
    this.nodes.set(node.id, node);
    return this;
  }

  addEdge(edge: GraphEdge): this {
    if (this.nodes.has(edge.source) && this.nodes.has(edge.target)) {
      this.edges.push(edge);
    }
    return this;
  }

  findContradictions(): ContradictionPair[] {
    const pairs: ContradictionPair[] = [];
    for (const edge of this.edges) {
      if (edge.relation === 'contradicts' || edge.relation === 'refutes') {
        const sourceNode = this.nodes.get(edge.source);
        const targetNode = this.nodes.get(edge.target);
        if (sourceNode && targetNode) {
          pairs.push({
            claimNode: sourceNode,
            evidenceNode: targetNode,
            relation: edge.relation,
            confidence: edge.confidence
          });
        }
      }
    }
    return pairs;
  }

  calculateNodeDegree(nodeId: string): { inDegree: number; outDegree: number; total: number } {
    let inDegree = 0;
    let outDegree = 0;
    for (const edge of this.edges) {
      if (edge.target === nodeId) inDegree++;
      if (edge.source === nodeId) outDegree++;
    }
    return { inDegree, outDegree, total: inDegree + outDegree };
  }

  exportGraph(): KnowledgeGraph {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges]
    };
  }
}
