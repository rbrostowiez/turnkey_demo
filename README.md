# Turnkey Demo App
## Purpose
This app will scrape listing data for rentals from a pre-defined AirBnB search for Austin, TX.  When run, it will
retrieve all listings available for the search and persist them to a MongoDB instance.

**NOTE:** I may have misinterpreted the goal of this project, but I have written a script which will grab all data from
the source API utilized by AirBnB's client-side code(I did not specifically target IDs or rank, but instead grabbed it
all).

## Installation
After checking out the repository locally; you will just need to run `npm install`.  This was
implemented using Node.js version 8.9.x.  The configuration uses the url: `mongodb://localhost:27017/turnkey` for
connecting to Mongo DB instance and can be overridden in the `config/default.js`.

## Implementation
The script is implemented with ES6 syntax, and relies primarily on promises.  The packages used are listed below, and most
of the implementation is within `app/scraper.js`.  The file contains a class with the `run` method which will trigger a
sequences of Promises utilizing the other static methods on the class.

### Configuration
The implementation pulls from `config/default.js` for a few items used in the scraping process.  Initially I was trying
to pull 300 records at a time b/c that seemed to be a server-side limit, but it seems that querying that many items
results in broken pagination.  Currently, it will attempt to retrieve a data set 18 items at a time.

### Dependencies
- **bluebird** - For concurrency management within promises
- **cheerio** - For parsing a metadata element within the initial document
- **mongodb** - For Persisting retrieved listing data
- **needle** - For performing HTTP requests
- **shrinkwrap** - Dev Dependency only; used to lock packages

### Process
Initially, the script will hit the provided end-point `https://www.airbnb.com/s/Austin--TX--United-States/homes?refinements%5B%5D=homes&in_see_all=true&allow_override%5B%5D=&s_tag=QkGJ9fp6`
in order to grab the 'API Key'.  From there it will directly query against: `https://www.airbnb.com/api/v2/explore_tabs`
using query parameters that are identical to the in-place requests made by the client-side implementation.  The only
parameter that changes between requests is the `section_offset` parameter -which is initially omitted- then incremented
 from 1...N where N is the number of pages in total.

The retrieved data is then normalized very little; the listing's id is moved to the top level of the element and
`listing.listing` is renamed to `listing.data`.  After normalization, the data is directly persisted to the `listings`
collection within MongoDB.

## Script Operation
The command can be run with `node index.js`.

## Additional Notes
I feel many things can be added to this implementation, and they have been listed below, in no particular order:

- Actual error handling(not just logging and moving on)
- Actual Logger implementation
- Better configuration management(I did prepare for this by utilizing the config library)
- De-duplication/duplicate checking/in-place updates
- If this were to expand beyond simple scraping:
  - Separation of concerns
  - DRY effort(although it's pretty good atm)
  - Expanded Configurability(for scraping)
