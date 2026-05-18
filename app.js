// Configuration
const CONFIG = {
  API_URL: "https://restcountries.com/v3.1/name",
  MAX_RESULTS: 10,
  FLAG_WIDTH: 50,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

const ErrorMessages = {
  NO_CONNECTION: "❌ No internet connection",
  EMPTY_INPUT: "⚠️ Please enter a country name",
  NOT_FOUND: "❌ Country not found",
  RATE_LIMITED: "❌ Too many requests. Please try again later",
  SERVER_ERROR: "❌ Server error. Please try again later",
};

class CountrySearchApp {
  constructor() {
    this.validateDOM();
    this.cache = new Map();
    this.currentRequest = null;
    this.init();
  }

  validateDOM() {
    this.countryInput = document.getElementById("countryInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.resultDiv = document.getElementById("result");

    if (!this.countryInput || !this.searchBtn || !this.resultDiv) {
      throw new Error("Required DOM elements not found");
    }
  }

  init() {
    this.setupEventListeners();
    this.setupNetworkListeners();
  }

  setupEventListeners() {
    this.searchBtn.addEventListener("click", () => this.handleSearch());
    this.countryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleSearch();
      }
    });
  }

  setupNetworkListeners() {
    window.addEventListener("offline", () => {
      this.showMessage(ErrorMessages.NO_CONNECTION, "error");
    });
    window.addEventListener("online", () => {
      this.showMessage("✅ Back online!", "success");
    });
  }

  async handleSearch() {
    if (!navigator.onLine) {
      this.showMessage(ErrorMessages.NO_CONNECTION, "error");
      return;
    }
    const countryName = this.countryInput.ariaValueMax.trim();

    if (!countryName) {
      this.showMessage(ErrorMessages.EMPTY_INPUT, "warnings");
      return;
    }

    const cached = this.cache.get(countryName);
    if (cached) {
      this.displayResults(cached);
      return;
    }

    this.showLoading();

    try {
      const data = await this.fetchCountries(countryName);
      this.cache.set(countryName, data);
      this.displayResults(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchCountries(countryName) {
    if (this.currentRequest) {
      this.currentRequest.abort();
    }

    const controller = new AbortController();
    this.currentRequest = controller;

    const response = await fetch(
      `${CONFIG.API_URL}/${encodeURIComponent(countryName)}`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      this.handleResponseError(response);
    }

    return await response.json();
  }

  handleResponseError(response) {
    const statusCode = response.status;

    if (statusCode === 404) {
      throw new Error(ErrorMessages.NOT_FOUND);
    } else if (statusCode === 429) {
      throw new Error(ErrorMessages.RATE_LIMITED);
    } else if (statusCode === 500) {
      throw new Error(ErrorMessages.SERVER_ERROR);
    }

    throw new Error(`Error ${statusCode}: ${response.statusText}`);
  }

  displayResults(data) {
    const table = this.createResultsTable(data);
    this.resultDiv.innerHTML = "";
    this.resultDiv.appendChild(table);
  }

  createResultsTable(data) {
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Country</th>
          <th>Capital</th>
          <th>Population</th>
          <th>Region</th>
          <th>Flag</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    data.slice(0, CONFIG.MAX_RESULTS).forEach((country) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${this.escapeHtml(country.name.common)}</td>
        <td>${country.capital ? this.escapeHtml(country.capital[0]) : "N/A"}</td>
        <td>${country.population.toLocaleString()}</td>
        <td>${this.escapeHtml(country.region)}</td>
        <td>
          <img 
            src="${country.flags.svg}" 
            width="${CONFIG.FLAG_WIDTH}" 
            alt="Flag of ${this.escapeHtml(country.name.common)}"
          />
        </td>
      `;
      tbody.appendChild(row);
    });

    return table;
  }

    escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  showLoading() {
    this.resultDiv.innerHTML = "<p>⏳ Loading...</p>";
  }

  showMessage(message, type = "info") {
    const colors = {
      error: "red",
      warning: "orange",
      success: "green",
      info: "blue",
    };
    this.resultDiv.innerHTML = `<p style="color: ${colors[type]};">${message}</p>`;
  }

  handleError(error){
    if(error.name === "AbortError"){
        return;
    }
    this.showMessage(error.message, "error");
}
}

// Initialize
try {
  new CountrySearchApp();
} catch (error) {
  console.error("App initialization failed:", error);
}
