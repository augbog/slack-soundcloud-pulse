/**
 * Soundcloud Pulse Slackbot which will fetch for a Soundcloud user based on their UserID
 * and their tracks and post the latest stats.
 *
 * @author Augustus Yuan
 */

import { IncomingWebhook } from '@slack/client';
import parallel from 'async/parallel';
import request from 'request';
import moment from 'moment';
import config from './config.json';

const webhook = new IncomingWebhook(config.SLACK_WEBHOOK_URL);
const TRACKS_API_ENDPOINT = `https://api-v2.soundcloud.com/users/${config.SOUNDCLOUD_USER_ID}/tracks`;
const USERS_API_ENDPOINT = `https://api.soundcloud.com/users/${config.SOUNDCLOUD_USER_ID}/`;
const API_ENDPOINT_OPTIONS = `client_id=${config.CLIENT_ID}&app_version=${config.APP_VERSION}`;

const REQUEST_OPTIONS = {
  method: 'GET',
  headers: {
    'User-Agent':   'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

const TRACKS_REQUEST_OPTIONS = {
  url: `${TRACKS_API_ENDPOINT}?${API_ENDPOINT_OPTIONS}`,
  ...REQUEST_OPTIONS
};

const USER_REQUEST_OPTIONS = {
  url: `${USERS_API_ENDPOINT}?${API_ENDPOINT_OPTIONS}`,
  ...REQUEST_OPTIONS
};

function updateTotals(track, totals) {
  let newTotals = totals;
  let { top_played } = newTotals;
  for (var key in totals) {
    newTotals[key] = totals[key] + track[key];
  };

  let hasTrackInTopPlayed = false;
  for (var i=0; i < top_played.length; i++) {
    if (track.title == top_played[i].title) {
      hasTrackInTopPlayed = true;
      break;
    }
  }

  if (top_played.length === 3) {
    for (var i=0; i < top_played.length; i++) {
      if (top_played[i].playback_count <= track.playback_count
        && !hasTrackInTopPlayed) {
        top_played.splice(i, 1);
        top_played.push({
          title: track.title,
          permalink_url: track.permalink_url,
          playback_count: track.playback_count
        });
        break;
      }
    }
  } else if (!hasTrackInTopPlayed) {
    top_played.push({
      title: track.title,
      permalink_url: track.permalink_url,
      playback_count: track.playback_count
    });
  }
  newTotals.top_played = top_played;
  return newTotals;
}

function updateTotalsFromTracks(tracks, currentTotals) {
  for (var i=0; i<tracks.length; i++) {
    currentTotals = updateTotals(tracks[i], currentTotals);
  }
  return currentTotals;
};

function generateMessage(user, totalTracksInfo) {
  const { top_played,
    likes_count,
    playback_count,
    reposts_count,
    comment_count } = totalTracksInfo;

  const {
    avatar_url,
    username,
    website,
    permalink_url,
    followers_count,
    track_count } = user;

  const sortedTopPlayed = top_played.sort((a, b) => {
    return a.playback_count < b.playback_count;
  });

  let top_played_Message = ``;
  for (var i=0; i<sortedTopPlayed.length; i++) {
    top_played_Message += `${i+1}. ${sortedTopPlayed[i].title} (${sortedTopPlayed[i].playback_count})\n`;
  }

  const messageObject = {
    "attachments": [
      {
        "fallback": `Your Soundcloud Weekly Pulse as of ${moment().format("MMMM D YYYY")}`,
        "color": "#E8E8E8",
        "pretext": `Your Soundcloud Weekly Pulse as of ${moment().format("MMMM D YYYY")}`,
        "author_name": `${username}`,
        "author_link": `${website}`,
        "author_icon": `${avatar_url}`,
        "title": `${username}`,
        "title_link": `${permalink_url}`,
        "text": `Total stats for the past ${track_count} tracks`,
        "fields": [
          {
            "title": "Total Plays",
            "value": `${playback_count}`,
            "short": true
          },
          {
            "title": "Total Followers",
            "value": `${followers_count}`,
            "short": true
          },
          {
            "title": "Total Likes",
            "value": `${likes_count}`,
            "short": true
          },
          {
            "title": "Total Comments",
            "value": `${comment_count}`,
            "short": true
          },
          {
            "title": "Most Played Tracks",
            "value": `${top_played_Message}`,
            "short": false
          }
        ],
        "footer": "Soundcloud Pulse",
        "footer_icon": "https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2017-03-16/154900858705_abdca51b020162c433c8_96.png",
        "ts": `${moment().unix()}`
      }
    ]
  }
  return messageObject;
}

function sendMessage(user, totalTracksInfo) {
  webhook.send(generateMessage(user, totalTracksInfo), (err, res) => {
    if (err) {
      console.log(`Error sending totals`);
    }
  });
}

// TODO: Look into recursive promises
// https://www.bennadel.com/blog/3201-exploring-recursive-promises-in-javascript.htm
function fetchTrackTotals(requestOptions, totals, cb) {
  if (!requestOptions) {
    console.log('No requestUrl specified so sending message');
    cb(null, totals);
  } else {
    console.log(`Making request to ${requestOptions.url}`);
    request(requestOptions, (err, res, body) => {
      if (err) {
        rej(`Failed to make request for Soundcloud data ${err}`);
      }
      if (body) {
        const responseJSON = JSON.parse(body);
        const { collection } = responseJSON;
        totals = updateTotalsFromTracks(collection, totals);
        if (responseJSON.next_href) {
          let NEXT_REQUEST_OPTIONS = REQUEST_OPTIONS;
          NEXT_REQUEST_OPTIONS.url = `${responseJSON.next_href}&${API_ENDPOINT_OPTIONS}`;
          fetchTrackTotals(NEXT_REQUEST_OPTIONS, totals, cb);
        } else {
          fetchTrackTotals(false, totals, cb);
        }
      }
    });
  }
};

function fetchUserInfo(requestOptions, cb) {
  console.log(`Making request to ${requestOptions.url}`);
  request(requestOptions, (err, res, body) => {
    if (err) {
      reject(`Failed to make request for Soundcloud data ${err}`);
    }
    const user = JSON.parse(body);
    cb(null, user);
  });
}

function execute() {
  const trackTotals = {
    likes_count: 0,
    playback_count: 0,
    reposts_count: 0,
    comment_count: 0,
    top_played: []
  };

  parallel([
    (cb) => {
      fetchUserInfo(USER_REQUEST_OPTIONS, cb);
    },
    (cb) => {
      fetchTrackTotals(TRACKS_REQUEST_OPTIONS, trackTotals, cb);
    }
  ], (err, results) => {
    const user = results[0];
    const totalTracksInfo = results[1];
    sendMessage(user, totalTracksInfo);
  });
}

execute();