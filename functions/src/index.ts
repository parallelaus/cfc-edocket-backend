import * as functions from 'firebase-functions'
import * as admin  from 'firebase-admin'
import { createFlight, updateFlight } from './flight'
import { createStripeCustomer, deleteStripeCustomer, fetchPaymentMethods } from './stripe'

admin.initializeApp()

// App Functions
/**
 * Creates or Updates flight details
 */
exports.createFlight = functions.https.onCall(createFlight)
exports.updateFlight = functions.https.onCall(updateFlight)

/**
 * Stripe Functions
 * 
 */

// Run automatically when a new Firebase user is created/updated/deleted
exports.createStripeCustomer = functions.auth.user().onCreate(createStripeCustomer)
exports.deleteStripeCustomer = functions.auth.user().onDelete(deleteStripeCustomer)

// Manage Payment Methods
exports.fetchPaymentMethods = functions.https.onCall(fetchPaymentMethods)