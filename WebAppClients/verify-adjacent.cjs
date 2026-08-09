const { chromium } = require('playwright')

const OUT = 'C:/Users/52551/AppData/Local/Temp/claude/e--VSCode-Clients-Clients/dc43c1e5-d5b5-4dd9-80d3-384043ce88f3/scratchpad'

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('http://localhost:5173/reservas', { waitUntil: 'networkidle' })
  await page.selectOption('select', 'days')
  await page.waitForSelector('text=Hoy')
  await page.screenshot({ path: `${OUT}/adjacent-days-view.png`, fullPage: true })

  await page.click('button:has-text("Nuevo Huésped")')
  await page.waitForSelector('text=Cancelar reserva')
  await page.screenshot({ path: `${OUT}/adjacent-detail.png`, fullPage: true })

  console.log('Console/page errors:', JSON.stringify(errors))
  await browser.close()
})().catch((err) => {
  console.error('FAILED', err)
  process.exit(1)
})
