const userLocation = document.getElementById("userLocation");
const converter = document.getElementById("converter");
const continentSel = document.getElementById("continent");
const weatherIcon = document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feelsLike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.querySelector(".city");

const HValue = document.getElementById("HValue");
const WValue = document.getElementById("WValue");
const SRvalue = document.getElementById("SRvalue");
const SSvalue = document.getElementById("SSvalue");
const CValue = document.getElementById("CValue");
const UVValue = document.getElementById("UVValue");
const PValue = document.getElementById("PValue");

const forcastContainer = document.querySelector(".Forcast");
const getLocationBtn = document.getElementById("getLocationBtn"); // <-- Add this button in your HTML

const weatherCodeToIcon = {
    0: "fa-sun",
    1: "fa-cloud-sun",
    2: "fa-cloud",
    3: "fa-cloud",
    45: "fa-smog",
    48: "fa-smog",
    51: "fa-cloud-rain",
    53: "fa-cloud-rain",
    55: "fa-cloud-rain",
    56: "fa-cloud-rain",
    57: "fa-cloud-rain",
    61: "fa-cloud-showers-heavy",
    63: "fa-cloud-showers-heavy",
    65: "fa-cloud-showers-heavy",
    66: "fa-cloud-showers-heavy",
    67: "fa-cloud-showers-heavy",
    71: "fa-snowflake",
    73: "fa-snowflake",
    75: "fa-snowflake",
    77: "fa-snowflake",
    80: "fa-cloud-showers-heavy",
    81: "fa-cloud-showers-heavy",
    82: "fa-cloud-showers-heavy",
    85: "fa-snowflake",
    86: "fa-snowflake",
    95: "fa-bolt",
    96: "fa-bolt",
    99: "fa-bolt"
};

const regionToTimezone = {
    "Europe": "Europe/London",
    "America": "America/New_York",
    "Asia": "Asia/Bangkok",
    "Africa": "Africa/Cairo",
    "Australia": "Australia/Sydney"
};

