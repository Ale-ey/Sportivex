grammar lab;

program
  : routeDef+ EOF
  ;

routeDef
  : ROUTE_KW role lbrace suburlDef+ rbrace
  ;

suburlDef
  : suburl colon actionList
  ;

actionList
  : action (comma action)*
  ;

// Wrappers for terminals
role
  : ROLE
  ;

action
  : ACTION
  ;

suburl
  : SUBURL
  ;

colon
  : ':'
  ;

comma
  : ','
  ;

lbrace
  : '{'
  ;

rbrace
  : '}'
  ;

// =================== Lexer Rules ===================

ROUTE_KW : 'route' ;

ROLE
  : 'Client' | 'Admin'
  ;

ACTION
  : 'GET' | 'POST' | 'UPDATE' | 'DELETE'
  ;

SUBURL
  : '/' [a-zA-Z0-9._-]+
  ;

// Whitespace
WS
  : [ \t\r\n]+ -> skip
  ;
