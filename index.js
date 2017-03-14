require('dotenv').config();
var Disqus = require('disqus-node'),
  moment = require('moment'),
  request = require('request'),
  striptags = require('striptags');

var disqus = new Disqus({
  api_secret: process.env.DISQUS_SECRET,
  access_token: process.env.DISQUS_TOKEN
});

disqus.forums.listThreads({
  forum: 'channel-theatlanticdiscussions'
}, function(err, response){
  if( err ) throw err;
  var entries = response.response.filter( d => d.message.indexOf('theatlantic.com') != -1 && moment.utc(d.createdAt).isAfter(moment.utc().subtract(10, 'minutes')) )

  entries.forEach(function(entry){
    var payload = `New post: *<${entry.link}|${entry.clean_title}>*\n>${striptags(entry.message)}`
    request.post({
      url: process.env.SLACK_WEBHOOK_URL,
      json: true,
      body: {text: payload}
    }, function(err){
      if( err ) throw err;
      console.log('Posted!')
    })
  })
})
