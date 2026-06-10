import { test, expect, request } from '@playwright/test';
import { installAudioProbe, readProbe, SOUND_MANIFEST } from './helpers/audio-probe';

test.describe('Audio assets — each sound must have its file', () => {
  test('every sound in the manifest returns HTTP 200', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const missing: string[] = [];

    for (const s of SOUND_MANIFEST) {
      const res = await ctx.get(`${baseURL}/sounds/${s.file}`);
      if (res.status() !== 200) missing.push(`${s.name} (${s.file}) → ${res.status()}`);
    }
    await ctx.dispose();

    expect(missing, `Missing audio assets:\n  - ${missing.join('\n  - ')}`).toEqual([]);
  });

  test('served sound files have an audio content-type and non-zero size', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const problems: string[] = [];

    for (const s of SOUND_MANIFEST) {
      const res = await ctx.get(`${baseURL}/sounds/${s.file}`);
      if (res.status() !== 200) continue; // covered by the test above
      const type = res.headers()['content-type'] ?? '';
      const body = await res.body();
      if (!/audio|mpeg|octet-stream/i.test(type)) problems.push(`${s.file}: bad type "${type}"`);
      if (body.length < 1000) problems.push(`${s.file}: suspiciously small (${body.length} bytes)`);
    }
    await ctx.dispose();

    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('clicking a sound actually decodes audio (no silent 404 failures)', async ({ page }) => {
    await installAudioProbe(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click every sound's play button, then read decode results.
    for (const s of SOUND_MANIFEST) {
      const btn = page.locator(`button[aria-label="پخش ${s.name}"]`);
      if (await btn.count()) {
        await btn.first().click();
        await page.waitForTimeout(200);
      }
    }
    // Give fetch+decode time to settle
    await page.waitForTimeout(1500);

    const probe = await readProbe(page);
    // If all 12 assets existed, decodeFail should be 0.
    expect(
      probe.decodeFail,
      `decodeAudioData failed ${probe.decodeFail} time(s) — a sound card is "active" in the UI but no audio loads.`
    ).toBe(0);
  });
});
