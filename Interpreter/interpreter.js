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
      return code;
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
    
    
    function SwitchExecution(){
      
    }
    
    
    (function(_source){
      window.interfaces.EventListener(self);
      
      source = _source || '';
      executedSource = source;
    }).apply(self, arguments);
  }
  
  window.Interpreter = Interpreter;
  
})();