// --- New: Get user's current geolocation ---
if (getLocationBtn) {
    getLocationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        getLocationBtn.disabled = true;
        getLocationBtn.textContent = "Getting location...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Use Open-Meteo's timezone API to get the timezone for these coordinates
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetch(`https://api.open-meteo.com/v1/timezone?latitude=${lat}&longitude=${lon}`)
                    .then(res => res.json())
                    .then(tzData => {
                        let tz = tzData.timezone || "Etc/UTC";
                        // Use a reverse-geocoding API to get the city/country (optional)
                        fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`)
                            .then(res => res.json())
                            .then(geoData => {
                                if (geoData.results && geoData.results.length > 0) {
                                    const loc = geoData.results[0];
                                    city.innerHTML = `${loc.name}, ${loc.country} <span style="font-size:0.8em;color:#888;">(${tz})</span>`;
                                } else {
                                    city.innerHTML = `Your Location <span style="font-size:0.8em;color:#888;">(${tz})</span>`;
                                }
                                getWeather(lat, lon, tz);
                                getLocationBtn.disabled = false;
                                getLocationBtn.textContent = "Get my location";
                            })
                            .catch(() => {
                                city.innerHTML = `Your Location <span style="font-size:0.8em;color:#888;">(${tz})</span>`;
                                getWeather(lat, lon, tz);
                                getLocationBtn.disabled = false;
                                getLocationBtn.textContent = "Get my location";
                            });
                    });
            },
            (err) => {
                alert("Unable to get your location. Please allow location access or search manually.");
                getLocationBtn.disabled = false;
                getLocationBtn.textContent = "Get my location";
            }
        );
    });
}

function findUserLocation() {
    const place = userLocation.value.trim();
    if (!place) {
        alert("Enter a location!");
        return;
    }

    clearWeather();

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`)
        .then(res => res.json())
        .then(geoData => {
            if (!geoData.results || geoData.results.length === 0) {
                alert("Location not found!");
                return;
            }
            const loc = geoData.results[0];
            let tz = loc.timezone;
            if (!tz || tz === "Etc/UTC") {
                const region = continentSel ? continentSel.value : "";
                tz = regionToTimezone[region] || "Etc/UTC";
            }
            city.innerHTML = `${loc.name}, ${loc.country} <span style="font-size:0.8em;color:#888;">(${tz})</span>`;
            getWeather(loc.latitude, loc.longitude, tz);
        })
        .catch(() => alert("Unable to fetch location!"));
}

function getWeather(lat, lon, timezone) {
    const units = converter.value === "fahrenheit" ? "fahrenheit" : "celsius";
    const windspeedUnit = "kmh";
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,apparent_temperature_max,apparent_temperature_min,pressure_msl_max,pressure_msl_min,relative_humidity_2m_max,relative_humidity_2m_min,cloudcover_mean` +
        `&timezone=${encodeURIComponent(timezone)}&temperature_unit=${units}&windspeed_unit=${windspeedUnit}`;
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            const daily = data.daily;
            if (!daily) {
                alert("Weather data not available for this location!");
                return;
            }

            // Show "today"/current as the first day's data
            const todayIdx = 0;
            const code = daily.weathercode[todayIdx];
            weatherIcon.innerHTML = `<i class="fa-solid ${weatherCodeToIcon[code] || "fa-question"}" style="font-size:2.5rem"></i>`;
            temperature.innerHTML = Math.round(daily.temperature_2m_max[todayIdx]) + `<span>${units === "fahrenheit" ? "°F" : "°C"}</span>`;
            feelsLike.innerHTML =
                `Feels like: ${Math.round(daily.apparent_temperature_max[todayIdx])}<span>${units === "fahrenheit" ? "°F" : "°C"}</span>`;
            description.innerHTML = getWeatherDescription(code);

            const now = new Date();
            date.innerHTML = now.toLocaleString('en-US', {
                weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
            });

            HValue.innerHTML = (daily.relative_humidity_2m_max[todayIdx] !== undefined ? daily.relative_humidity_2m_max[todayIdx] : "-") + "<span>%</span>";
            WValue.innerHTML = (daily.wind_speed_10m_max[todayIdx] !== undefined ? daily.wind_speed_10m_max[todayIdx] : "-") + "<span> km/h</span>";
            CValue.innerHTML = (daily.cloudcover_mean[todayIdx] !== undefined ? daily.cloudcover_mean[todayIdx] : "-") + "<span>%</span>";
            UVValue.innerHTML = daily.uv_index_max[todayIdx] !== undefined ? daily.uv_index_max[todayIdx] : "-";
            PValue.innerHTML = (daily.pressure_msl_max[todayIdx] !== undefined ? daily.pressure_msl_max[todayIdx] : "-") + "<span> hPa</span>";

            SRvalue.innerHTML = daily.sunrise && daily.sunrise[todayIdx] ? formatTime(daily.sunrise[todayIdx], timezone) : "-";
            SSvalue.innerHTML = daily.sunset && daily.sunset[todayIdx] ? formatTime(daily.sunset[todayIdx], timezone) : "-";

            // --- 7-Day Forecast ---
            forcastContainer.innerHTML = "";
            if (daily && daily.time && daily.time.length > 0) {
                for (let i = 0; i < daily.time.length; i++) {
                    const wcode = daily.weathercode[i];
                    const tmin = daily.temperature_2m_min[i];
                    const tmax = daily.temperature_2m_max[i];
                    const dayLabel = new Date(daily.time[i]).toLocaleString('en-US', { weekday: "long", month: "long", day: "numeric" });
                    const icon = weatherCodeToIcon[wcode] || "fa-question";
                    const desc = getWeatherDescription(wcode);

                    let div = document.createElement("div");
                    div.innerHTML = `
                        <div>${dayLabel}</div>
                        <div><i class="fa-solid ${icon}" style="font-size:2rem"></i></div>
                        <p class="forcast-decs">${desc}</p>
                        <span>
                            <span>${Math.round(tmin)}${units === "fahrenheit" ? "°F" : "°C"}</span> /
                            <span>${Math.round(tmax)}${units === "fahrenheit" ? "°F" : "°C"}</span>
                        </span>
                    `;
                    forcastContainer.appendChild(div);
                }
            }
        })
        .catch(e => { console.error(e); alert("Unable to fetch weather data!"); });
}

function getWeatherDescription(code) {
    const desc = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle", 56: "Light freezing drizzle",
        57: "Dense freezing drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        66: "Light freezing rain", 67: "Heavy freezing rain", 71: "Slight snow fall", 73: "Moderate snow fall",
        75: "Heavy snow fall", 77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers",
        82: "Violent rain showers", 85: "Slight snow showers", 86: "Heavy snow showers", 95: "Thunderstorm",
        96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    };
    return desc[code] || "Unknown";
}

function formatTime(dtStr, timezone) {
    const date = new Date(dtStr);
    return date.toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit", timeZone: timezone });
}

function clearWeather() {
    forcastContainer.innerHTML = "";
    temperature.innerHTML = "";
    feelsLike.innerHTML = "";
    description.innerHTML = "";
    date.innerHTML = "";
    city.innerHTML = "";
    HValue.innerHTML = "";
    WValue.innerHTML = "";
    SRvalue.innerHTML = "";
    SSvalue.innerHTML = "";
    CValue.innerHTML = "";
    UVValue.innerHTML = "";
    PValue.innerHTML = "";
    weatherIcon.innerHTML = "";
}

document.querySelector('.fa-search').addEventListener('click', findUserLocation);
converter.addEventListener('change', () => { if (city.innerHTML) findUserLocation(); });
userLocation.addEventListener('keyup', (e) => { if (e.key === "Enter") findUserLocation(); });
