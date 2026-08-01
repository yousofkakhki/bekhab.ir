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
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3013',
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
    command: 'npm run build && HOSTNAME=127.0.0.1 PORT=3013 npm start',
    url: 'http://127.0.0.1:3013',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
