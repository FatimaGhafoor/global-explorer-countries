// Configuration
const CONFIG = {
  API_URL: "https://restcountries.com/v3.1/name",
  MAX_RESULTS: 10,
  FLAG_WIDTH: 50,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

const countryInput = document.getElementById("countryInput");
const searchBtn = document.getElementById("searchBtn");
const resultDiv = document.getElementById("result");

if (!countryInput || !searchBtn || !resultDiv) {
  console.log("Required DOM elements not found");
  throw new Error("Application initialization failed");
}

window.addEventListener("offline", () => {
  resultDiv.innerHTML = "⚠️ You are offline now.";
});

window.addEventListener("online", () => {
  resultDiv.innerHTML = "✅ Back online! You can search again.";
});

async function handleSearch() {
  if (!navigator.onLine) {
    resultDiv.innerHTML = `
  <p style="color:red; font-weight:bold;">
    ❌ No internet connection. Please check your network.
  </p>
`;
    return;
  }

  const countryName = countryInput.value.trim();

  if (!countryName) {
    resultDiv.innerHTML = "<p>⚠️ Please enter a country name.</p>";
    return;
  }

  try {
    resultDiv.innerHTML = "<p>⏳ Loading...</p>";

    const response = await fetch(`${CONFIG.API_URL}/${country}`);

    if (!response.ok) {
      throw new Error("Country not found");
    }

    const data = await response.json();

    let output = `
      <table>
        <thead>
          <tr>
            <th>Country</th>
            <th>Capital</th>
            <th>Population</th>
            <th>Region</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.slice(0, CONFIG.MAX_RESULTS).forEach((country) => {
      output += `
        <tr>
          <td>${country.name.common}</td>
          <td>${country.capital ? country.capital[0] : "N/A"}</td>
          <td>${country.population.toLocaleString()}</td>
          <td>${country.region}</td>
          <td><img src="${country.flags.svg}" width="${CONFIG.FLAG_WIDTH}" alt="Flag of ${country.name.common}"></td>
        </tr>
      `;
    });

    output += "</tbody></table>";
    resultDiv.innerHTML = output;
  } catch (error) {
    resultDiv.innerHTML = `<p>❌ ${error.message}</p>`;
  }
}

searchBtn.addEventListener("click", handleSearch);

countryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
});
