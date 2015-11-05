'use strict';

pipboy.controller('terminalCtrl', ['$scope', 'CommandService', function($scope, CommandService ) {


  $scope.commandToType = '';
  $scope.commands = '';


  $scope.execute = function(commandToType) {

    var command = splitCommand(commandToType)[0]
    var target = splitCommand(commandToType)[1]

    console.log(target, command)

    for(var prop in $scope.commands) {
      if(target === $scope.commands[prop].name ) {

        target = prop;
        console.log('eureka')
      }
      console.log($scope.commands[prop])
    }

  }
}]);