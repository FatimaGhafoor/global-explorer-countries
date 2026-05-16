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

}
