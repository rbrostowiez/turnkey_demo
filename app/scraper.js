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

    static initializeSession() {
        console.log("Initializing session");

        return needle('get', config.targetUrl)
            .then(res => JSON.parse(cheerio.load(res.body)('#_bootstrap-layout-init').attr('content')));
    }

    static normalizeListings(listings) {
        console.log("Normalizing listing data...");
        for(let i = 0, l = listings.length; i < l; i++){
            let listing = listings[i];

            listing.listing_id = listing.listing.id;
            listing.data = listing.listing;
            delete listing.listing;
        }

        return listings;
    }

    static getListings(sessionData) {
        console.log("Getting listings");
        let urlParams = Object.assign({key: sessionData.api_config.key}, config.sessionOptions.defaultParameters);
        let firstUrl = config.sessionOptions.baseUrl + "?" + Object.keys(urlParams).map(key => `${key}=${urlParams[key]}`).join("&");
        //Priming with initial request, then populate an array of remaining result-requests
        return needle('get', firstUrl).then(res =>{
            let pageCount = Math.ceil(res.body.explore_tabs[0].home_tab_metadata.listings_count / config.listingsPerPage);
            let initialResults = res.body.explore_tabs[0].sections[0].listings;
            let urls = [];
            console.log(`Performing the ${pageCount -1} remaining requests to retrieve: ${res.body.explore_tabs[0].home_tab_metadata.listings_count} results!`);
            for(let i = 1; i < pageCount; i++){
                urlParams.section_offset = i;
                urls.push(config.sessionOptions.baseUrl + "?" + Object.keys(urlParams).map(key => `${key}=${urlParams[key]}`).join("&"));
            }
            //Trigger a fetch for each URL then concat to the first result set
            return Promise.resolve(urls).map(url => needle('get', url).then(result => result.body.explore_tabs[0].sections[0].listings), {concurrency: 2}).then(results => Array.prototype.concat.apply(initialResults, results));
        });
    }

    static storeListings(listings) {
        //TODO: Log/Store Listing
        console.log(`Storing Listings: ${listings.length} total`);

        return MongoClient.connect(config.mongo.url).then(db => db.collection('listings').insertMany(listings).then(()=>db.close())).catch(console.error);
    }
}

module.exports = Scraper;