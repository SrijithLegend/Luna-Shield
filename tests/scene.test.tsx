import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it, vi } from 'vitest';
import { ContextScene } from '../src/three/Context';
import { Scene } from '../src/three/Scene';

// Drei Html / Environment need a DOM/GL; mock the ones that touch them so we exercise OUR scene code.
vi.mock('@react-three/drei', async () => {
  const React = await import('react');
  const Null = () => null;
  return { Html: Null, Stars: Null, Environment: Null, Lightformer: Null, ContactShadows: Null, CameraControls: Null, Line: React.forwardRef(() => null) };
});

// jsdom has no 2D canvas: stub just enough for the procedural textures
HTMLCanvasElement.prototype.getContext = (() => new Proxy({}, { get: () => () => undefined, set: () => true })) as never;

describe('3D scenes mount without throwing', () => {
  it('lunar context scene', async () => {
    const r = await ReactThreeTestRenderer.create(<ContextScene />);
    await r.advanceFrames(3, 0.016);
    expect(r.scene.children.length).toBeGreaterThan(3);
    await r.unmount();
  });
  for (const cfg of ['professional', 'demonstrator'] as const) {
    it(`${cfg} detail scene`, async () => {
      const r = await ReactThreeTestRenderer.create(<Scene cfg={cfg} />);
      await r.advanceFrames(3, 0.016);
      expect(r.scene.children.length).toBeGreaterThan(3);
      await r.unmount();
    });
  }
});
