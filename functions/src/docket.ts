/**
 * API Endpoint: /docket
 * 
 * 
 */
import { Router, RequestHandler } from 'express'
import * as admin  from 'firebase-admin'

const router = Router()
export { router as default }

/**
 * Converts the given Docket into an Invoice
 * Looks up the aircraft rate and other fees and add these to the 
 * invoice. Calculates the item totals and the invoice total.
 * 
 */
async function calcInvoice(docket: Docket): Promise<Invoice> {
    const invoice: Invoice = {
        user: '',
        docket: docket.docket,
        items: [],
        total: 0,
    }
    // Look up aircraft rate in Firestore
    const aircraft: Aircraft = (await admin.firestore().collection('aircraft').doc(docket.aircraft).get()).data() as Aircraft
    if (aircraft) {
      invoice.items.push({
        description: aircraft.label,
        qty: docket.vdo.in - docket.vdo.out,
        rate: aircraft.rate,
        total: aircraft.rate * (docket.vdo.in - docket.vdo.out),
      })
    }

    // Loops through each landing in the docket and looks up the fee in Firestore
    for(const landing of docket.landings) {
        const fee: Fee = (await admin.firestore().collection('fees').doc(landing.feeId).get()).data() as Fee
        if (fee) {
          invoice.items.push({
            description: fee.label,
            qty: landing.qty,
            rate: fee.price,
            total: fee.price * landing.qty,
          })
        }  
    }

    // Calculates the invoice total
    invoice.items.forEach((item: InvoiceItem) => {
      invoice.total += item.total
    })

    return invoice
  }

/**
 * POST /docket
 * 
 * Converts the current docket and converts it in to an invoice.
 * Create a Stripe PaymnentIntent and stores the invoice with reference to the
 * PaymentIntent into Firestore
 * 
 */
const create: RequestHandler = async (req, res) => {
    const invoice = await calcInvoice(req.body as Docket)
    invoice.user = 'useridgoeshere'
    await admin.firestore().collection('invoices').doc(String(invoice.docket)).set(invoice)
    // TBD: Create Stripe PaymentIntent
    res.send(invoice)
}

router.post('/', create)