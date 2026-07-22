/** Return a local calendar date without the UTC rollover caused by toISOString(). */
export function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Convert JavaScript's Sun=0 weekday to the product's Mon=0 convention. */
export function mondayFirstWeekday(date = new Date()): number {
  return (date.getDay() + 6) % 7
}

export function startOfWeekKey(date = new Date()): string {
  const copy = new Date(date)
  copy.setHours(12, 0, 0, 0)
  copy.setDate(copy.getDate() - mondayFirstWeekday(copy))
  return localDateKey(copy)
}
