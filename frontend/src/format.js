const CURRENCY = import.meta.env.VITE_CURRENCY ?? 'USD'
const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY })

export const money = (value) => formatter.format(Number(value))
export const CONDITIONS = { NEW: 'New', USED: 'Used' }
export const PAGE_SIZE = 12
