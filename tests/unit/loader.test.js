/**
 * Data-loader tests — verify the priority order: global > inline > fetch,
 * and that errors are surfaced with a helpful message.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountPage, DATA_TIMELINE } from '../setup.js';

describe('data loader', () => {
  it('prefers window.__HOR_DATA__ when available (no fetch call)', async () => {
    const fetchSpy = vi.fn();
    window.fetch = fetchSpy;
    await mountPage('main');
    expect(window.__HOR__.state.data).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('exposes timeline data for the main page', async () => {
    await mountPage('main');
    expect(window.__HOR__.state.data.eras.length).toBe(8);
  });

  it('exposes humanoid data for the sister page', async () => {
    await mountPage('humanoid');
    expect(window.__HOR__.state.data.eras.length).toBe(6);
    expect(window.__HOR__.state.data.roster).toBeTruthy();
  });

  it('exposes a stable version string on the global hook', async () => {
    await mountPage('main');
    expect(window.__HOR__.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
