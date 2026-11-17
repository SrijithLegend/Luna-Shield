import { createContext, useContext, type MutableRefObject } from 'react';
import type { ConfigId } from '../data';
import type { Layout } from './layout';
import type { Mats } from './materials';

export interface SceneCtx {
  cfg: ConfigId;
  layout: Layout;
  mats: Mats;
  k: number;
  ex: MutableRefObject<number>;
  clock: MutableRefObject<{ t: number }>;
  /** interactive scenes accept selection/hover; comparison thumbnails are read-only */
  interactive: boolean;
}

export const Ctx = createContext<SceneCtx>(null as unknown as SceneCtx);
export const useScene = () => useContext(Ctx);
