'use strict';

describe('Terminal directive', function() {
  var scope, element, template, $httpBackend, folderMock, fileMock;

  beforeEach(module('pipboy', 'views/terminalTemplate.html'));

  beforeEach(inject(function($rootScope, $compile, $templateCache, $injector, $document) {

    scope = $rootScope.$new();

    $httpBackend = $injector.get('$httpBackend');
    template = $templateCache.get('views/terminalTemplate.html');
    $templateCache.put('views/terminalTemplate.html', template);

    folderMock = {"items":{"1":{"name":"js","type":"folder"},"2":{"name":"html","type":"folder"},"3":{"name":"package.json","type":"file"},"4":{"name":"about.txt","type":"file"}}}

    fileMock = {
      "content": "{\n  \"name\": \"fs-front-end-project\",\n  \"private\": true,\n  \"version\": \"0.0.1\",\n  \"dependencies\": {\n    \"express\"     : \"~4.9.0\",\n    \"body-parser\" : \"~1.9.0\",\n    \"cors\"        : \"2.7.1\"\n  }\n}"
    }

    $httpBackend.when('GET', 'http://localhost:8080/api/ls/0').respond(folderMock);
    $httpBackend.when('GET', 'http://localhost:8080/api/cat/3').respond(fileMock);

    element = $compile('<terminal></terminal>')(scope);

    scope.$digest();
  }));

  afterEach(function() {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should compile directive', function() {
    expect(scope.prompt).toBe('[~]$')
    expect(scope.currentDirName).toBe('/home')
    expect(scope.currentDirIndex).toBe(0)
    expect(element[0].innerHTML).toContain('<input type="text"')
    expect(element[0].innerHTML).toContain('<div class="terminal-results"></div>')
  });

  it('should have command ls print error when unrecognized command', function() {
    scope.commandLine = 'habababa'
    scope.execute()
    scope.$apply()

    var result = element.find('pre')[1]
    expect(result.innerHTML).toContain('Unrecognized input. Type `help` to see all commands.')
  })

  it('should have command lol expect to lol', function() {
    scope.commandLine = 'lol'
    scope.execute()
    scope.$apply()

    var result = element.find('pre')[1]
    expect(result.innerHTML).toContain('( ͡° ͜ʖ ͡°)')
  })

  it('should have command help to print list of avaiable commands', function() {
    scope.commandLine = 'help'
    scope.execute()
    scope.$apply()

    var result = element.find('pre')[1]
    expect(result.innerHTML).toContain('help clear ls cat cd pwd exit')
  })

  it('should have command clear to clear the whole terminal window', function() {
    scope.commandLine = 'clear'
    scope.execute()
    scope.$apply()

    var result = element.find('pre')
    expect(result.innerHTML).toBe(undefined)
  })

  it('should command history working', function() {
    scope.commandLine = 'ls'
    scope.execute()

    scope.commandLine = 'help'
    scope.execute()

    scope.commandLine = 'clear'
    scope.execute()

    scope.previousCommand();
    scope.previousCommand();

    expect(scope.commandHistory[0]).toBe('ls')
    expect(scope.commandIndex).toBe(1)

    scope.nextCommand();

    expect(scope.commandIndex).toBe(2)
  })

  it('should show current dir user is in', function() {
    scope.commandLine = 'pwd'
    scope.execute()
    scope.$apply()

    var result = element.find('pre')[1]

    expect(result.innerHTML).toContain('Currently in: /home')
  })

  it('should trigger previousCommand if up key is pressed', function() {
    spyOn(scope, 'previousCommand');

    var eventObj = {keyCode: 38}

    scope.inputActions(eventObj)
    expect(scope.previousCommand).toHaveBeenCalled();
  })

  it('should trigger nextCommand if up down is pressed', function() {
    spyOn(scope, 'nextCommand');

    var eventObj = {keyCode: 40}

    scope.inputActions(eventObj)
    expect(scope.nextCommand).toHaveBeenCalled();
  })

  it('should have cd command work without params', function() {
    scope.handleCd('..');
    expect(scope.currentDirName).toBe('/home')
    scope.handleCd();
    expect(scope.currentDirName).toBe('/home')
  })
})
