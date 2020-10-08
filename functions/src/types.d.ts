type Aircraft = {
    label: string
    rate: number
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
    }
    landings: [
        {
            feeId: string
            qty: number
        }
    ],
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
}

type Flight = {
    number: number
    user: string
    date: string
    docket: Docket
    invoice: Invoice
    payment?: Payment
}