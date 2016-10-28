const mqtt      = require('mqtt');
const winston   = require('winston');
const playerCon = require('./module/player.js');
const consts    = require('./support/constants');

const client = mqtt.connect(consts.mqttHost);

const player = playerCon(consts.playCommand);
winston.info(`Player command: ${consts.playCommand}`);
client.on('connect', () => {
  client.subscribe(consts.playTopic);
  winston.info(`Subscribed topic: ${consts.playTopic}`);
});

client.on('message', (topic, message) => {
  winston.info(`Message received: ${message.toString()}`);
  try {
    player.addAudio(message.toString());
  } catch (e) {
    winston.error(e);
  }
});
