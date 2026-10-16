export type ModuleId = 'BIO-010' | 'BIO-011' | 'BIO-013' | 'BIO-014' | 'BIO-031' | 'BIO-033' | 'BIO-037' | 'BIO-038' | 'BIO-044';
export interface Structure { id: string; label: string; color: string; description: string }
export interface LessonStep { title: string; description: string; keyIdea: string; focus: string[]; metrics?: { label: string; value: string }[] }
export interface Variant { id: string; label: string; description: string }
export interface ModuleSpec {
  id: ModuleId; title: string; level: 'AS' | 'A Level'; bundle: string; kicker: string; description: string; outcome: string;
  structures: Structure[]; steps: LessonStep[]; variants?: Variant[];
  question: { prompt: string; options: string[]; answer: number; explanation: string };
  sources: { title: string; url: string }[]; limitation: string;
}
export interface SceneProps {
  moduleId: ModuleId; spec: ModuleSpec; step: number; playing: boolean; reducedMotion: boolean;
  selected: string; labels: boolean; cutaway: boolean; hidden: string[]; isolate: boolean;
  variant: string; gradient: 'forward' | 'reverse'; energy: boolean;
  onSelect: (id: string) => void;
}
export type CameraAction = 'reset' | 'front' | 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
