export type Lang = 'en' | 'zh' | 'th';
export type CourseMode = '1min' | '3min';
export type RepMode = 'ball-stick' | 'ribbon' | 'surface';

export interface BeatSpec {
  id: string;
  start: number;
  end: number;
  sceneIdx: 0 | 1 | 2 | 3;
  badge: Record<Lang, string>;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  narration: Record<Lang, string>;
  mechanism: Record<Lang, string>;
  citationIds: string[];
}

export interface CitationItem {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  pdb?: string;
  url: string;
  takeaway: Record<Lang, string>;
}

export interface SceneObjectSpec {
  id: string;
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'helix' | 'bond' | 'ring';
  position: [number, number, number];
  color: string;
  args: number[];
  rotation?: [number, number, number];
  label?: string;
  emissive?: string;
  metalness?: number;
  roughness?: number;
}
