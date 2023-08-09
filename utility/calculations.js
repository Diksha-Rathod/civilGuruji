const http = require('http');
const https = require('https');
const url = require('url');

const getVideoDuration = (videoUrl) => {
  return new Promise((resolve, reject) => {
    const options = url.parse(videoUrl);
    options.method = 'HEAD';

    const protocol = options.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed with status code ${res.statusCode}`));
        return;
      }

      const contentLength = res.headers['content-length'];
      const bitrate = 500000; // Set the bitrate of the video in bits per second (500kbps in this example)

      const duration = parseInt(contentLength, 10) / bitrate;
      resolve(duration);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

module.exports = {
    getVideoDuration
}