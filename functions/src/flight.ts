import * as functions from 'firebase-functions'
import * as admin  from 'firebase-admin'
import { createPaymentIntent, updatePaymentIntent } from './stripe'

/**
 * Generated a sequential invoice number
 * 
 */
async function generateInvoiceNumber(): Promise<number> {
    const increment = admin.firestore.FieldValue.increment(1)
    const invoiceCounter = admin.firestore().collection('counters').doc('invoice')
    await invoiceCounter.update({ number: increment })
    const counter = (await invoiceCounter.get()).data()
    if(counter) {
        return counter.number
    } else {
        throw new Error('Cuuld not get invoice number')
    }
}

/**
 * Converts given docket to an invoice by calculating:
 *  - Aircraft rental rate
 *  - Landings
 * 
 */
async function docketToInvoice(docket: Docket) : Promise<Invoice> {
    const invoice: Invoice = {
        date: new Date().toISOString(),     // Automatically set current datetime
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
 * Creates a flight record from a docket
 */
export const createFlight = async(docket: Docket, ctx: functions.https.CallableContext): Promise<Flight> => {
    // Create the initial flight record
    const flight: Flight = {
        number: await generateInvoiceNumber(),
        user: ctx.auth?.uid as string,
        date: docket.date,
        docket,
        invoice: await docketToInvoice(docket)
    }

    // Create Stripe Payment Intent and update flight
    const paymentIntent = await createPaymentIntent(flight)
    if(paymentIntent.client_secret) {
        flight.payment = {
            stripePaymentIntent: {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret
            }
        }
    }       

    // Store the flight in firestore
    await admin.firestore().collection('flights').doc(String(flight.number)).set(flight)    

    return flight
}

/**
 * Updates an existing flight record
 * 
 */
export const updateFlight = async(flight: Flight, ctx: functions.https.CallableContext): Promise<Flight> => {
    // Regenerate the invoice items and total
    flight.invoice = await docketToInvoice(flight.docket)

    // Update the payment intent
    await updatePaymentIntent(flight)

    // Store the flight in firestore
    await admin.firestore().collection('flights').doc(String(flight.number)).set(flight)    

    return flight
}