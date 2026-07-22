const baseUrl = process.env.BASE_URL?.replace(/\/$/, '')

if (!baseUrl) {
  console.error('Set BASE_URL to the deployed origin, for example https://your-app.vercel.app')
  process.exit(1)
}

const routes = [
  '/',
  '/plan',
  '/skills',
  '/flexibility',
  '/progress',
  '/body',
  '/diet',
  '/library',
  '/coach',
  '/settings',
  '/login',
]

const failures = []

for (const route of routes) {
  const url = `${baseUrl}${route}`
  try {
    const response = await fetch(url, { redirect: 'follow' })
    const html = await response.text()
    const looksLikeApp = html.includes('Daniel Training OS') || html.includes('<title>')
    if (!response.ok || !looksLikeApp) {
      failures.push(`${route}: HTTP ${response.status}, app shell ${looksLikeApp ? 'found' : 'missing'}`)
    } else {
      console.log(`OK ${response.status} ${route}`)
    }
  } catch (error) {
    failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures.length) {
  console.error('\nSmoke test failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`\nVerified ${routes.length} production routes at ${baseUrl}`)
