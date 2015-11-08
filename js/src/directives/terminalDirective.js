'use strict';

pipboy.directive('terminal', function(CommandService) {
  return {
    restirct: "E",
    controller: 'terminalCtrl',
    replace: true,
    templateUrl: 'views/terminalTemplate.html',
    compile: function compile() {
      return {
        pre: function preLink() {},
        post: function postLink(scope, element, attrs, controller) {

          scope.prompt = '[~]$';
          scope.currentDirName = '/home';
          scope.currentDirIndex = 0;
          scope.commandLine = '';

          var terminalWindow = element;
          var terminal = document.querySelector('.terminal-main');
          var input = angular.element(terminalWindow[0].querySelector('input[type="text"]'));
          var results = angular.element(terminalWindow[0].querySelector('.terminal-results'));
          var line = '';

          scope.commandHistory = [];
          scope.commandIndex = -1;
          scope.currentDirList = {};

          start();

          function commandHanlder(command, param) {

            switch (command) {
              case 'help':
                scope.handleHelp();
                break;

              case 'clear':
                scope.handleClear();
                break;

              case 'ls':
                scope.handleList(param);
                break;

              case 'cat':
                scope.handleCat(param);
                break;

              case 'lol':
                scope.handleLol();
                break;

              case 'cd':
                scope.handleCd(param);
                break;

              case 'pwd':
                scope.handlePwd();
                break;

              case 'exit':
                scope.handleExit();
                break;

              default:
                scope.handleDefault();
            }
          }

          function start() {
            CommandService.sendCommand('ls', scope.currentDirIndex).then(function(data) {
              scope.currentDirList = data.data.items;
              line = 'Welcome to your very own Pip-Boy 3000 ! <br/>Type `help` to see avaiable commands.  <br/>Use arrow keys to toggle between already inputed commands.';

              drawLine(line);
            });

          }

          scope.handleAutoComplete = function(query) {
            CommandService.sendAutoComplete(scope.currentDirIndex, query).then(function(data) {
              var data = data.data.items;
              var autocomplete = '';
              if (Object.keys(data).length) {
                for (var prop in data) {
                  if (data.hasOwnProperty(prop)) {
                    // I want only first result, since server never returns more, even if i ask nicely
                    autocomplete = data[prop].name;
                  }
                  break;
                }

                scope.commandLine = commandParser(scope.commandLine).command + ' ' + autocomplete;
              }

            })
          }

          function drawLine(text, file) {
            line = '';
            var element = {};
            if (text) {
              element = document.createElement('pre');
              if (!file) {
                element.className = 'css-typing';
              } else {}
              element.innerHTML = text;
              results[0].appendChild(element);
            }

            terminalWindow[0].scrollTop = terminalWindow[0].scrollHeight;
          }


          scope.handleDefault = function() {
            line = 'Unrecognized input. Type `help` to see all commands.';
            drawLine(line);
          }

          scope.handleHelp = function() {
            line = 'help clear ls cat cd pwd exit';
            drawLine(line);
          }

          scope.handleExit = function() {
            // try to unit tests this, lol
            if (confirm('You sure ? ( ͡° ͜ʖ ͡°)')) {
              window.close();
            }
          }

          scope.handleLol = function() {
            line = '( ͡° ͜ʖ ͡°)';
            drawLine(line);
          }

          scope.handlePwd = function() {
            line = 'Currently in: ' + scope.currentDirName;
            drawLine(line);
          }

          scope.handleCat = function(param) {
            for (var prop in scope.currentDirList) {
              if (scope.currentDirList.hasOwnProperty(prop)) {
                if (param === scope.currentDirList[prop].name && scope.currentDirList[prop].type === 'file') {
                  CommandService.sendCommand('cat', prop).then(function(data) {
                    drawLine(data.data.content, true);
                  });
                }
              }
            }
          }

          // so angular-way :/
          scope.handleClear = function() {
            results[0].innerHTML = '';
          }

          scope.handleList = function(param) {
            if (!param) {
              for (var prop in scope.currentDirList) {
                if (scope.currentDirList.hasOwnProperty(prop)) {
                  line += scope.currentDirList[prop].name + ' ';
                }
              }
              drawLine(line);
            } else {
              for (var prop in scope.currentDirList) {
                if (param === scope.currentDirList[prop].name && scope.currentDirList.hasOwnProperty(prop) && scope.currentDirList[prop].type === 'folder') {
                  CommandService.sendCommand('ls', prop).then(function(data) {
                    var data = data.data.items;
                    for (var prop in data) {
                      line += data[prop].name + ' ';
                    }
                    drawLine(line)
                  }, function errorCallback(data) {
                    drawLine(data.data);
                  });
                }
              }
            }

          }


          scope.handleCd = function(param) {
            if (param) {
              for (var prop in scope.currentDirList) {
                if (param === scope.currentDirList[prop].name && scope.currentDirList[prop].type === 'folder' && scope.currentDirList.hasOwnProperty(prop)) {
                  scope.currentDirName += '/' + param;
                  scope.currentDirIndex = prop;

                  CommandService.sendCommand('ls', prop).then(function(data) {
                    scope.currentDirList = data.data.items;
                  })
                  break;
                }
              }
            }
            if (!param || param === '..') {
              scope.currentDirName = '/home';
              scope.currentDirIndex = 0;

              CommandService.sendCommand('ls', scope.currentDirIndex).then(function(data) {
                scope.currentDirList = data.data.items;
              });
            }

          }

          scope.nextCommand = function() {
            if (scope.commandIndex === -1) {
              return;
            }

            if (scope.commandIndex < scope.commandHistory.length - 1) {
              scope.commandLine = scope.commandHistory[++scope.commandIndex];
            } else {
              scope.commandLine = '';
            }
          }

          scope.previousCommand = function() {
            if (scope.commandIndex === -1) {
              scope.commandIndex = scope.commandHistory.length;
            }
            scope.commandIndex--;

            scope.commandLine = scope.commandHistory[scope.commandIndex];
          }

          function commandParser(commandString) {
            var commandString = commandString.split(" ");

            return {
              command: commandString[0],
              param: commandString[1]
            }
          }

          scope.inputActions = function($event) {

            if ($event.keyCode === 38) {
              scope.previousCommand();
            }

            if ($event.keyCode === 40) {
              scope.nextCommand();
            }

            if ($event.keyCode === 9) {
              $event.preventDefault();

              var query = commandParser(scope.commandLine).param
              if (query) {
                scope.handleAutoComplete(query);
              }
            }

          }


          scope.execute = function() {
            var commandObj = commandParser(scope.commandLine);

            var fullCommandToPrint = scope.prompt + ' ' + scope.currentDirName + ' ' + scope.commandLine;

            drawLine(fullCommandToPrint);
            commandHanlder(commandObj.command, commandObj.param);
            scope.commandHistory.push(scope.commandLine);

            scope.commandLine = '';
          }
        }
      }
    }
  }
})
