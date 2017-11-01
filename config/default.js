module.exports = {
  listingsPerPage: 300,
  targetUrl: "https://www.airbnb.com/s/Austin--TX--United-States/homes?refinements%5B%5D=homes&in_see_all=true&allow_override%5B%5D=&s_tag=QkGJ9fp6",
  sessionOptions: {
    baseUrl: "https://www.airbnb.com/api/v2/explore_tabs",
    defaultParameters: {
      _format: "for_explore_search_web",
      experiences_per_grid: "20",
      items_per_grid: "300",
      guidebooks_per_grid: "20",
      auto_ib: "true",
      fetch_filters: "true",
      is_guided_search: "true",
      is_new_trips_cards_experiment: "false",
      is_new_homes_cards_experiment: "true",
      luxury_pre_launch: "false",
      screen_size: "large",
      show_groupings: "false",
      supports_for_you_v3: "true",
      timezone_offset: "-300",
      metadata_only: "false",
      is_standard_search: "true",
      refinement_path: "%2Fhomes",
      selected_tab_id: "home_tab",
      "refinements%5B%5D" : "homes",
      in_see_all: "true",
      "allow_override%5B%5D" : "",
      s_tag: "QkGJ9fp6",
      location: "Austin%2C+TX%2C+United+States",
      _intents: "p1",
      //key: "",//Commented out b/c it needs to be set dynamically
      currency: "USD",
      locale: "en"
    }
  },
  requestOptions: {
    json: true
  }
};