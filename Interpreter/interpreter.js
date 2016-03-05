(function(){
  
  function Interpreter(){
    var self = this;
    
    
    var source;
    var executedSource;
    var printed = '';
    var stepInterval;
    
    
    self.getSource = GetSource;
    self.getExecutedSource = GetExecutedSource;
    self.getConsole = GetConsole;
    
    self.run = Run;
    self.stop = Stop;
    self.step = Step;
    
    
    function GetSource(){
      return source;
    }
    function GetExecutedSource(){
      return executedSource;
    }
    function GetConsole(){
      return printed;
    }
    
    function Run(delay){
      if(typeof delay == 'number') delay = Math.max(0, delay);
      else delay = 100;
      stepInterval = setInterval(Step, delay);
    }
    function Stop(){
      clearInterval(stepInterval);
    }
    function Step(){
      self.triggerEvent('step', { target: self });
      SwitchExecution();
    }
    
    
    var DIRECTIONS = {right:0, left:1, up:2, down:3};
    var x = 0;
    var y = 0;
    var direction = DIRECTIONS.right;
    
    var xSource = {};
    var ySource = {};
    
    
    function Setup(){
      FormXYSources();
      if(!HasCurrentCommand())
        LocateNextCommand();
    }
    function FormXYSources(){
      var lines = source.split('\n');
      for(var y=0; y<lines.length; y++){
        var line = lines[y];
        for(var x=0; x<line.length; x++){
          var command = line[x];
          
          if (!xSource[x]) xSource[x] = [];
          xSource[x][y] = command;
          
          if (!ySource[y]) ySource[y] = [];
          ySource[y][x] = command;
          
        }
      }
    }
    
    function HasCurrentCommand(){
      return HasCommand(x, y)
    }
    function HasCommand(x, y){
      var current = GetCommand(x, y);
      return current != null && current != undefined && current != '' && current != ' ';
    }
    function GetCurrentCommand(){
      return GetCommand(x, y);
    }
    function GetCommand(x, y){
      if(!xSource[x]) return undefined
      return xSource[x][y];
    }
    
    function MoveFromCurrentInDirection(){
      return MoveInDirection(x, y);
    }
    function MoveInDirection(x, y){
      var next = {
        x: x + (direction == DIRECTIONS.right ? 1 : (direction == DIRECTIONS.left ? -1 : 0)),
        y: y + (direction == DIRECTIONS.down ? 1 : (direction == DIRECTIONS.up ? -1 : 0))
      }
      
      var xRow = xSource[next.x];
      if(!!xRow) next.y -= xRow.length * Math.floor(next.y / xRow.length);
      
      var yRow = ySource[next.y];
      if(!!yRow) next.x -= yRow.length * Math.floor(next.x / yRow.length);
      
      return next;
    }
    
    function LocateNextCommand(){
      var next = MoveFromCurrentInDirection();
      while(!HasCommand(next.x, next.y)){
        next = MoveInDirection(next.x, next.y);
      }
      x = next.x;
      y = next.y;
    }
    
    function SwitchExecution(){
      // var command = 
    }
    
    
    (function(_source){
      window.interfaces.EventListener(self);
      
      source = _source || '';
      executedSource = source;
      
      Setup();
    }).apply(self, arguments);
  }
  
  window.Interpreter = Interpreter;
  
})();