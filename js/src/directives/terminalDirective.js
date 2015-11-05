'use strict';

pipboy.directive('terminal', function(CommandService) {
  return {
    restirct: "E",
    controller: 'terminalCtrl',
    replace: true,
    templateUrl: '/views/terminalTemplate.html',
    compile: function compile() {
      return {
        pre: function preLink() {},
        post: function postLink(scope, element, attrs, controller) {

          var terminalWindow = element;
          var input = angular.element(terminalWindow[0].querySelector('input[type="text"]'))
          var results = angular.element(terminalWindow[0].querySelector('.terminal-results'))

          var commandHistory = [];
          var commandIndex = -1;

          function commandHanlder(command, param) {

            switch (command.toLowerString()) {
              case 'help':
                break;

              case 'clear':
                break;

              case 'ls':
                break;

              case 'cat':
                break;

              case 'cd ..':
                break;

              default:
                console.log('unrecognized input')
            }


          }

          function nextCommand() {
            if (commandIndex === -1) {
              return;
            }

            if (commandIndex < commandHistory.length - 1) {
              scope.commandLine = commandHistory[++commandIndex];
              scope.$apply();
            } else {
              scope.commandLine = '';
              scope.$apply();
            }
          }

          function previousCommand() {
            if (commandIndex === -1) {
              commandIndex = commandHistory.length;
            }
            commandIndex--;

            scope.commandLine = commandHistory[commandIndex];
            scope.$apply();
          }

          function commandParser(commandString) {
            var commandString = commandString.split(" ");

            return {
              command: commandString[0],
              param: commandString[1]
            }
          }


          input.on('keydown', function(e) {

            if (e.keyCode === 13) {

              var commandTyped = document.createElement('pre');
              var commandResult = document.createElement('pre');

              commandTyped.innerHTML = scope.commandLine;
              commandResult.innerHTML = 'root home js';

              results[0].appendChild(commandResult)
              results[0].appendChild(commandTyped)

              var a = commandParser(scope.commandLine);

              console.log(a);

              commandHistory.push(scope.commandLine);

              scope.commandLine = '';

              scope.$apply();
            }

            if (e.keyCode === 38) {
              previousCommand();

            }

            if (e.keyCode === 40) {
              nextCommand();
            }
          });

        }
      }
    }
  }
})
