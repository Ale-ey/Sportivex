grammar Routes;

program
  : routeDef+ EOF
  ;

routeDef
  : 'route' ROLE '{' suburlDef+ '}'
  ;

suburlDef
  : SUBURL ':' actionList
  ;

actionList
  : ACTION (',' ACTION)*
  ;

ROLE
  : 'Client' | 'Admin'
  ;

ACTION
  : 'GET' | 'POST' | 'UPDATE' | 'DELETE'
  ;

SUBURL
  : '/' [a-zA-Z0-9._-]+
  ;

WS
  : [ \t\r\n]+ -> skip
  ;
