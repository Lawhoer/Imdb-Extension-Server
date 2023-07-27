const puppeteer = require('puppeteer');
const imdbScraper = require('./imdb-scraper.js')

// Sanal browserimizi calistirip,yeni bir sayfa aciyoruz ve genel ayarlari yapiyoruz
async function Start(){
  global.browser = await puppeteer.launch({
    headless:  'new',
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  global.page = await browser.newPage();
}

// Var olan sayfayi kapatip yenisini aciyoruz ki eski sayfa verisiyle cakismasin
async function RestartPage(){
  page.close();
  page = await browser.newPage();
// Nedense sürekli 2 tane sayfa acik 
}

// On bellek bilgileri
const MAX_CACHE_SIZE = 3; 
const cache = [];

// On bellegi sabit son 3 veride tutuyoruz ki fazla yer kaplamasin
async function CacheRefresh(){
  if (cache.length > MAX_CACHE_SIZE) {
    // En eski JSON dosyalarini kaldirma
    const numToRemove = cache.length - MAX_CACHE_SIZE;
    cache.splice(0, numToRemove);
  }
  return cache;
}

// Bütün scraper islemleri
  async function main(movieTitle) {
    
    // Filmin adini girdi alip onu getMovieİd() fonsiyonuna yolluyoruz o bize filmin imdb google linkini veriyor
    movieTitle = movieTitle + " imdb";
    var movieLink = await getMovieId(movieTitle);

    // Filmin linkini veriyoruz bize json dosyasini yolluyor
    return info = await getInfoAboutMovie(movieLink);

    // Title veriyon link dönüyo
    async function getMovieId (movieTitle) {
    
      // Sayfanin ayarlanabilir olmasini aciyoruz ve arama yaparken gereksiz islemleri engelliyoruz(islemi hizlandiriyor)
      await page.setRequestInterception(true);
    
      page.on('request', (request) => {
        if (request.resourceType() === 'image' 
        || request.resourceType() === 'stylesheet' 
        || request.resourceType() === 'script'
        || request.resourceType() === 'video'
        || request.resourceType() === 'manifest'
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });
      
      // Google aramasi yapip linki buluyor
      await page.goto(`https://www.google.com/search?q=${movieTitle}`);
      
      const Handles = await page.$('.yuRUbf');
      const anchorElement = await Handles.$('a');
      const title = await page.evaluate(el => el.href,anchorElement);
    
      
      return title;
    };

    // link veriyon json bilgilerini dönüyo
    async function getInfoAboutMovie(movieLink) {
      var info = await imdbScraper.getInfoByID(movieLink);
      // On bellege veriyi kaydediyoruz
      cache.push(info);
      return info;
    }
  }

  
// Fonksiyonlarin modul paylasimi
module.exports = {
    main,
    Start,
    RestartPage,
    CacheRefresh,
  };