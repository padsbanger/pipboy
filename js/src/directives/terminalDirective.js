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
          scope.currentDirName = '~/home'
          scope.currentDirIndex = 0


          var terminalWindow = element;
          var input = angular.element(terminalWindow[0].querySelector('input[type="text"]'))
          var results = angular.element(terminalWindow[0].querySelector('.terminal-results'))

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

              default:
                handleDefault();
            }
          }

          function start() {
            var element = document.createElement('pre')
            element.innerHTML = 'Welcome to your very own Pip-Boy 3000 ! <br/>Type `help` to see avaiable commands.  <br/>Use arrow keys to toggle between already inputed commands.';
            // console.log(element)
            element.className = 'css-typing';
            results[0].appendChild(element)

          }

          function handleDefault() {
            var element = document.createElement('pre')
            element.innerHTML = 'Unrecognized input. Type `help` to see all commands.';
            element.className = 'css-typing';
            results[0].appendChild(element)
          }

          function handleHelp() {
            var element = document.createElement('pre')
            element.innerHTML = 'help clear ls cat cd';
            element.className = 'css-typing';
            results[0].appendChild(element)
          }

          function handleLol() {
            var element = document.createElement('pre')
            element.innerHTML = '( ͡° ͜ʖ ͡°)';
            element.className = 'css-typing';
            results[0].appendChild(element)
          }

          function handleCat(param) {
            var element = document.createElement('pre')
            for (var prop in currentDirList) {
              if (param === currentDirList[prop].name && currentDirList[prop].type === 'file') {
                CommandService.sendCommand('cat', prop).then(function(data) {
                  element.innerHTML = data.data.content
                  results[0].appendChild(element)
                });
              }
            }
          }

          // so angular :/
          function handleClear() {
            results[0].innerHTML = '';
          }

          function handleList(param) {
            var element = document.createElement('pre');
            if (!param) {
              for (var prop in currentDirList) {
                element.innerHTML += currentDirList[prop].name + ' ';
                element.className = 'css-typing';
                results[0].appendChild(element)
              }
            } else {
              for (var prop in currentDirList) {
                if (param === currentDirList[prop].name) {
                  CommandService.sendCommand('ls', prop).then(function(data) {
                    var data = data.data.items;

                    for (var prop in data) {
                      element.innerHTML += data[prop].name + ' ';
                    }
                    results[0].appendChild(element)

                  }, function errorCallback(data) {
                    element.innerHTML = data.data;
                    element.className = 'css-typing';
                    results[0].appendChild(element);
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

                    // handleList();
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
            var div = document.getElementById('pipboy');


            if (e.keyCode === 13) {

              var commandObj = commandParser(scope.commandLine)
              var commandTyped = document.createElement('pre');

              commandTyped.innerHTML = scope.commandLine;
              commandTyped.className = 'css-typing';
              results[0].appendChild(commandTyped)

              commandHanlder(commandObj.command, commandObj.param)

              commandHistory.push(scope.commandLine);



              scope.commandLine = '';
              scope.$apply();
                 div.scrollTop = div.scrollHeight - div.clientHeight;

              // terminalWindow[0].scrollTop = terminalWindow[0].scrollHeight;
            }

            if (e.keyCode === 38) {
              previousCommand();

            }

            if (e.keyCode === 40) {
              nextCommand();
            }

            if (e.keyCode === 9) {
              e.preventDefault();
              // TODO: autocomplete
            }
          });

        }
      }
    }
  }
})
