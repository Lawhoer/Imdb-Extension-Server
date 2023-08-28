const express = require("express");
const scraper = require("./scraper.js");
require('dotenv').config();

// Express ile sunucumuzu kuruyoruz
const server = express();
// Scraper.js dosyasindan Start() fonksiyonunu calistiriyoruz
scraper.Start();

// Genel sunucu ayarlari izinler vs bla bla
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "chrome-extension://" + process.env.IMDB_CHROME_EXTENSIN_ID);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Json array seklindeki on bellegimiz
var cache;

// Bu adrese gelen istekte on bellegi geri yolluyoruz
server.get("/cache", async (req, res) =>{
  res.status(200).json(cache);
});

// Burasi normal film adlarinin geldigi istek yeri
server.get("/cache/:id", async (req, res) => {
  // :id degerini aliyoruz
  const { id } = req.params;
  // Scraper.js dosyasindan main fonksiyonuna filmin adini yolluyoruz o da bize json bilgilerini veriyor sonraisnda response gonderiyoruz
  const info = await scraper.main(`${id}`);
  res.status(200).json(info);

  // Scraper.js dosyasindaki RestartPade() fonksiyonunu ile browserdaki sayfayi kapatip yeniden aciyoruz
  scraper.RestartPage();
  // Ayni dosyadan CacheRefresh() ile on bellegin sayisini son 3 girdi ile sabit tutuyoruz ki yer kaplamasin
  cache = await scraper.CacheRefresh();
});

// Serveri 3000 portunda tutuyoruz
server.listen(3000, ()=>{
    console.log("Listening on port 3000")
});