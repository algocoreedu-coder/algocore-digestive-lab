import { ORGANS, STEPS, type OrganId } from './content';

export type LessonMode = 'explore' | 'journey';
export type LessonState = { mode: LessonMode; selectedId: OrganId; step: number; playing: boolean };
export const initialLessonState: LessonState = { mode: 'explore', selectedId: 'mouth', step: 0, playing: false };
export type LessonAction =
  | { type: 'mode'; mode: LessonMode }
  | { type: 'select'; id: OrganId }
  | { type: 'jump'; step: number }
  | { type: 'play'; allowed: boolean }
  | { type: 'pause' }
  | { type: 'tick' }
  | { type: 'reset' };

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'mode': return { ...state, mode: action.mode, playing: false, selectedId: action.mode === 'journey' ? STEPS[state.step].organId : state.selectedId };
    case 'select': {
      if (!ORGANS.some((organ) => organ.id === action.id)) return state;
      const step = state.mode === 'journey' ? STEPS.findIndex((item) => item.organId === action.id) : state.step;
      return { ...state, selectedId: action.id, step, playing: false };
    }
    case 'jump': {
      const step = Math.max(0, Math.min(STEPS.length - 1, action.step));
      return { ...state, step, selectedId: STEPS[step].organId, playing: false };
    }
    case 'play': return { ...state, playing: action.allowed && state.mode === 'journey' };
    case 'pause': return { ...state, playing: false };
    case 'tick': {
      if (!state.playing || state.mode !== 'journey') return state;
      if (state.step === STEPS.length - 1) return { ...state, playing: false };
      const step = Math.min(state.step + 1, STEPS.length - 1);
      return { ...state, step, selectedId: STEPS[step].organId, playing: true };
    }
    case 'reset': return { ...initialLessonState, mode: state.mode };
  }
}
