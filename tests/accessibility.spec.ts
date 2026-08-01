import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

for (const path of ['/', '/blog']) {
  test(`${path} has no visible text contrast violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(
      results.violations,
      results.violations
        .flatMap((violation) => violation.nodes.map((node) => `${node.target.join(' ')}: ${node.failureSummary}`))
        .join('\n'),
    ).toEqual([]);
  });
}

test('honors the reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.id = 'motion-probe';
    probe.className = 'breathing-circle transition-all duration-1000';
    document.body.appendChild(probe);
  });

  const durations = await page.evaluate(() => {
    const probe = document.querySelector('#motion-probe');

    return {
      animation: probe ? getComputedStyle(probe).animationDuration : null,
      transition: probe ? getComputedStyle(probe).transitionDuration : null,
    };
  });

  expect(durations.animation).toBe('0.001s');
  expect(durations.transition).toBe('0.001s');
});
