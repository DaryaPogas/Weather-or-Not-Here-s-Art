
// fetch("https://jsonplaceholder.typicode.com/posts/1")
//     .then(response => response.json())
//     .then(data => console.log(data))


 //GET https://api.artic.edu/api/v1/artworks?limit=1&fields=id,title,artist_title,place_of_origin,image_id



document.addEventListener("DOMContentLoaded", getArtWork);

const artUrl = "https://api.artic.edu/api/v1/artworks?limit=100"; //limit cannot exceed 100
const geocodeUrlBase = "https://geocoding-api.open-meteo.com/v1/search?name=";
const weatherUrlBase =
  "https://api.open-meteo.com/v1/forecast?current_weather=true";
const countriesUrlBase = "https://restcountries.com/v3.1/name/";

async function getArtWork() {
  try {
    const response = await fetch(artUrl);
    const data = await response.json();
    const artworks = data.data;

    const randomIndex = Math.floor(Math.random() * artworks.length);
    const artWork = artworks[randomIndex];

    const title = artWork.title;
    const artist = artWork.artist_display || "Unknown Artist";
    const placeOfOrigin = artWork.place_of_origin || null;
    const galleryTitle = artWork.gallery_title || "Art Institute of Chicago";

    // GET image from ARTIC
    const imageId = artWork.image_id;
    const imageUrl = `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;

    // Update DOM
    document.getElementById("art-title").innerText = title;
    document.getElementById("art-artist").innerText = `Artist: ${artist}`;
    document.getElementById("art-image").src = imageUrl;
    document.getElementById("art-image").alt = title;

    if (placeOfOrigin && placeOfOrigin !== "unknown location") {
      const isCountry = await checkIfCountry(placeOfOrigin);
      if (isCountry) {
        const capital = await getCapital(placeOfOrigin);
        if (capital) {
          document.getElementById(
            "art-location"
          ).innerText = `Place of origin: ${placeOfOrigin} (capital: ${capital})`;
          fetchWeather(capital);
        } else {
          document.getElementById(
            "art-location"
          ).innerText = `Place of origin: ${placeOfOrigin}, You can now see this artwork in ${galleryTitle}`;
          fetchWeather(galleryTitle);
        }
      } else {
        document.getElementById(
          "art-location"
        ).innerText = `Place of origin: ${placeOfOrigin}`;
        fetchWeather(placeOfOrigin);
      }
    } else {
      document.getElementById(
        "art-location"
      ).innerText = `You can now see this artwork in ${galleryTitle}`;
      fetchWeather(galleryTitle);
    }
  } catch (error) {
    console.error("Something went wrong", error);
  }
}

async function checkIfCountry(place) {
  try {
    const response = await fetch(
      `${countriesUrlBase}${encodeURIComponent(place)}`
    );
    const data = await response.json();
    return data.length > 0;
  } catch (error) {
    console.error("Error while searching country", error);
    return false;
  }
}

async function getCapital(country) {
  try {
    const response = await fetch(
      `${countriesUrlBase}${encodeURIComponent(country)}`
    );
    const data = await response.json();
    return data[0].capital[0];
  } catch (error) {
    console.error("Error while searching capital", error);
    return null;
  }
}

async function fetchWeather(place) {
  try {
    const geoResponse = await fetch(
      `${geocodeUrlBase}${encodeURIComponent(place)}`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.error("Sorry, Weather data unavailable.");
      document.getElementById("art-weather").innerText =
        "Sorry, Weather data unavailable.";
      return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;

    const weatherUrl = `${weatherUrlBase}&latitude=${lat}&longitude=${lon}`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherData.current_weather) {
      console.error("Weather data unavailable");
      document.getElementById("art-weather").innerText =
        "Weather data unavailable";
      return;
    }

    const weather = weatherData.current_weather;
    document.getElementById(
      "art-weather"
    ).innerText = `Current weather in ${place}: ${weather.temperature}°C, ${weather.main}`;
  } catch (error) {
    console.error("Something went wrong", error);
    document.getElementById("art-weather").innerText =
      "Something went wrong.";
  }
}


document.addEventListener("DOMContentLoaded", getArtWork);




