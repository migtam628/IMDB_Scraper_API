var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/scrape', function(req, res) {
    var id = req.query.id
    var title = req.query.title
    var url = `https://www.imdb.com/title/${id}`;
    // url1 = `https://www.imdb.com/find?ref_=nv_sr_fn&q=${encodeURI(title)}&s=all`;
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            var json = {
                title: "",
                release_date: "",
                rating: "",
                runtime: "",
                keywords: "",
                country: "",
                language: "",
                cast: [],
                plot: "",
                storyline: "",
                filming_locations: "",
                poster: "",
                backdrop: ""
            };

            $('.title_wrapper').filter(function() {
                var data = $(this);
                title = data.children().first().text().trim();
                release = data.children().last().children().last().text().trim();
                json.title = title;
                json.release_date = release;
            })

            $('.ratingValue').filter(function() {
                var data = $(this);
                rating = data.text().trim();
                json.rating = rating;
            })

            $('time').filter(function() {
                var data = $(this);
                runtime = data.text().trim();
                json.runtime = runtime;
            })

            $('.slate').filter(function() {
                var data = $(this);
                backdrop = data.children().first().children().first().attr('src')
                json.backdrop = backdrop;
            })

            $('.poster').filter(function() {
                var data = $(this);
                poster = data.children().first().children().first().attr('src')
                json.poster = poster;
            })

            $('.summary_text').filter(function() {
                var data = $(this);
                plot = data.text().trim();
                json.plot = plot;
            })

            $('.cast_list').filter(function() {
                var data = $(this);
                cast = data.children().first().text().trim();
                newCast = cast.replace(/[\n]+/g, "").trim()
                newCast1 = newCast.replace('Cast overview, first billed only: ', "").trim()
                json.cast = newCast1.replace(/['                                ...                              ']+/g, " ").trim();
            })

            $('.article#titleStoryLine').filter(() => {
                var data = $(this);
                storyline = $('.inline.canwrap').children('p').children('span').text().trim()
                keywords = $('.see-more.inline.canwrap').children('a').text()
                json.storyline = storyline.trim()
                json.keywords = keywords.trim().replace(/[" "]+/g, ", ")
            })

            $('.article#titleDetails').filter(() => {
                var data = $(this);
                lo = $('div.txt-block').eq(8).text();
                loc = lo.replace(/[\n]+/g, "");
                loca = loc.replace('Filming Locations:', "");
                locat = loca.replace("»", "");
                json.filming_locations = locat.replace("See more", "").trim();

                l = $('div.txt-block').eq(5).text();
                la = l.replace(/[\n]+/g, "");
                lan = la.replace('Language:', "");
                lang = lan.replace(/['            |        ']+/g, ", ").trim();
                langu = lang.replace('|', "")
                json.language = langu.substring(0, langu.length - 1).trim();

                c = $('div.txt-block').eq(4).text();
                co = c.replace(/[\n]+/g, "");
                cou = co.replace('Country:', "");
                coun = cou.replace("»", "");
                json.country = coun.replace("See more", "").trim();

            })

        }

        fs.writeFile(`${id}.json`, JSON.stringify(json, null, 4), function(err) {
            // fs.writeFile(`/Users/migtamrod/Desktop/${id}.json`, JSON.stringify(json, null, 4), function(err) {
            if (!err) {
                console.log(`File successfully written! - Check your project directory for the ${id}.json file`);
            } else {
                console.log({ err })
            }
        })

        res.json(JSON.parse(JSON.stringify(json)))
    })
})

app.listen('8081')
console.log('http://localhost:8081');
exports = module.exports = app;