import { professional } from './professional.config';
import { demonstrator } from './demonstrator.config';
import type { ConfigData, ConfigId } from './types';

export const CONFIGS: Record<ConfigId, ConfigData> = { professional, demonstrator };
export * from './types';
export { MATERIALS } from './materials';
