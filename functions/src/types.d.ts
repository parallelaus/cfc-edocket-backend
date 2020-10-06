type Aircraft = {
    label: string
    rate: number
}

type Fee = {
    group: string
    label: string
    price: number
}

type Docket = {
    docket: number
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
    ]
}

type InvoiceItem = {
    description: string
    qty: number
    rate: number
    total: number
}

type Invoice = {
    user: string
    docket: number
    items: InvoiceItem[]
    total: number
}