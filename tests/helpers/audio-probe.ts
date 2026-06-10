import type { Page } from '@playwright/test';

/**
 * Installs a probe over the Web Audio API BEFORE any app code runs.
 * Lets tests count AudioContext instances, started/stopped source nodes,
 * decode successes/failures, and resume/suspend calls — the signals we
 * need to prove play/pause sync and asset loading behaviour.
 */
export async function installAudioProbe(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    const probe = {
      contexts: 0,
      ctxList: [] as AudioContext[],
      startedCount: 0,
      stoppedCount: 0,
      startTimes: [] as number[],
      decodeCalls: 0,
      decodeOk: 0,
      decodeFail: 0,
      resumes: 0,
      suspends: 0,
    };
    w.__audioProbe = probe;

    const OrigAC = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext) as typeof AudioContext;
    if (!OrigAC) return;

    function Patched(this: unknown, ...args: unknown[]) {
      // @ts-expect-error native construct
      const ctx: AudioContext = new OrigAC(...args);
      probe.contexts++;
      probe.ctxList.push(ctx);

      const origResume = ctx.resume.bind(ctx);
      ctx.resume = () => {
        probe.resumes++;
        return origResume();
      };
      const origSuspend = ctx.suspend.bind(ctx);
      ctx.suspend = () => {
        probe.suspends++;
        return origSuspend();
      };

      const origDecode = ctx.decodeAudioData.bind(ctx);
      // @ts-expect-error overload
      ctx.decodeAudioData = (data: ArrayBuffer, ...rest: unknown[]) => {
        probe.decodeCalls++;
        // @ts-expect-error passthrough
        const p = origDecode(data, ...rest);
        if (p && typeof p.then === 'function') {
          p.then(
            () => probe.decodeOk++,
            () => probe.decodeFail++
          );
        }
        return p;
      };

      const origCBS = ctx.createBufferSource.bind(ctx);
      ctx.createBufferSource = () => {
        const node = origCBS();
        const origStart = node.start.bind(node);
        node.start = (...a: unknown[]) => {
          probe.startedCount++;
          probe.startTimes.push(performance.now());
          // @ts-expect-error passthrough
          return origStart(...a);
        };
        const origStop = node.stop.bind(node);
        node.stop = (...a: unknown[]) => {
          probe.stoppedCount++;
          // @ts-expect-error passthrough
          return origStop(...a);
        };
        return node;
      };

      return ctx;
    }
    Patched.prototype = OrigAC.prototype;
    // @ts-expect-error override
    window.AudioContext = Patched;
    // @ts-expect-error override
    window.webkitAudioContext = Patched;
  });
}

export type AudioProbe = {
  contexts: number;
  startedCount: number;
  stoppedCount: number;
  startTimes: number[];
  decodeCalls: number;
  decodeOk: number;
  decodeFail: number;
  resumes: number;
  suspends: number;
};

export async function readProbe(page: Page): Promise<AudioProbe> {
  return page.evaluate(() => {
    const p = (window as unknown as { __audioProbe: AudioProbe }).__audioProbe;
    return {
      contexts: p.contexts,
      startedCount: p.startedCount,
      stoppedCount: p.stoppedCount,
      startTimes: p.startTimes,
      decodeCalls: p.decodeCalls,
      decodeOk: p.decodeOk,
      decodeFail: p.decodeFail,
      resumes: p.resumes,
      suspends: p.suspends,
    };
  });
}

/** Returns the .state of every AudioContext the app created. */
export async function readContextStates(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const p = (window as unknown as { __audioProbe: { ctxList: AudioContext[] } })
      .__audioProbe;
    return p.ctxList.map((c) => c.state);
  });
}

/** The 12 sounds declared in src/lib/sound-config.ts (id, Persian name, file). */
export const SOUND_MANIFEST = [
  { id: 'tehran-rain', name: 'باران تهران', file: 'rain.mp3' },
  { id: 'caspian-waves', name: 'امواج خزر', file: 'ocean.mp3' },
  { id: 'brown-noise', name: 'نویز قهوه‌ای', file: 'brown-noise.mp3' },
  { id: 'soft-setar', name: 'سه‌تار آرام', file: 'setar.mp3' },
  { id: 'fireplace', name: 'آتش بخاری', file: 'fire.mp3' },
  { id: 'night-crickets', name: 'جیرجیرک شب', file: 'crickets.mp3' },
  { id: 'wind', name: 'باد کویر', file: 'wind.mp3' },
  { id: 'thunder', name: 'رعد و برق', file: 'thunder.mp3' },
  { id: 'white-noise', name: 'نویز سفید', file: 'white-noise.mp3' },
  { id: 'fan', name: 'پنکه', file: 'fan.mp3' },
  { id: 'birds', name: 'پرندگان صبح', file: 'birds.mp3' },
  { id: 'river', name: 'رودخانه', file: 'river.mp3' },
];
