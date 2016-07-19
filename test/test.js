const mqtt    = require('mqtt');
const winston = require('winston');
const spawn   = require('child_process').spawn;
const client  = mqtt.connect('mqtt://localhost');
const config  = require('config.json')('./src/config.json');

const mqttConfig = { qos: 1 };

launchService()
.then(publishToPlayer);

function launchService() {
  return new Promise((fullfil) => {
    const service = (() => {
      if (process.env.INTEGRATION_TESTING) {
        winston.info('Connecting to service journal...');
        return spawn('journalctl', ['-fu', 'mqtt-play']);
      } else {
        winston.info('Launching player service...');
        return spawn('npm', ['start']);
      }
    })();

    service.stdout.on('data', (data) => {
      winston.info(`MQTT-Play log: ${data}`);
      if (data.indexOf(config.topic.sub) > -1) {
        fullfil();
      }
      if (data.indexOf('Finished playing') > -1) {
        winston.info('Test succeed');
        process.exit();
      }
    });

    service.stderr.on('data', (data) => {
      winston.info(`MQTT-Play log: ${data}`);
    });

    service.on('close', (code) => {
      winston.info(`Process exited with code ${code}`);
    });
  });
}

function publishToPlayer() {
  winston.info(`Publishing message to topic ${config.topic.sub}`);
  const message = `${__dirname}/audio/test.mp3`;
  client.publish(config.topic.sub, message, mqttConfig);
  setTimeout(() => {
    winston.error(new Error('Test failed (Waiting timeout)'));
    process.exit(1);
  }, 10000);
}
