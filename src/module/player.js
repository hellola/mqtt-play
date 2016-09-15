const fs       = require('fs');
const winston  = require('winston');
const execFile = require('child_process').execFile;

const playlist = [];
let isPlaying  = false;

function Player(playCommand) {
  this.addAudio = (path) => {
    fs.lstatSync(path);
    playlist.push(path);
    if (!isPlaying) {
      play(playCommand, playlist.shift());
    }
    winston.info(`${path} has been added to audio list.`);
  };
}

function play(playCommand, path) {
  isPlaying = true;
  winston.info('Playing audio. Current list:');
  winston.info(playlist);
  execFile(playCommand, [path], (error, stdout, stderr) => {
    if (error) {
      winston.error(stderr, error);
    } else if (playlist.length > 0) {
      play(playCommand, playlist.shift());
    } else {
      isPlaying = false;
      winston.info('Finished playing');
    }
  });
}

module.exports = (playCommand) => new Player(playCommand);
