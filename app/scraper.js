const config = require('config');
const Promise = require('bluebird');
const needle = require('needle');
const cheerio = require('cheerio');
const {MongoClient} = require('mongodb');

class Scraper {
    static run(){
        return Scraper.initializeSession()
            .then(Scraper.getListings)
            .then(Scraper.normalizeListings)
            .then(Scraper.storeListings)
            .catch(console.error)
            .then(() => console.log('Done processing!'));
    }

    private static initializeSession() {
        console.log("Initializing session");

        return needle('get', config.targetUrl)
            .then(res => JSON.parse(cheerio.load(res.body)('#_bootstrap-layout-init').attr('content')));
    }

    private static normalizeListings(listings) {
        console.log("Normalizing listing data...");
        for(let i = 0, l = listings.length; i < l; i++){
            let listing = listings[i];

            listing.listing_id = listing.listing.id;
            listing.data = listing.listing;
            delete listing.listing;
        }
        return listings;
    }

    private static getListings(sessionData) {
        console.log("Getting listings");
        let urlParams = Object.assign({key: sessionData.api_config.key}, config.sessionOptions.defaultParameters);
        let url = config.sessionOptions.baseUrl + "?" + Object.keys(urlParams).map(key => `${key}=${urlParams[key]}`).join("&");
        //Priming with initial request, then populate an array of remaining result-requests
        return needle('get', url).then(res =>{
            let pageCount = Math.ceil(res.body.explore_tabs[0].home_tab_metadata.listings_count / config.listingsPerPage);
            let promises = [res.body.explore_tabs[0].sections[0].listings];
            console.log(`Performing the ${pageCount -1} remaining requests!`);
            for(let i = 1; i < pageCount; i++){
                urlParams.section_offset = i;
                url = config.sessionOptions.baseUrl + "?" + Object.keys(urlParams).map(key => `${key}=${urlParams[key]}`).join("&");
                promises.push(needle('get', url).then(res => res.body.explore_tabs[0].sections[0].listings));
            }
            //Wait for all promises to resolve, concat results into a single array, then return
            return Promise.all(promises).then(results => Array.prototype.concat.apply([], results));
        });
    }

    private static storeListings(listings) {
        //TODO: Log/Store Listing
        console.log(`Storing Listings: ${listings.length} total`);

        return MongoClient.connect(config.mongo.url).then(db => db.collection('listings').insertMany(listings).then(()=>db.close())).catch(console.error);
    }
}

module.exports = Scraper;