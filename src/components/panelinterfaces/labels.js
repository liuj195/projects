const data = [
  {
    name: "Alabama",
    description: "Montgomery",
    latitude: 32.377716,
    longitude: -86.300568,
    value: 5,
  },
  {
    name: "Alaska",
    description: "Juneau",
    latitude: 58.301598,
    longitude: -134.420212,
    value: 1,
  },
  {
    name: "Arizona",
    description: "Phoenix",
    latitude: 33.448143,
    longitude: -112.096962,
    value: 10,
  },
  {
    name: "Arkansas",
    description: "Little Rock",
    latitude: 34.746613,
    longitude: -92.288986,
    value: 6,
  },
  {
    name: "California",
    description: "Sacramento",
    latitude: 38.576668,
    longitude: -121.493629,
    value: 8,
  },
  {
    name: "Colorado",
    description: "Denver",
    latitude: 39.739227,
    longitude: -104.984856,
    value: 1,
  },
  {
    name: "Connecticut",
    description: "Hartford",
    latitude: 41.764046,
    longitude: -72.682198,
    value: 2,
  },
  {
    name: "Delaware",
    description: "Dover",
    latitude: 39.157307,
    longitude: -75.519722,
    value: 5,
  },
  {
    name: "Hawaii",
    description: "Honolulu",
    latitude: 21.307442,
    longitude: -157.857376,
    value: 1,
  },
  {
    name: "Florida",
    description: "Tallahassee",
    latitude: 30.438118,
    longitude: -84.281296,
    value: 3,
  },
  {
    name: "Georgia",
    description: "Atlanta",
    latitude: 33.749027,
    longitude: -84.388229,
    value: 8,
  },
  {
    name: "Idaho",
    description: "Boise",
    latitude: 43.617775,
    longitude: -116.199722,
    value: 4,
  },
  {
    name: "Illinois",
    description: "Springfield",
    latitude: 39.798363,
    longitude: -89.654961,
    value: 7,
  },
  {
    name: "Indiana",
    description: "Indianapolis",
    latitude: 39.768623,
    longitude: -86.162643,
    value: 2,
  },
  {
    name: "Iowa",
    description: "Des Moines",
    latitude: 41.591087,
    longitude: -93.603729,
    value: 2,
  },
  {
    name: "Kansas",
    description: "Topeka",
    latitude: 39.048191,
    longitude: -95.677956,
    value: 8,
  },
  {
    name: "Kentucky",
    description: "Frankfort",
    latitude: 38.186722,
    longitude: -84.875374,
    value: 5,
  },
  {
    name: "Louisiana",
    description: "Baton Rouge",
    latitude: 30.457069,
    longitude: -91.187393,
    value: 1,
  },
  {
    name: "Maine",
    description: "Augusta",
    latitude: 44.307167,
    longitude: -69.781693,
    value: 1,
  },
  {
    name: "Maryland",
    description: "Annapolis",
    latitude: 38.978764,
    longitude: -76.490936,
    value: 9,
  },
  {
    name: "Massachusetts",
    description: "Boston",
    latitude: 42.358162,
    longitude: -71.063698,
    value: 1,
  },
  {
    name: "Michigan",
    description: "Lansing",
    latitude: 42.733635,
    longitude: -84.555328,
    value: 1,
  },
  {
    name: "Minnesota",
    description: "St. Paul",
    latitude: 44.955097,
    longitude: -93.102211,
    value: 8,
  },
  {
    name: "Mississippi",
    description: "Jackson",
    latitude: 32.303848,
    longitude: -90.182106,
    value: 4,
  },
  {
    name: "Missouri",
    description: "Jefferson City",
    latitude: 38.579201,
    longitude: -92.172935,
    value: 1,
  },
  {
    name: "Montana",
    description: "Helena",
    latitude: 46.585709,
    longitude: -112.018417,
    value: 4,
  },
  {
    name: "Nebraska",
    description: "Lincoln",
    latitude: 40.808075,
    longitude: -96.699654,
    value: 0,
  },
  {
    name: "Nevada",
    description: "Carson City",
    latitude: 39.163914,
    longitude: -119.766121,
    value: 7,
  },
  {
    name: "New Hampshire",
    description: "Concord",
    latitude: 43.206898,
    longitude: -71.537994,
    value: 9,
  },
  {
    name: "New Jersey",
    description: "Trenton",
    latitude: 40.220596,
    longitude: -74.769913,
    value: 8,
  },
  {
    name: "New Mexico",
    description: "Santa Fe",
    latitude: 35.68224,
    longitude: -105.939728,
    value: 3,
  },
  {
    name: "North Carolina",
    description: "Raleigh",
    latitude: 35.78043,
    longitude: -78.639099,
    value: 7,
  },
  {
    name: "North Dakota",
    description: "Bismarck",
    latitude: 46.82085,
    longitude: -100.783318,
    value: 3,
  },
  {
    name: "New York",
    description: "Albany",
    latitude: 42.652843,
    longitude: -73.757874,
    value: 1,
  },
  {
    name: "Ohio",
    description: "Columbus",
    latitude: 39.961346,
    longitude: -82.999069,
    value: 5,
  },
  {
    name: "Oklahoma",
    description: "Oklahoma City",
    latitude: 35.492207,
    longitude: -97.503342,
    value: 4,
  },
  {
    name: "Oregon",
    description: "Salem",
    latitude: 44.938461,
    longitude: -123.030403,
    value: 2,
  },
  {
    name: "Pennsylvania",
    description: "Harrisburg",
    latitude: 40.264378,
    longitude: -76.883598,
    value: 5,
  },
  {
    name: "Rhode Island",
    description: "Providence",
    latitude: 41.830914,
    longitude: -71.414963,
    value: 0,
  },
  {
    name: "South Carolina",
    description: "Columbia",
    latitude: 34.000343,
    longitude: -81.033211,
    value: 10,
  },
  {
    name: "South Dakota",
    description: "Pierre",
    latitude: 44.367031,
    longitude: -100.346405,
    value: 4,
  },
  {
    name: "Tennessee",
    description: "Nashville",
    latitude: 36.16581,
    longitude: -86.784241,
    value: 9,
  },
  {
    name: "Texas",
    description: "Austin",
    latitude: 30.27467,
    longitude: -97.740349,
    value: 4,
  },
  {
    name: "Utah",
    description: "Salt Lake City",
    latitude: 40.777477,
    longitude: -111.888237,
    value: 5,
  },
  {
    name: "Vermont",
    description: "Montpelier",
    latitude: 44.262436,
    longitude: -72.580536,
    value: 8,
  },
  {
    name: "Virginia",
    description: "Richmond",
    latitude: 37.538857,
    longitude: -77.43364,
    value: 8,
  },
  {
    name: "Washington",
    description: "Olympia",
    latitude: 47.035805,
    longitude: -122.905014,
    value: 3,
  },
  {
    name: "West Virginia",
    description: "Charleston",
    latitude: 38.336246,
    longitude: -81.612328,
    value: 2,
  },
  {
    name: "Wisconsin",
    description: "Madison",
    latitude: 43.074684,
    longitude: -89.384445,
    value: 7,
  },
  {
    name: "Wyoming",
    description: "Cheyenne",
    latitude: 41.140259,
    longitude: -104.820236,
    value: 8,
  },
];
export default data;
