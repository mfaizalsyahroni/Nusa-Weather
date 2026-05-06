// API key dari weatherapi.com
const apiKey = "ecad06b0229e4abd8fe61437260405";

// Kota default yang akan ditampilkan
const city = "Bandung";

// FUNCTION: Mapping kode cuaca ke emoji
function getIconEmoji(code, isNight) {
  // Cerah
  if ([1000].includes(code)) return isNight ? "🌙" : "☀️";

  // Sedikit berawan
  if ([1003].includes(code)) return "🌤️";

  // Berawan
  if ([1006, 1009].includes(code)) return "☁️";

  // Kabut
  if ([1030, 1135, 1147].includes(code)) return "🌫️";

  // Hujan ringan
  if ([1063, 1150, 1153, 1180, 1183, 1240].includes(code)) {
    return isNight ? "🌧️" : "🌦️";
  }

  // Hujan sedang - lebat
  if ([1186, 1189, 1192, 1195, 1243, 1246].includes(code)) {
    return "🌧️";
  }

  // Salju
  if ([1066, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) {
    return "❄️";
  }

  // Campuran hujan + salju
  if ([1069, 1072, 1168, 1171, 1204, 1207, 1237, 1249, 1252, 1261, 1264].includes(code)) {
    return "🌨️";
  }

  // Petir / badai
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
    return "⛈️";
  }

  // Default fallback
  return "🌡️";
}

// FUNCTION: Cek apakah malam atau siang
function isNight(hour) {
  // Malam jika jam >= 18 (6 sore) atau < 6 pagi
  return hour >= 18 || hour < 6;
}

// FUNCTION: Ambil data cuaca dari API berdasarkan kota
function getWeatherByCity(city) {

  // Endpoint API weather (forecast 4 hari) from Today [0,1,2,3]
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=4&lang=en`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      // Ambil bagian data penting
      const current = data.current; // cuaca saat ini
      const forecast = data.forecast.forecastday; // data per hari
      const location = data.location.name; // nama kota
      const todayHourly = data.forecast.forecastday[0].hour; // data per jam hari ini (tdy)

      // Format tanggal (contoh: Monday, 5 May)
      const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      // Deteksi siang / malam berdasarkan waktu lokal kota
      const localHour = new Date(data.location.localtime).getHours();
      const nightMode = isNight(localHour);

      // Ambil emoji berdasarkan kondisi cuaca
      const emoji = getIconEmoji(current.condition.code, nightMode);

      // Ambil element DOM
      const card = document.querySelector(".weather-card");
      const sun = document.querySelector(".sun");
      const moon = document.querySelector(".moon");
      const body = document.body;

      // Toggle mode siang / malam
      if (nightMode) {
        card.classList.remove("day");
        card.classList.add("night");

        body.classList.remove("day");
        body.classList.add("night");

        sun.style.display = "none";
        moon.style.display = "block";
      } else {
        card.classList.remove("night");
        card.classList.add("day");

        body.classList.remove("night");
        body.classList.add("day");

        sun.style.display = "block";
        moon.style.display = "none";
      }

      // Inject data ke UI
      document.querySelector(".city").textContent = location; // nama kota
      document.querySelector(".date").textContent = date; // tanggal

      // Detail tambahan
      document.querySelector(".details-top").innerHTML = `
        <div class="humidity">💧 ${current.humidity}%</div>
        <div class="wind">💨 ${current.wind_kph} km/h</div>
      `;

      // Icon cuaca
      document.querySelector(".weather-icon").textContent = emoji;

      // Suhu
      document.querySelector(".temperature").textContent = `${current.temp_c}°C`;

      // Tampilkan forecast 3 hari ke depan
      showForecast(forecast.slice(1, 4), forecast);

      showHourlyWeather(todayHourly);
    })
    // // Error handlin
    // .catch((error) => {
    //   document.querySelector(".city").textContent = "Gagal memuat data";
    //   console.error(error);
    // });
}


// FUNCTION: Tampilkan forecast harian
function showForecast(forecastDays, fullForecast) {

  const now = new Date();
  const hour = now.getHours();
  const nightMode = isNight(hour);

  const html = forecastDays
    .map((day, index) => {

      const emoji = getIconEmoji(day.day.condition.code, nightMode);

      const label = new Date(day.date).toLocaleDateString("en-US", {
        weekday: "long"
      });

      return `
        <div class="forecast-item" data-index="${index}">
          <div class="weather-day">${label}</div>
          <div class="weather-icon">${emoji}</div>
          <div class="temperature-card">${day.day.avgtemp_c}°C</div>
        </div>
      `;
    })
    .join("");

  document.getElementById("forecast").innerHTML =
    `<div class="forecast-grid">${html}</div>`;

  // 👉 EVENT CLICK
  document.querySelectorAll(".forecast-item").forEach((item, i) => {
    item.addEventListener("click", () => {
      showHourlyModal(fullForecast[i + 1]); // +1 karena skip hari ini
    });
  });
}



function showHourlyWeather(hours) {

  const now = new Date();
  const currentHour = now.getHours();

  // ambil 6 jam ke depan (biar UI clean)
  const nextHours = hours.slice(currentHour, currentHour + 3);

  const html = nextHours.map(hour => {

    const hourNum = new Date(hour.time).getHours();
    const time = hourNum + ":00";

    const emoji = getIconEmoji(
      hour.condition.code,
      isNight(hourNum)
    );

    return `
      <div class="hour-item">
        <div class="hour-time">${time}</div>
        <div class="hour-icon">${emoji}</div>
        <div class="hour-temp">${hour.temp_c}°C</div>
      </div>
    `;
  }).join("");

  //DOM Selection . DOM Manipulation
  document.getElementById("hourly").innerHTML = html;
}


// function showHourlyModal(dayData) {

//   const modal = document.getElementById("hourlyModal");
//   const container = document.getElementById("modalHourly");

//   const html = dayData.hour.map(hour => {

//     const hourNum = new Date(hour.time).getHours();
//     const emoji = getIconEmoji(hour.condition.code, isNight(hourNum));

//     return `
//       <div class="hour-item">
//         <span>${hourNum}:00</span>
//         <span>${emoji}</span>
//         <span>${hour.temp_c}°C</span>
//       </div>
//     `;
//   }).join("");

//   container.innerHTML = html;
//   modal.style.display = "block";
// }

// INIT: Jalankan saat halaman load
window.onload = () => {
  getWeatherByCity(city);
};


// document.querySelector(".close-btn").onclick = function () {
//   document.getElementById("hourlyModal").style.display = "none";
// };

// window.onclick = function (e) {
//   const modal = document.getElementById("hourlyModal");
//   if (e.target === modal) {
//     modal.style.display = "none";
//   }
// };