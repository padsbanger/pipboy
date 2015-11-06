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

          scope.prompt = '[~]$'
          scope.currentDirName = '/home'
          scope.currentDirIndex = 0

          var terminalWindow = element;
          var input = angular.element(terminalWindow[0].querySelector('input[type="text"]'))
          var results = angular.element(terminalWindow[0].querySelector('.terminal-results'))
          var line = '';

          var commandHistory = [];
          var commandIndex = -1;
          var currentDirList = {};

          CommandService.sendCommand('ls', scope.currentDirIndex).then(function(data) {
            currentDirList = data.data.items
            start();
          });

          function commandHanlder(command, param) {

            switch (command) {
              case 'help':
                handleHelp();
                break;

              case 'clear':
                handleClear();
                break;

              case 'ls':
                handleList(param);
                break;

              case 'cat':
                handleCat(param);
                break;

              case 'lol':
                handleLol();
                break;

              case 'cd':
                handleCd(param);
                break;

              case 'pwd':
                handlePwd();
                break;

              case 'exit':
                handleExit();
                break;

              default:
                handleDefault();
            }
          }

          function start() {
            line = 'Welcome to your very own Pip-Boy 3000 ! <br/>Type `help` to see avaiable commands.  <br/>Use arrow keys to toggle between already inputed commands.';

            drawLine(line)
          }

          function handleAutoComplete(query) {
            CommandService.sendAutoComplete(scope.currentDirIndex, query).then(function(data) {
              var data = data.data.items;
              var autocomplete = '';
              if (Object.keys(data).length) {
                for (var prop in data) {
                  // I want only first result, because.... give me a break;
                  autocomplete = data[prop].name
                  break;
                }
                scope.commandLine = commandParser(scope.commandLine).command + ' ' + autocomplete
              }

            })
            scope.$apply();
          }

          function drawLine(text, file) {
            line = '';
            var element = {}
            if (text) {
              if (!file) {
                element = document.createElement('pre');
                element.className = 'css-typing';
              } else {
                element = document.createElement('div');
              }
              element.innerHTML = text;
              results[0].appendChild(element)
            }

            var terminal = document.querySelector('.terminal-main');
            terminal.scrollTop = terminal.scrollHeight;

          }


          function handleDefault() {
            line = 'Unrecognized input. Type `help` to see all commands.';
            drawLine(line);
          }

          function handleHelp() {
            line = 'help clear ls cat cd pwd exit';
            drawLine(line)
          }

          function handleExit() {
            // try to unit tests this, lol
            if (confirm('You sure ? ( ͡° ͜ʖ ͡°)')) {
              window.close();
            }
          }

          function handleLol() {
            line = '( ͡° ͜ʖ ͡°)';
            drawLine(line);
          }

          function handlePwd() {
            line = 'Currently in: ' + scope.currentDirName;
            drawLine(line)
          }

          function handleCat(param) {
            for (var prop in currentDirList) {
              if (param === currentDirList[prop].name && currentDirList[prop].type === 'file') {
                CommandService.sendCommand('cat', prop).then(function(data) {
                  drawLine(data.data.content, true)
                });
              }
            }
          }

          // so angular-way :/
          function handleClear() {
            results[0].innerHTML = '';
          }

          function handleList(param) {

            if (!param) {
              for (var prop in currentDirList) {
                line += currentDirList[prop].name + ' ';
              }
              drawLine(line);
            } else {
              for (var prop in currentDirList) {
                if (param === currentDirList[prop].name) {
                  CommandService.sendCommand('ls', prop).then(function(data) {
                    var data = data.data.items;
                    for (var prop in data) {
                      line += data[prop].name + ' ';
                    }
                    drawLine(line)
                  }, function errorCallback(data) {
                    drawLine(data.data)
                  });
                }
              }
            }

          }


          function handleCd(param) {
            if (param) {
              for (var prop in currentDirList) {
                if (param === currentDirList[prop].name && currentDirList[prop].type === 'folder') {
                  scope.currentDirName += '/' + param;
                  scope.currentDirIndex = prop
                  scope.$apply();

                  CommandService.sendCommand('ls', prop).then(function(data) {
                    currentDirList = data.data.items
                  })
                }
              }
            }
            if (!param || param === '..') {
              scope.currentDirName = '/home'
              scope.currentDirIndex = 0
              scope.$apply();
              CommandService.sendCommand('ls', scope.currentDirIndex).then(function(data) {
                currentDirList = data.data.items
              });
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

              var commandObj = commandParser(scope.commandLine)

              var fullCommandToPrint = scope.prompt + ' ' + scope.currentDirName + ' ' + scope.commandLine

              drawLine(fullCommandToPrint)
              commandHanlder(commandObj.command, commandObj.param)
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

            if (e.keyCode === 9) {
              e.preventDefault();

              var query = commandParser(scope.commandLine).param
              if (query) {
                handleAutoComplete(query)
              }
            }
          });

        }
      }
    }
  }
})
