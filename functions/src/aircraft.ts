import * as functions from 'firebase-functions'
import * as admin  from 'firebase-admin'

function flightDateCompare(a: any, b: any) {
    if(Date.parse(b.data().docket.date) < Date.parse(a.data().docket.date)) {
        return -1
    }
    if(Date.parse(b.data().docket.date) < Date.parse(a.data().docket.date)) {
        return 1
    }
    if(b.id < a.id) {
        return -1
    }
    return 1
}

/**
 * Returns a list of the current aircraft and includes the status of each
 * 
 */
export const fetchAircraft = async(ctx: functions.https.CallableContext): Promise<Aircraft[]> => {
    // Get aircraft from firestore
    const aircraftDocs = (await admin.firestore().collection('aircraft').get()).docs

    const aircraft: Aircraft[] = []

    // Add the last flight for each aircraft
    for(const document of aircraftDocs) {
        const currentAircraft = document.data() as Aircraft

        const statusDocs = (await admin.firestore().collection('flights').where("docket.aircraft", "==", currentAircraft.label).get()).docs
        if(statusDocs.length > 0) {
            const lastFlight = statusDocs.sort(flightDateCompare)[0].data() as Flight
            currentAircraft.lastFlight = lastFlight
        }
        aircraft.push(currentAircraft)
      }

    return aircraft
}