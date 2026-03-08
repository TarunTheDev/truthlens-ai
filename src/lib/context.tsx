import { createContext, useContext } from 'react';
import { DifficultyMode } from './gemini';
import { WorldDomain } from './types';

// ─── Toast Context ─────────────────────────────────────────────────────────────
export interface ToastPayload { message: string; type: 'error' | 'success' | 'info' }
interface ToastCtx { showToast: (msg: string, type?: ToastPayload['type']) => void }
export const ToastContext = createContext<ToastCtx>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

// ─── Difficulty Context ────────────────────────────────────────────────────────
interface DiffCtx { difficulty: DifficultyMode; setDifficulty: (d: DifficultyMode) => void }
export const DifficultyContext = createContext<DiffCtx>({
  difficulty: 'SURVIVAL',
  setDifficulty: () => {},
});
export const useDifficulty = () => useContext(DifficultyContext);

// ─── Domain / World Context ────────────────────────────────────────────────────
export type { WorldDomain };
interface DomainCtx { world: WorldDomain; setWorld: (w: WorldDomain) => void }
export const DomainContext = createContext<DomainCtx>({ world: null, setWorld: () => {} });
export const useDomain = () => useContext(DomainContext);
