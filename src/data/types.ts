export type EvidenceLevel =
  | 'Established material family'
  | 'Published EDS candidate'
  | 'LunaShield design hypothesis'
  | 'Requires testing'
  | 'Flight qualification required';

export type ClaimTag =
  | 'NASA DEMONSTRATED'
  | 'PUBLISHED RESEARCH'
  | 'LUNASHIELD TARGET'
  | 'FOUNDER ESTIMATE'
  | 'UNVERIFIED'
  | 'MEASURED IN OUR TEST';

export type ValueTag = 'ASSUMPTION' | 'TARGET' | 'ESTIMATE' | 'UNVERIFIED';
export type CostStatus = 'not quoted' | 'estimate' | 'supplier quote required';
export type ConfigId = 'professional' | 'demonstrator';

/** A number that may be unknown. null renders as "TBD — requires measurement / supplier confirmation". */
export interface Tagged {
  value: number | null;
  unit: string;
  tag: ValueTag;
}

export interface MaterialInfo {
  id: string;
  name: string;
  family: string;
  role: string;
  why: string;
  failureModes: string[];
  qualification: string[];
  alternatives: string[];
  evidence: EvidenceLevel;
  costStatus: CostStatus;
  /** visual hint for the 3D renderer / panel */
  appearance: string;
}

export type LayerKind =
  | 'host' | 'adhesive' | 'substrate' | 'electrodes' | 'dielectric'
  | 'connector' | 'driver' | 'lvconnector' | 'sensor'
  | 'frame' | 'cover' | 'hvmodule' | 'arduino' | 'enclosure' | 'particles';

export interface LayerInfo {
  id: string;
  name: string;
  kind: LayerKind;
  materialId: string;
  /** What this layer does in this configuration */
  purpose: string;
  tradeoffs: string;
  thickness: Tagged;
  cost: { text: string; status: CostStatus };
  validation: string[];
  /** true = part of the thin-film stack (affected by thickness exaggeration) */
  inStack: boolean;
}

export interface ConfigData {
  id: ConfigId;
  name: string;
  tagline: string;
  disclaimer: string;
  layers: LayerInfo[];
  /** electrode phase modes the configuration meaningfully supports */
  phaseModes: (1 | 2 | 3)[];
  architecture: { label: string; note?: string }[];
  feedback: { label: string }[];
  keyFacts: { label: string; value: string; tag: ValueTag | ClaimTag }[];
}
