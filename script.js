const userLocation = document.getElementById("userLocation");
const converter = document.getElementById("converter");
const weatherIcon = document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelslike = document.querySelector(".feelslike");
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

WEATHER_API_KEY = "";// use api from this :https://open-meteo.com/en/docs
WEATHER_DATA_ENDPOINT="";//

function findUserLocation() {
    fetch(WEATHER_API_KEY + userLocation.value)
    .then((response) => response.json())
    .then((data) => {
           if (data.cod! = "" && data.cod! ="200"){
            alert( data.message);
            return;
           }
           fetch(WEATHER_DATA_ENDPOINT + 'lon=' + data.coord.lon + '&lat=' + {data.coord.lat})
               .then((response) => response.json())
               .then((data) => {
                     console.log(data);
        console.log(data.coord.lon,data.coord.lat);
    });
}
