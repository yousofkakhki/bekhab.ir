import { defineConfig, devices } from '@playwright/test';

// Chromium flags so Web Audio actually starts in headless (no real speakers needed)
const audioLaunch = {
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--use-fake-ui-for-media-stream',
    '--mute-audio',
  ],
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // audio tests instrument globals; keep them serial
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], launchOptions: audioLaunch },
      testIgnore: '**/mobile-*.spec.ts',
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'], launchOptions: audioLaunch },
      testMatch: '**/mobile-*.spec.ts',
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:3003',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
