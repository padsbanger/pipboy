'use strict';

pipboy.factory('CommandService', [ '$http',
  function($http) {

    var api = 'http://localhost:8080/api/'

    return {
      sendCommand: function(command, param) {
        return $http({
          method: 'GET',
          url: api+command + '/'+param
        })
      }
    };
  }
]);