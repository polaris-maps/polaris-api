import axios from 'axios';

// The Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * This is the precision for grouping coordinates.
 * We round the coordinates to group nearby lights.
 * 4 decimal places = ~11 meters.
 */
const COORDINATE_PRECISION = 4;

/**
 * Your exact Overpass QL (Query Language) query for Chapel Hill.
 * This query is large and can time out, which is why we've added retries.
 */
const OVERPASS_QUERY = `
  [out:json][timeout:180];
  area["name"="Chapel Hill"]["boundary"="administrative"]->.searchArea;
  (
    node["man_made"="streetlight"](area.searchArea);
    way["man_made"="streetlight"](area.searchArea);
    relation["man_made"="streetlight"](area.searchArea);

    node["highway"="street_lamp"](area.searchArea);
    way["highway"="street_lamp"](area.searchArea);
    relation["highway"="street_lamp"](area.searchArea);

    node["amenity"="street_lamp"](area.searchArea);
    way["amenity"="street_lamp"](area.searchArea);
    relation["amenity"="street_lamp"](area.searchArea);
  );
  out center;
`;

// --- NEW: A helper function to wait for a specific time ---
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function to fetch and process the data
 */
async function findStreetLights() {
  console.log('Fetching street lights for "Chapel Hill" using Luminary query...');

  let response;
  let success = false;
  const maxRetries = 5; // We will try a total of 5 times

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\nAttempt ${attempt} of ${maxRetries}...`);
    try {
      // Overpass API expects the query in the 'data' parameter
      // of a URL-encoded form POST request.
      // NEW: Added a 60-second timeout to the request
      response = await axios.post(
        OVERPASS_API_URL,
        `data=${encodeURIComponent(OVERPASS_QUERY)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 60000, // 60-second timeout
        }
      );

      // If the request succeeds, we're done
      success = true;
      break;

    } catch (error) {
      // Server responded with a status code
      if (error.response) {
        const statusCode = error.response.status;

        // Check for 504 (Gateway Timeout) or 429 (Too Many Requests)
        if (statusCode === 504 || statusCode === 429) {
          console.error(`Error: Server is busy (Status ${statusCode}). Waiting to retry...`);
          
          // NEW: Exponential backoff. Wait 5s, then 10s, then 20s...
          const waitTime = Math.pow(2, attempt - 1) * 5000; // 5s, 10s, 20s, 40s
          await sleep(waitTime);
          continue; // Go to the next attempt
        } else {
          // It's a different server error
          console.error(`Error from Overpass API: ${statusCode} ${error.response.statusText}`);
          if (error.response.data) {
            console.error('API Response Body:', error.response.data);
          }
          break; // Don't retry on other errors
        }
      } else if (error.request) {
        // No response received (e.g., network error or our local timeout)
        console.error('Error: No response received from server.', error.message);
      } else {
        // Other error
        console.error('Error building request:', error.message);
      }
    }
  }

  // If we never succeeded after all retries
  if (!success) {
    console.error('\nFailed to get data from Overpass API after all retries.');
    return; // Exit the function
  }

  // --- Process the successful response ---
  const elements = response.data.elements;

  if (!elements) {
    console.error('Invalid response structure:', response.data);
    return;
  }

  console.log(`\nSuccess! Found ${elements.length} total street light elements.`);

  // Use a Map for our dictionary: { (lon,lat) => count }
  const lightCounts = new Map();

  for (const element of elements) {
    let lat, lon;

    // Nodes have lat/lon properties directly
    if (element.type === 'node') {
      lat = element.lat;
      lon = element.lon;
    }
    // Ways/Relations with "out center;" have a 'center' object
    else if (element.center) {
      lat = element.center.lat;
      lon = element.center.lon;
    }

    // If we successfully extracted coordinates...
    if (lat !== undefined && lon !== undefined) {
      // Create the key based on your (long, lat) example
      const key = `${lon.toFixed(COORDINATE_PRECISION)},${lat.toFixed(
        COORDINATE_PRECISION
      )}`;
      const currentCount = lightCounts.get(key) || 0;
      lightCounts.set(key, currentCount + 1);
    }
  }

  // --- Display Results ---
  console.log('\n--- Street Light Counts (Grouped by Rounded Coordinates) ---');

  if (lightCounts.size === 0) {
    console.log('No street lights found for Chapel Hill.');
    return;
  }

  // Convert Map to a standard object for cleaner logging
  const countsObject = {};
  lightCounts.forEach((value, key) => {
    countsObject[key] = value;
  });

  console.log(countsObject);
  console.log(`\nTotal unique grouped locations: ${lightCounts.size}`);
}

// Run the script
findStreetLights();