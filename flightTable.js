import {
  getCityNameFromIATA,
  formatFlightTime,
  isUpcomingFlight,
  sortFlightsByTime,
  generateRandomGate,
} from "./utils.js";
import FlightService from "./flightService.js";

class FlightTableManager {
  constructor(tickerManager) {
    this.flightService = new FlightService();
    this.tickerManager = tickerManager;
    this.departureTableBody = document.querySelector("#departure-table tbody");
    this.arrivalTableBody = document.querySelector("#arrival-table tbody");
    this.gateCache = {};
  }

  setRowsCount(count) {
    this.rowsCount = count;
  }

  async saveLogsToFile(logData) {
  if ('showSaveFilePicker' in window) {
    try {
      const options = {
        suggestedName: 'flight-log.txt',
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt'] }
        }]
      };
      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(logData, null, 2));
      await writable.close();
      alert('Log saved successfully!');
    } catch (err) {
      console.error('Error saving log file:', err);
    }
  } else {
    alert('File System Access API not supported in this browser.');
  }
}

  async updateDepartureTable(flights) {
    const currentTime = new Date();
    let upcomingFlights = flights.filter((flight) =>
      isUpcomingFlight(flight.departure.scheduledTime)
    );

    if (upcomingFlights.length === 0) {
      upcomingFlights = [...flights];
    }

    upcomingFlights = sortFlightsByTime(upcomingFlights, "departure");
    this.departureTableBody.innerHTML = "";

    const uniqueFlights = [];
    const seenFlightNo = new Set();

    for (const flight of upcomingFlights) {
      if (uniqueFlights.length >= this.rowsCount) break;

      const flightTime = formatFlightTime(flight.departure.scheduledTime);

      const iataCode =
        flight.arrival && flight.arrival.iataCode
          ? flight.arrival.iataCode
          : "Unknown";
      const destinationCity = getCityNameFromIATA(iataCode);

      const airlineCode =
        flight.airline && flight.airline.iataCode
          ? flight.airline.iataCode
          : "XX";
      const airlineIcon = await this.flightService.fetchAirlineIcon(
        airlineCode
      );

      if (flight.departure.gate) {
        this.gateCache[flight.flight.iata] = flight.departure.gate;
      } else {
        this.gateCache[flight.flight.iata] = null;
      }

      let gate = this.gateCache[flight.flight.iata];
      if (gate === null || gate === undefined) {
        gate = "Soon";
      }
      let status = flight.status || "N/A";
      if (flight.departure.delay) {
        status += ` (+${flight.departure.delay} min)`;
      }
      const statusClass = status.toLowerCase().replace(/\s/g, "-");

      const row = document.createElement("tr");
      row.innerHTML = `
    <td>${flightTime}</td>
    <td>${destinationCity} (${iataCode})</td>
    <td>
      <img src="${airlineIcon}" alt="${airlineCode}" class="airline-icon">
      ${flight.flight.iata || flight.flight.iataNumber || "N/A"}
    </td>
    <td>${gate}</td>
    <td class="${statusClass}">${status}</td>
  `;

      this.departureTableBody.appendChild(row);
      uniqueFlights.push(flight);
      seenFlightNo.add(flight.flight.iata);
      this.tickerManager.addFlightStatusUpdate(flight, "departure");
    }
  }

  async updateArrivalTable(flights) {
    let upcomingFlights = flights.filter((flight) =>
      isUpcomingFlight(flight.arrival.scheduledTime, true)
    );

    if (upcomingFlights.length === 0) {
      upcomingFlights = [...flights];
    }

    upcomingFlights = sortFlightsByTime(upcomingFlights, "arrival");
    this.arrivalTableBody.innerHTML = "";

    const uniqueFlights = [];
    for (const flight of upcomingFlights) {
      if (uniqueFlights.length >= this.rowsCount) break;

      const flightTime = formatFlightTime(flight.arrival.scheduledTime);
      const iataCode =
        flight.arrival.iata || flight.arrival.iataCode || "Unknown";
      const departureCity = getCityNameFromIATA(iataCode);
      const airlineCode = flight.flight.iata
        ? flight.flight.iata.slice(0, 2)
        : "XX";
      const airlineIcon = await this.flightService.fetchAirlineIcon(
        airlineCode
      );

      if (flight.arrival.gate) {
        this.gateCache[flight.flight.iata] = flight.arrival.gate;
      } else if (!this.gateCache[flight.flight.iata]) {
        this.gateCache[flight.flight.iata] = generateRandomGate();
      }

      const gate = this.gateCache[flight.flight.iata];
      const status = flight.status || "N/A";
      const statusClass = status.toLowerCase().replace(/\s/g, "-");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${flightTime}</td>
        <td>${departureCity} (${iataCode})</td>
        <td>
          <img src="${airlineIcon}" alt="${airlineCode}" class="airline-icon">
          ${flight.flight.iata || flight.flight.iataNumber || "N/A"}
        </td>
        <td>${gate}</td>
        <td class="${statusClass}">${status}</td>
      `;

      this.arrivalTableBody.appendChild(row);
      uniqueFlights.push(flight);
      this.tickerManager.addFlightStatusUpdate(flight, "arrival");
    }
  }

  async updateTableDisplay() {
    const allFlights = await this.flightService.fetchFlights();
    console.log("Fetched flight data:", allFlights);
  await this.saveLogsToFile(allFlights);

    const departures = allFlights.filter(
      (f) => f.departure && f.departure.scheduledTime
    );

    await this.updateDepartureTable(departures);
  }
}

export default FlightTableManager;
