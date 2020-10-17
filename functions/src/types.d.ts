type Aircraft = {
  label: string
  description?: string
  rate: number
  images: string[],
  lastFlight?: Flight
}

type Fee = {
  id?: string
  group?: string
  label: string
  price: number
}

type Docket = {
  number: number
  date: string
  aircraft: string
  vdo: {
    out: number
    in: number
  },
  taco: {
    out?: number,
    in: number
  }
  fuel: {
    out?: number,
    in: number
  },
  landings: [
    {
      feeId: string
      qty: number
    }
  ]
}

type InvoiceItem = {
  description: string
  qty: number
  rate: number
  total: number
}

type Invoice = {
  date: string
  items: InvoiceItem[]
  total: number
}

type Payment = {
  stripePaymentIntent: {
    id: string
    clientSecret: string
  }
  status: string
  date?: string
  stripePaymentMethodId?: string
}

type StatItem = {
  [key: string]: boolean | number
}

type Flight = {
  number: number
  user: string
  docket: Docket
  invoice: Invoice
  payment?: Payment
  stats?: StatItem[]
  notes?: string
}
