import * as functions from 'firebase-functions'
import * as admin  from 'firebase-admin'
import { createFlight, docketExists, updateFlightDocket } from './flight'
import { createStripeCustomer, deleteStripeCustomer, fetchPaymentMethods, detachPaymentMethod } from './stripe'
import { fetchAircraft } from './aircraft'

admin.initializeApp()

// App Functions
/**
 * Creates or Updates flight details
 * ./flight.ts
 */
exports.docketExists = functions.https.onCall(docketExists)
exports.createFlight = functions.https.onCall(createFlight)
exports.updateFlightDocket = functions.https.onCall(updateFlightDocket)

// Aircraft Functions
/**
 * Returns a list of aircraft and statusses
 * ./aircraft.ts
 */
exports.fetchAircraft = functions.https.onCall(fetchAircraft)

/**
 * Stripe Functions
 * ./stripe.ts
 */

// Run automatically when a new Firebase user is created/updated/deleted
exports.createStripeCustomer = functions.auth.user().onCreate(createStripeCustomer)
exports.deleteStripeCustomer = functions.auth.user().onDelete(deleteStripeCustomer)

// Manage Payment Methods
exports.fetchPaymentMethods = functions.https.onCall(fetchPaymentMethods)
exports.detachPaymentMethod = functions.https.onCall(detachPaymentMethod)