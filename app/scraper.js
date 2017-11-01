const config = require('config');

class Scraper {
    static run(){
        Scraper.initializeSession()
            .then(getListings)
            .map(Scraper.storeListing)
            .then(Scraper.logListings)
            .catch(console.error)
            .then(results => console.log('Done processing!'));
    }

    static logListings(listings) {
        //TODO: Log listings collection
        console.log("Logging listings");
    }

    static storeListing(listing) {
        //TODO: Log Store Listing
        console.log("Storing listing");
    }

    static initializeSession(session) {
        //TODO: Initialize Session
        console.log("Initializing session");
    }
}

module.exports = Scraper;