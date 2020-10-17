import * as functions from 'firebase-functions'
import * as admin  from 'firebase-admin'
import Stripe from 'stripe';

const stripe = require('stripe')(functions.config().stripe.secret, {
    apiVersion: '2020-08-27',
  });
// const stripe = require('stripe')(functions.config().stripe.secret)  

/**
 * Creates a Stripe Customer and setupIntent from Firebase User
 * 
 */
export const createStripeCustomer = async (user: admin.auth.UserRecord) => {
    // Create stripe customer
    const customer = await stripe.customers.create({ 
        email: user.email, 
        name: user.displayName || '', 
        phone: user.phoneNumber || '' 
    })
    const intent = await stripe.setupIntents.create({
        customer: customer.id
    })

    // Store customer in firestore
    await admin.firestore().collection('stripe_customers').doc(user.uid).set({
        customer_id: customer.id,
        secret: intent.client_secret
    })
    return
}

/**
 * Deletes Stripe Customer
 * 
 */
export const deleteStripeCustomer = async (user: admin.auth.UserRecord) => {
    // Get the customer id from the database
    const customer = (await admin.firestore().collection('stripe_customers').doc(user.uid).get()).data()

    if(customer) {
        await stripe.customers.del(customer.customer_id)
        return
    }

    throw new Error('User not registered as a Stripe Customer')
}

export const createPaymentIntent = async (flight: Flight): Promise<Stripe.PaymentIntent> => {
    // Get the customer id from the database
    const customer = (await admin.firestore().collection('stripe_customers').doc(flight.user).get()).data()

    if(customer) {
        const intent = await stripe.paymentIntents.create({
            amount: Math.round(flight.invoice.total*100),
            currency: 'aud',
            customer: customer.customer_id,
            metadata: {
                invoice: flight.number,
                docket: flight.docket.number
            }
        })
        return intent    
    }

    throw new Error('User not registered as a Stripe Customer')
}

export const updatePaymentIntent = async (flight: Flight): Promise<Stripe.PaymentIntent> => {
    if(flight.payment) {
        const updatedFields = {
            amount: Math.round(flight.invoice.total*100)
        }
    
        const intent = await stripe.paymentIntents.update(flight.payment.stripePaymentIntent.id, updatedFields)
        return intent    
    }
    throw new Error('PaymentIntent data not provided with flight record')
}

export const fetchPaymentMethods = async (uid: string): Promise<Stripe.PaymentMethod[]> => {
    // Get the customer id from the database
    const customer = (await admin.firestore().collection('stripe_customers').doc(uid).get()).data()

    if(customer) {
        const cardList = await stripe.paymentMethods.list({
            customer: customer.customer_id,
            type: 'card'
        })
        return cardList.data
    }

    throw new Error('User not registered as a Stripe Customer')
}

/**
 * Detaches the payment method from the customer
 * 
 */
export const detachPaymentMethod = async (paymentMethodId: string): Promise<Boolean> => {
    await stripe.paymentMethods.detach(paymentMethodId)
    return true
}

