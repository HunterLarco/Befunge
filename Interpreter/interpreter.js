(function(){
  
  function Interpreter(){
    var self = this;
    
    
    var source;
    var executedSource;
    var printed = '';
    var stepInterval;
    var stack = [];
    var running = true;
    
    
    self.getSource = GetSource;
    self.getExecutedSource = GetExecutedSource;
    self.getConsole = GetConsole;
    self.getStack = GetStack;
    self.getLocation = GetLocation;
    
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
    function GetStack(){
      return stack.concat([]);
    }
    function GetLocation(){
      return { x:x, y:y };
    }
    
    function Run(delay){
      running = true;
      if(typeof delay == 'number'){
        delay = Math.max(0, delay);
        stepInterval = setInterval(Step, delay);
      }else{
        while(running)
          Step();
      }
    }
    function Stop(){
      running = false;
      clearInterval(stepInterval);
    }
    function Step(){
      self.triggerEvent('step', { target: self });
      Execute();
    }
    
    
    var DIRECTIONS = {right:0, left:1, up:2, down:3};
    var x = 0;
    var y = 0;
    var direction = DIRECTIONS.right;
    
    var xSource = {};
    var ySource = {};
    
    var inString = false;
    var inIgnore = false;
    
    
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
      if(inString) return true;
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
    
    function MoveOneInCurrentDirection(){
      return {
        x: x + (direction == DIRECTIONS.right ? 1 : (direction == DIRECTIONS.left ? -1 : 0)),
        y: y + (direction == DIRECTIONS.down ? 1 : (direction == DIRECTIONS.up ? -1 : 0))
      }
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
    
    function PopStack(){
      if(stack.length == 0) return 0;
      return stack.pop();
    }
    
    function LocateNextCommand(){
      var next = MoveFromCurrentInDirection();
      while(!HasCommand(next.x, next.y)){
        next = MoveInDirection(next.x, next.y);
      }
      x = next.x;
      y = next.y;
    }
    
    function Execute(){
      var command = GetCurrentCommand();
      
      if(inIgnore){
        if(command == ';') TriggerIgnore();
        return LocateNextCommand();
      }
      
      if(inString){
        if(command == '"') TriggerString();
        else PushToStack(command.charCodeAt(0));
        return LocateNextCommand();
      }
        
      switch(command){
        case '+' : DoPlus();     break;
        case '-' : DoMinus();    break;
        case '*' : DoMultiply(); break;
        case '/' : DoDivide();   break;
        case '%' : DoModulus();  break;
        case '!' : DoNot();      break;
        case '`' : DoCompare();  break;
        case '>' : ChangeDirection(DIRECTIONS.right); break;
        case '<' : ChangeDirection(DIRECTIONS.left);  break;
        case 'v' : ChangeDirection(DIRECTIONS.down);  break;
        case '^' : ChangeDirection(DIRECTIONS.up);    break;
        case '?' : ChangeRandomDirection();          break;
        case '_' : HorizontalLogicGate(); break;
        case '|' : VerticalLogicGate();   break;
        case '"' : TriggerString();       break;
        case ':' : DuplicateTopOfStack(); break;
        case '\\': SwapTopOfStack();      break;
        case '$' : PopTopOfStack();       break;
        case '.' : OutputInteger();   break;
        case ',' : OutputCharacter(); break;
        case '#' : SkipCommand(); break;
        case 'g' : break;
        case 'p' : break;
        case ';' : TriggerIgnore(); break;
        case '@' : Stop(); return;  break;
        case '0' : PushToStack(0);  break;
        case '1' : PushToStack(1);  break;
        case '2' : PushToStack(2);  break;
        case '3' : PushToStack(3);  break;
        case '4' : PushToStack(4);  break;
        case '5' : PushToStack(5);  break;
        case '6' : PushToStack(6);  break;
        case '7' : PushToStack(7);  break;
        case '8' : PushToStack(8);  break;
        case '9' : PushToStack(9);  break;
        default:
          Stop();
          throw 'Unknown Command';
      }
      
      LocateNextCommand();
    }
    
    function DoPlus(){
      var a = PopStack();
      var b = PopStack();
      stack.push(a + b);
    }
    function DoMinus(){
      var a = PopStack();
      var b = PopStack();
      stack.push(b - a);
    }
    function DoMultiply(){
      var a = PopStack();
      var b = PopStack();
      stack.push(b * a);
    }
    function DoDivide(){
      var a = PopStack();
      var b = PopStack();
      stack.push(Math.round(b / a));
    }
    function DoModulus(){
      var a = PopStack();
      var b = PopStack();
      stack.push(b % a);
    }
    function DoNot(){
      var a = PopStack();
      stack.push(a == 0 ? 1 : 0);
    }
    function DoCompare(){
      var a = PopStack();
      var b = PopStack();
      stack.push(b > a ? 1 : 0);
    }
    
    function TriggerString(){
      if(inIgnore) return;
      inString = !inString;
    }
    function TriggerIgnore(){
      if(inString) return;
      inIgnore = !inIgnore;
    }
    
    function ChangeDirection(dir){
      direction = dir;
    }
    function ChangeRandomDirection(){
      switch(Math.floor(Math.random()*4)){
        case 0: ChangeDirection(DIRECTION.right); break;
        case 1: ChangeDirection(DIRECTION.left);  break;
        case 2: ChangeDirection(DIRECTION.down);  break;
        case 3: ChangeDirection(DIRECTION.up);    break;
      }
    }
    
    function HorizontalLogicGate(){
      var a = PopStack();
      if(a == 0) ChangeDirection(DIRECTIONS.right);
      else ChangeDirection(DIRECTIONS.left);
    }
    function VerticalLogicGate(){
      var a = PopStack();
      if(a == 0) ChangeDirection(DIRECTIONS.down);
      else ChangeDirection(DIRECTIONS.up);
    }
    
    function OutputInteger(){
      var a = PopStack();
      printed += a;
    }
    function OutputCharacter(){
      var a = PopStack();
      printed += String.fromCharCode(a);
    }
    
    function SkipCommand(){
      var next = MoveOneInCurrentDirection();
      x = next.x;
      y = next.y;
    }
    
    function DuplicateTopOfStack(){
      var a = PopStack();
      stack.push(a);
      stack.push(a);
    }
    function SwapTopOfStack(){
      var a = PopStack();
      var b = PopStack();
      stack.push(a);
      stack.push(b);
    }
    function PopTopOfStack(){
      PopStack();
    }
    
    function PushToStack(number){
      stack.push(number);
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