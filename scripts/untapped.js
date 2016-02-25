// Description
//   Beer me is the most important thing in your life. Hubot will search http://www.brewerydb.com/ for random beers
//
// Configuration:
//   HUBOT_UNTAPPED_CLIENT_ID
//   HUBOT_UNTAPPED_CLIENT_SECRET
//
// Commands:
//   hubot untapped me beer <search> - Searches for a beer
//   hubot untapped me checkins <username> - Checkins for a user
//
// Notes:
//   Api Docs: https://untappd.com/api/docs/v4
//
// Author:
//   leevigraham
//

var clientId, clientSecret, url;

clientId = process.env.HUBOT_UNTAPPED_CLIENT_ID;
clientSecret = process.env.HUBOT_UNTAPPED_CLIENT_SECRET;
url = "https://api.untappd.com/v4";

module.exports = function (robot) {
  robot.respond(/(untapped|ut)( me)? beer (.*)/i, function (msg) {
    var endpoint, query;
    query = msg.match[3];
    if (!query) {
      msg.reply("Can I have a clue what you want to drink? Try 'beer me ale or beer me australia'");
      return;
    }
    endpoint = url + "/search/beer?client_id=" + clientId + "&client_secret=" + clientSecret + "&q=" + query;
    return robot.http(endpoint).get()(function (err, res, body) {
      var beer, beers, brewery, item, msgText, response;
      console.log(endpoint);
      if (err) {
        msg.reply("Im'd drunk :( " + err);
        return;
      }
      response = JSON.parse(body).response || false;
      beers = response.beers;
      if (beers.count == 0) {
        return msg.reply("No beer found matching: " + query);
      }
      item = msg.random(beers.items);
      beer = item.beer;
      brewery = item.brewery;
      msgText = "How about:\n" + beer.beer_name;
      if (beer.beer_abv) {
        msgText += " " + beer.beer_abv + "%";
      }
      if (beer.beer_style) {
        msgText += " (" + beer.beer_style + ")";
      }
      if (beer.beer_description) {
        msgText += "\n\n" + beer.beer_description + "\n";
      }
      if (brewery) {
        msgText += "\n" + brewery.brewery_name;
        if (brewery.contact && brewery.contact.url) {
          msgText += " - " + brewery.contact.url;
        }
      }
      msg.reply(msgText);
      if (beer.beer_label && beer.beer_label != "https://untappd.s3.amazonaws.com/site/assets/images/temp/badge-beer-default.png") {
        msg.send(beer.beer_label);
      }
    });
  });
  return robot.respond(/(untapped|ut)( me)? checkins (.*)/i, function (msg) {
    var endpoint, query;
    query = msg.match[3];
    if (!query) {
      msg.reply("Can I have a clue whose feed you want to see? Try 'untapped me checkins leevigraham'");
      return;
    }
    endpoint = url + "/user/checkins/" + query + "?client_id=" + clientId + "&client_secret=" + clientSecret + "&limit=5";
    return robot.http(endpoint).get()(function (err, res, body) {
      var beer, brewery, checkins, item, msgText, rating_score, response, ratings = [];
      console.log(endpoint);
      if (err) {
        msg.reply("Im'd drunk :( " + err);
        return;
      }
      response = JSON.parse(body).response || false;
      checkins = response.checkins;
      if (checkins.count == 0) {
        return msg.reply("No checkins for: " + query);
      }

      for (i = 0; i < checkins.items.length; i++) {
        item = checkins.items[i];

        rating_score = item.rating_score;
        beer = item.beer;
        brewery = item.brewery;

        msgText = "* " + rating_score + "/5";
        msgText += " - " + beer.beer_name;

        if (beer.beer_abv) {
          msgText += " " + beer.beer_abv + "%";
        }
        if (beer.beer_style) {
          msgText += " (" + beer.beer_style + ")";
        }

        if (brewery) {
          msgText += " " + brewery.brewery_name;
          if (brewery.contact && brewery.contact.url) {
            msgText += " - " + brewery.contact.url;
          }
        }

        ratings.push(msgText);
      }

      msg.send(ratings.join("\n"));
    });
  });
};
