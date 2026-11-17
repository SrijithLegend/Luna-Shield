import * as THREE from 'three';
import type { HostType } from '../state/store';

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
}

export function hostMaterial(host: HostType): THREE.Material {
  if (host === 'optical')
    return new THREE.MeshPhysicalMaterial({ color: '#a9d8ee', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.38, clearcoat: 1, side: THREE.DoubleSide });
  if (host === 'solar') {
    const map = canvasTex(512, 512, (g) => {
      g.fillStyle = '#0c2447'; g.fillRect(0, 0, 512, 512);
      g.strokeStyle = '#5a86c4'; g.lineWidth = 3;
      for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke(); }
      g.strokeStyle = '#c9d6e8'; g.lineWidth = 1;
      for (let i = 0; i < 8; i++) for (const o of [20, 44]) { g.beginPath(); g.moveTo(i * 64 + o, 0); g.lineTo(i * 64 + o, 512); g.stroke(); }
    });
    return new THREE.MeshPhysicalMaterial({ map, roughness: 0.25, metalness: 0.35, clearcoat: 0.8 });
  }
  const map = canvasTex(256, 256, (g) => {
    g.fillStyle = '#7d848c'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 4) { g.fillStyle = i % 8 ? '#6c737b' : '#8a9199'; g.fillRect(0, i, 256, 2); }
  }, [2, 2]);
  return new THREE.MeshStandardMaterial({ map, roughness: 0.42, metalness: 0.9 });
}

const mk = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
const mp = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);

export interface Mats {
  adhesive: THREE.Material; substrate: THREE.Material; dielectric: THREE.Material; cover: THREE.Material; frame: THREE.Material;
  copper: THREE.MeshStandardMaterial[]; // one per electrode group so each can glow independently
  aluminium: THREE.Material; connector: THREE.Material; gold: THREE.Material; black: THREE.Material;
  pcbBlue: THREE.Material; glass: THREE.Material; particle: THREE.Material; amber: THREE.Material; chip: THREE.Material;
  host: THREE.Material; label: THREE.Material;
}

export function makeMaterials(host: HostType): Mats {
  const copper = [0, 1, 2].map(() => mk({ color: '#b8733a', metalness: 1, roughness: 0.28, emissive: '#22d3ee', emissiveIntensity: 0 }));
  return {
    adhesive: mp({ color: '#cfe6ee', transparent: true, opacity: 0.35, roughness: 0.3, side: THREE.DoubleSide }),
    substrate: mp({ color: '#c97d14', transparent: true, opacity: 0.88, roughness: 0.45, side: THREE.DoubleSide }),
    dielectric: mp({ color: '#e6f4f7', transparent: true, opacity: 0.3, roughness: 0.15, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    cover: mp({ color: '#e9f6f9', transparent: true, opacity: 0.28, roughness: 0.08, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    frame: mp({ color: '#cfe2ea', transparent: true, opacity: 0.4, roughness: 0.1, clearcoat: 1 }),
    copper,
    aluminium: mk({ color: '#aeb6bf', metalness: 0.95, roughness: 0.32 }),
    connector: mk({ color: '#17191d', metalness: 0.2, roughness: 0.6 }),
    gold: mk({ color: '#d4af37', metalness: 1, roughness: 0.3 }),
    black: mk({ color: '#101114', metalness: 0.3, roughness: 0.55 }),
    pcbBlue: mk({ color: '#0f4c81', metalness: 0.2, roughness: 0.5 }),
    glass: mp({ color: '#d7eef7', transparent: true, opacity: 0.14, roughness: 0.02, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    particle: mk({ color: '#d8d2c6', roughness: 0.9, metalness: 0 }),
    amber: mk({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 0.6 }),
    chip: mk({ color: '#1a1a1a', metalness: 0.4, roughness: 0.4 }),
    host: hostMaterial(host),
    label: mk({ color: '#ffffff' }),
  };
}
