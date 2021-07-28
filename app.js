// jshint esversion:8
const express = require('express');
const app = express();

// This "https" moudule is the native Node.js moudule which is used to fetch data
// from external serval through API
const https = require('https');

// global variable array used to store daily data item in line x
var array = [];

// 出现一个bug, ***urlencoded打成了urlendcoded
app.use(express.urlencoded({
  entended: true
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + "/style.css");
});

app.get('/style1.css', (req, res) => {
  res.sendFile(__dirname + "/style1.css");
});

app.get('/background/background.jpg', (req, res) => {
  res.sendFile(__dirname + "/background/background.jpg");
});

app.get('/icon/icon.png', (req, res) => {
  res.sendFile(__dirname+'/icon/icon.png');
});

app.post('/', (req, res) => {
  // user input the latitude
  const lat = req.body.lat;
  // user input the longitude
  const lon = req.body.lon;
  // The weather API URL
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts,hourly&units=metric&appid=ee3e9c644e57471a2bb4752f4dcca3bf`;

  https.get(url, (response) => {
    console.log(response.statusCode);
    // The returned data below is in hexadecimal
    response.on("data", (data) => {
      // JSON.parse() will turn json in string format, hexadecimal, binary or text into actual js object
      const weatherData = JSON.parse(data);
      const location = weatherData.timezone;

      // current data
      const currentDate = new Date(weatherData.current.dt * 1000).toLocaleDateString("zh-cn");
      const currentTemperature = weatherData.current.temp;
      const feelsLike = weatherData.current.feels_like;
      const currentWeather = weatherData.current.weather[0].main.toUpperCase();
      const icon = weatherData.current.weather[0].icon;
      const iconURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";

      // Daily data
      const operation = weatherData.daily.map(item => {
        array.push({
          "Date": new Date(item.dt * 1000).toLocaleDateString("zh-cn"),
          "DailyTemperature": item.temp.day + "℃",
          "NightTemperature": item.temp.night + "℃",
          "Weather": item.weather[0].main,
          "Description": item.weather[0].description,
          "Icon": "http://openweathermap.org/img/wn/" + item.weather[0].icon + "@2x.png",
          "Humidity": item.humidity,
          "UVI": item.uvi
        });
      });

      var today = new Date();
      var time = today.getHours()+':'+today.getMinutes();

      console.log(time);

      // response user back with the parsed data
      var html = `
      <html lang="en" dir="ltr">
        <head>
          <meta charset="utf-8">
          <title>Fetch Weather</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Vollkorn:wght@600&display=swap" rel="stylesheet">
          <!-- bootstrap -->
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
          <link rel="stylesheet" href="style1.css">
        </head>

        <body>

        <h1><img id="location-icon" src="/icon/icon.png" alt="location icon"></img>${location}</h1>
        <h2>${time}<span>xx</span> ${currentWeather}<img id="current-icon" src=${iconURL} alt="weather icon"></img></h2>
        <br>
        <h3>TEMP:  ${currentTemperature}℃</h5>
        <br>
        <h3>FEEL:  ${feelsLike}℃</h5>




        <br>
        <br>

        <div class="container">
          <div class="row">
        `;

      for (i = 0; i < 8; i++) {
        html += `<br>
        <div class="col-3 card">
                 <img src=${array[i].Icon} alt="weather icon"></img>
                 <h4>${array[i].Date}</h4>
                 <br>
                 <p>${array[i].Description.toUpperCase()}</p>
                 <p>Day: ${array[i].DailyTemperature}</p>
                 <p>Night: ${array[i].NightTemperature}</p>
                 <p>Humidity: ${array[i].Humidity}</p>
                 <p>UVI: ${array[i].UVI}</p>
                 <br>
        </div>

       `;
      }
      html += `</div>
               </div>
               </body>`;
      res.send(html);


    });

  });
});





app.listen(3000, () => {
  console.log('Port 3000 starts to listen!');
});
