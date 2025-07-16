import { CONFIG } from "./config.js";

import { CONFIG } from "./config.js";

class FlightService {
  async fetchFlights(iataCodeCity, type) {
    const url = `${CONFIG.AVIATIONSTACK_BASE_URL}?access_key=${CONFIG.AVIATIONSTACK_API_KEY}&iataCode=${iataCodeCity}&type=${type}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching flight data from Aviationstack:", error);
      return [];
    }
  }

  async fetchAirlineIcon(airlineCode) {
    const iconUrl = `${CONFIG.AIRLINE_ICON_BASE_URL}${airlineCode}.svg`;
    try {
      const response = await fetch(iconUrl);
      if (response.ok) {
        return iconUrl;
      }
    } catch (error) {
      console.error(`Error fetching airline icon for ${airlineCode}:`, error);
    }
    return "";
  }
}

export default FlightService;