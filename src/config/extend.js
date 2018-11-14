const view = require('think-view');
const model = require('think-model');
const fetch = require('think-fetch');
const email = require('think-email');
const cache = require('think-cache');
const session = require('think-session');
const websocket = require('think-websocket');

module.exports = [
  view, // make application support view
  model(think.app),
  fetch, // HTTP request client.
  websocket(think.app),
  email,
  cache,
  session
];
