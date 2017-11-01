const config = require('config');
const Promise = require('bluebird');
const needle = require('needle');
const cheerio = require('cheerio');

class Scraper {
    static run(){
        Scraper.initializeSession()
            .then(Scraper.getListings)
            .then(Scraper.storeListings)
            .catch(console.error)
            .then(() => console.log('Done processing!'));
    }

    static initializeSession() {
        console.log("Initializing session");
        
        return needle('get', config.targetUrl)
            .then(res => {
                const $body = cheerio.load(res.body);
                return JSON.parse($body('#_bootstrap-layout-init').attr('content'));
            });
    }

    static getListings(sessionData) {
        console.log("Getting listings");
        console.log(sessionData);
        let urlParams = Object.assign({key: sessionData.api_config.key}, config.sessionOptions.defaultParameters);
        let url = config.sessionOptions.baseUrl + "?" + Object.keys(urlParams).map(key => `${key}=${urlParams[key]}`).join("&");
        //Priming with initial request, then populate an array of remaining result-requests
        return needle('get', url).then(res =>{
            let pageCount = Math.ceil(res.body.explore_tabs[0].home_tab_metadata.listings_count / config.listingsPerPage);
            let promises = [res.body.explore_tabs[0].sections[0].listings];
            console.log(`Starting ${pageCount -1} requests!`);
            for(let i = 1; i <= pageCount; i++){
                urlParams.section_offset = i;
                url = config.sessionOptions.baseUrl + "?" + Object.keys(urlParams).map(key => `${key}=${urlParams[key]}`).join("&");
                promises.push(needle('get', url).then(res => res.body.explore_tabs[0].sections[0].listings));
            }

            return Promise.all(promises).then(results => Array.prototype.concat.apply([], results));
        });
    }

    static storeListings(listings) {
        //TODO: Log/Store Listing
        console.log(listings.length);

        return {};
    }
}

module.exports = Scraper;