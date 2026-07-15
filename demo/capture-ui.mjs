import { createRequire } from 'node:module'
import { mkdir, readdir, rename } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const outputDir = path.resolve('demo/video/raw')
const finalPath = path.resolve('demo/video/done-yet-ui.webm')
await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: outputDir,
    size: { width: 1920, height: 1080 },
  },
})

const page = await context.newPage()
await page.goto('https://done-yet.pages.dev/', { waitUntil: 'networkidle' })
await page.waitForTimeout(7000)

await page.getByRole('button', { name: 'View full contract' }).click()
await page.waitForTimeout(12000)
await page.getByRole('button', { name: 'Close' }).click()

await page.getByRole('button', { name: 'Failed only (2)' }).click()
await page.waitForTimeout(15000)

await page.getByRole('button', { name: /Timeout after commit/ }).click()
await page.waitForTimeout(18000)

await page.getByRole('button', { name: 'Open result JSON' }).click()
await page.waitForTimeout(12000)
await page.getByRole('button', { name: 'Close' }).click()

await page.goto('https://github.com/Peanuts1605/done-yet/tree/main/plugins/done-yet', {
  waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(12000)

await page.goto('https://github.com/Peanuts1605/done-yet#codex-plugin', {
  waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(15000)

await page.goto('https://done-yet.pages.dev/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Repaired run/ }).click()
await page.waitForTimeout(9000)

const video = page.video()
await context.close()
await browser.close()

const rawFiles = await readdir(outputDir)
const rawVideo = rawFiles.find((file) => file.endsWith('.webm'))
if (!rawVideo) throw new Error('Playwright did not produce a video file')
await rename(path.join(outputDir, rawVideo), finalPath)
console.log(finalPath)
