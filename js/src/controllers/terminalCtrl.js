'use strict';

pipboy.controller('terminalCtrl', ['$scope', 'CommandService', function($scope, CommandService ) {


  $scope.commandToType = '';
  $scope.commands = '';

  CommandService.sendCommand('ls', '0').then(function(data){
    // angular.copy(data.data.items, $scope.commands)
    $scope.commands = data.data.items
  })


  function splitCommand(commandString) {
    var command = commandString.split(" ")

    return command;
  }

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


    CommandService.sendCommand(command, target).then(function(data){
      // angular.copy(data.data.items, $scope.commands)
      $scope.commands = data.data.items
    })


  }
}]);