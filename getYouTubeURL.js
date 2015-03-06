// Generated by CoffeeScript 1.7.1
(function() {
  var clog, decodeQueryString, decodeStreamMap, get, getUrlFromId, getYoutubeInfo, qs, req;

  req = require('request');

  qs = require('querystring');

  clog = function(s) {
    return console.log(s);
  };

  getUrlFromId = function(videoId, callback) {
    return getYoutubeInfo(videoId, function(videoInfo) {
      var exact, lowest, quality, source, type, video, _i, _len, _ref;
      video = decodeQueryString(videoInfo);
      if (!video || video.status === "fail" || !video.url_encoded_fmt_stream_map) {
        clog("FAILED TO GET VIDEO URL !");
        callback(null);
        return;
      }
      video.sources = decodeStreamMap(video.url_encoded_fmt_stream_map);
      lowest = null;
      exact = null;
      quality = "medium";
      type = "mp4";
      _ref = video.sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        source = _ref[_i];
        if (source.type.match(type)) {
          if (source.quality.match(quality)) {
            exact = source;
          } else {
            lowest = source;
          }
        }
      }
      videoInfo = null;
      if (exact) {
        videoInfo = exact;
      } else if (lowest) {
        videoInfo = lowest;
      } else {
        callback(null);
        return;
      }
      callback(videoInfo.url);
    });
  };

  getYoutubeInfo = function(video_id, callback) {
    var options, params;
    params = {
      video_id: video_id
    };
    options = {
      url: "http://www.youtube.com/get_video_info?" + qs.stringify(params),
      json: true
    };
    return get(options, callback);
  };

  get = function(options, callback) {
    return req.get(options, function(error, response, body) {
      if (error) {
        return console.error("error: " + response.statusCode);
      } else if (response.statusCode === 200) {
        return callback(body);
      }
    });
  };

  decodeQueryString = function(queryString) {
    var key, keyValPair, keyValPairs, r, val, _i, _len;
    r = {};
    keyValPairs = queryString.split("&");
    for (_i = 0, _len = keyValPairs.length; _i < _len; _i++) {
      keyValPair = keyValPairs[_i];
      key = decodeURIComponent(keyValPair.split("=")[0]);
      val = decodeURIComponent(keyValPair.split("=")[1] || "");
      r[key] = val;
    }
    return r;
  };

  decodeStreamMap = function(url_encoded_fmt_stream_map) {
    var quality, sources, stream, type, urlEncodedStream, _i, _len, _ref, _results;
    sources = {};
    _ref = url_encoded_fmt_stream_map.split(",");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      urlEncodedStream = _ref[_i];
      stream = decodeQueryString(urlEncodedStream);
      type = stream.type.split(";")[0];
      quality = stream.quality.split(",")[0];
      stream.original_url = stream.url;
      stream.url = "" + stream.url + "&signature=" + stream.sig;
      _results.push(sources["" + type + " " + quality] = stream);
    }
    return _results;
  };

  module.exports = {
    getUrlFromId: getUrlFromId
  };

}).call(this);