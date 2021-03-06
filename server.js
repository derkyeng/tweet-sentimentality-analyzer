const express = require('express');
const app = express()
const fetch = require('node-fetch')
const Sentiment = require('sentiment')
const sentiment = new Sentiment();
const Twit = require('twit')
const path = require('path');
require('dotenv').config();

app.listen(process.env.PORT || 8080, () => console.log(`Listening on 8080`))
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'));
}

app.get('*', (request, response) => {
	response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Routes
app.post('/', (req, res) => {
    console.log(req.body)
    let query = req.body.query
    let tweets = searchTweet(query)
    asignScore(tweets).then(data => res.json(data))
})

// Initializes Twit object to access API functions.
var T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60*1000,
    strictSSL: true,
})

// Requests tweets from Twitter API.
async function searchTweet(searchQuery) {
    const tweets = await T.get('search/tweets', {q: searchQuery + '-filter:retweets', count: 50, lang: 'en', tweet_mode: 'extended'})
    return tweets.data.statuses
}

// Asigns each tweet a score based on the AFINN-en-165 sentiment analysis.
async function asignScore(tweets) {
    let tweetList = await tweets
    for (i = 0; i < tweetList.length; i++){
        var result = sentiment.analyze(tweetList[i].full_text);
        console.log(result)
        tweetList[i].score = result 
    }
    return tweetList
}



