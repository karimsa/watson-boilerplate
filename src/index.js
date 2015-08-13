'use strict';

import utils from './utils';
import Microphone from './microphone';
import { initSocket } from './socket';

// declare the app to angular
var app = angular.module('WatsonApp', []);

// create a new microphone instance
var microphone = new Microphone({
  bufferSize: 8192
});

// create a token generator for api usage
var tokenGenerator = utils.createTokenGenerator();

// main controller
app.controller('WatsonController', ['$scope', function ($scope) {
  $scope.history = [];
  $scope.model = 'en-US_BroadbandModel';

  // execute & save command
  $scope.result = function (command) {
    $scope.history.push(command);
    $scope.$apply();
  };

  // begin by initiating socket loop
  tokenGenerator.getToken(function(token, err) {
    if (err) {
      console.error(err);
      return false;
    }

    initSocket({
      'model': 'en-US_BroadbandModel',
      'token': token,
      'message': {
        'action': 'start',
        'content-type': 'audio/l16;rate=16000',
        'interim_results': true,
        'continuous': true,
        'word_confidence': true,
        'timestamps': true,
        'max_alternatives': 3
      }
    }, microphone.record.bind(microphone), function (socket) {
      microphone.onAudio = function(blob) {
        if (socket.readyState < 2) {
          socket.send(blob);
        }
      };
    }, function (msg) {
      if (msg.results && msg.results.length > 0 && msg.results[0] && msg.results[0].final) {
        $scope.result(msg.results[0].alternatives[0].transcript.trim() || '');
      }
    }, function (error) {
      console.error(error);
    });
  });
}]);
