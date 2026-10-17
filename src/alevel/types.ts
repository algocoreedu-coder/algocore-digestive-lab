export type ModuleId = 'BIO-002' | 'BIO-004' | 'BIO-005' | 'BIO-006' | 'BIO-007' | 'BIO-009' | 'BIO-010' | 'BIO-011' | 'BIO-012' | 'BIO-013' | 'BIO-014' | 'BIO-015' | 'BIO-016' | 'BIO-017' | 'BIO-031' | 'BIO-032' | 'BIO-033' | 'BIO-034' | 'BIO-035' | 'BIO-036' | 'BIO-037' | 'BIO-038' | 'BIO-043' | 'BIO-044' | 'BIO-046';
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
