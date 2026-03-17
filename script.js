const API_KEY = "0133cc5316757ac730cc46ae342334e4";

const form = document.querySelector("#form");
const cityInput = document.querySelector("#city");
const weatherContent = document.querySelector("#weatherContent");
const searchHistory = document.querySelector(".historyBtn");
const consoleBox = document.querySelector("#consoleBox");
const clearHistory = document.querySelector("#clearHistory");

let cityHistory = JSON.parse(localStorage.getItem("cityHistory")) || [];
if (!Array.isArray(cityHistory)) {
    cityHistory = [];
    localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
}

function logMessage(message) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `> ${message}`;
    consoleBox.appendChild(line);
    consoleBox.scrollTop = consoleBox.scrollHeight;
    console.log(message); 
}
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const searchCity = cityInput.value.trim();
    if (!searchCity) return;
    consoleBox.innerHTML = "";
    logMessage("[SYNC] Start");
    
    Promise.resolve().then(() => {
        logMessage("[PROMISE] then (Microtask)");
    });

    setTimeout(() => {
        logMessage("[TIMEOUT] (Macrotask)");
    }, 0);
    logMessage("[ASYNC] Start fetching");
    logMessage("[SYNC] End");
    await getdata(searchCity);
    cityInput.value = "";
});

clearHistory.addEventListener("click", function() {
    cityHistory = [];
    localStorage.removeItem("cityHistory");
    displayHistory();
    consoleBox.innerHTML = "";
    logMessage("[ACTION] Search history cleared");
});

async function getdata(searchCity) {
    if (!searchCity) return;
    try {
        weatherContent.innerHTML = `<p style="color: #666; font-style: italic; border: none;">Loading...</p>`;
        
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}`
        );
        const data = await res.json();
        
        if (data.cod == 200) {
            weatherContent.innerHTML = `
                <p><span>City</span><span>${data.name}, ${data.sys.country}</span></p>
                <p><span>Temp</span><span>${(data.main.temp - 273.15).toFixed(1)} °C</span></p>
                <p><span>Weather</span><span>${data.weather[0].main}</span></p>
                <p><span>Humidity</span><span>${data.main.humidity}%</span></p>
                <p><span>Wind</span><span>${data.wind.speed} m/s</span></p>
            `;

            const lowerCaseCity = data.name.toLowerCase();
            const existingCityIndex = cityHistory.findIndex(city => city.toLowerCase() === lowerCaseCity);
            
            if (existingCityIndex === -1) {
                if (cityHistory.length >= 10) cityHistory.shift(); 
                cityHistory.push(data.name);
                localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
                displayHistory();
            }
            logMessage("[ASYNC] Data received");
            logMessage("[ASYNC] DOM updated");
        } else {
            weatherContent.innerHTML = `
                <p><span>Status</span><span style="color: #d9534f; font-weight: bold;">City not found</span></p>
            `;
            logMessage("[ERROR] City not found");
        }
    } catch (error) {
        weatherContent.innerHTML = `
            <p><span>Status</span><span style="color: #d9534f; font-weight: bold;">Network Error</span></p>
        `;
        logMessage("[ERROR] Failed to fetch data");
    }
}

function displayHistory() {
    searchHistory.innerHTML = "";
    if (!Array.isArray(cityHistory)) {
        cityHistory = [];
    }
    if (cityHistory.length === 0) {
        searchHistory.innerHTML = `<span style="font-size: 11px; color: #777;">No history yet.</span>`;
        return;
    }

    const displayList = [...cityHistory].reverse();
    displayList.forEach((city) => {
        const btn = document.createElement("button");
        btn.innerText = city;
        btn.addEventListener("click", function () {
            consoleBox.innerHTML = "";
            logMessage(`[HISTORY] Re-fetching ${city}`);
            getdata(city);
        });
        searchHistory.appendChild(btn);
    });
}
displayHistory();