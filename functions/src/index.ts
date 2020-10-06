import * as functions from 'firebase-functions'
import * as admin  from 'firebase-admin'
import app from './api'

admin.initializeApp()

exports.v1 = functions.https.onRequest(app)

exports.createInvoice = functions.https.onCall(async (docket: Docket, ctx) => {

    const invoice: Invoice = {
        user: ctx.auth?.uid as string,
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

})
// const stripe = require('stripe')(functions.config().stripe.secret, {
//   apiVersion: '2020-03-02',
// });

/**
 * Automatically create Stripe customer account when new user is created
 */
// export const createStripeCustomer = functions.auth.user().onCreate(async (user) => {
//   // Create stripe customer
//   const customer = await stripe.customers.create({ email: user.email })
//   const intent = await stripe.setupIntents.create({
//     customer: customer.id
//   })

//   // Store customer in firestore
//   await admin.firestore().collection('stripe_customers').doc(user.uid).set({
//     customer_id: customer.id,
//     secret: intent.client_secret
//   })
//   return
// })