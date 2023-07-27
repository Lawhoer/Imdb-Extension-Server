const axios = require('axios')

// Genel ayarlar
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'

async function getInfoByID(id) {
  try {
    const req = await axios.get(id, {headers: {
      "Accept-Encoding": "gzip,deflate,compress"
    }
    });
    // Bütün sitenin verilerini alıyoz
    const data = req.data
    
    // Bunu imdb sitesine ozel bir scripte ayıklıyoruz ve json'a ceviriyoruz parse'liyip(yani sadece o bilgilerin oldugu scripti secip alıyoruz bütün bilgilerden)
    let json = data.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]
    json = JSON.parse(json);

    // Verileri kendi degiskenlerine atıyoruz sonrasında bunları movie'nin icine atıp geri yolluyoruz movie'i
    const [title, rating, poster, description, releaseDate, writers, director, actors] = await Promise.all([
      json.name,
      json.aggregateRating.ratingValue,
      json.image,
      json.description,
      json.datePublished,
      json.creator,
      json.director,
      json.actor
    ]);
    
    const movie = {
       title,
       rating,
       poster,
       description,
       releaseDate,
       director,
       writers,
       actors
    }
    return movie
  } catch (err) {
    return Error(err)
  }
}

module.exports = {
  getInfoByID,
};