import { CONFIG } from "./config.js";

class FlightService {
  async fetchFlights(type = "departure") {
    const iataCode = "WAW";
    const url = `${CONFIG.AVIATIONSTACK_BASE_URL}?access_key=${CONFIG.AVIATIONSTACK_API_KEY}&iataCode=${iataCode}&type=${type}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching flight data:", error);
      return [];
    }
  }

  async fetchArrivals() {
    return this.fetchFlights("arrival");
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