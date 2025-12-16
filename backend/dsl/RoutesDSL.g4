grammar RoutesDSL;

// ==================== PARSER RULES ====================

// Root rule - a route file consists of imports, constants, and route definitions
routeFile
    : imports constants routeDefinitions EOF
    ;

// Imports section
imports
    : importStatement*
    ;

importStatement
    : 'import' importList 'from' STRING_LITERAL ';'
    ;

importList
    : '{' IDENTIFIER (',' IDENTIFIER)* '}'
    | IDENTIFIER
    ;

// Constants section (for roles, middleware combinations, etc.)
constants
    : constantDeclaration*
    ;

constantDeclaration
    : 'const' IDENTIFIER '=' constantValue ';'
    ;

constantValue
    : '[' IDENTIFIER (',' IDENTIFIER)* ']'  // Array of identifiers
    | STRING_LITERAL
    | NUMBER
    ;

// Route definitions
routeDefinitions
    : routeGroup*
    ;

// Route group with optional comment
routeGroup
    : groupComment? route+
    ;

groupComment
    : BLOCK_COMMENT
    ;

// Individual route definition
route
    : httpMethod path middlewares? controller description? ';'
    ;

httpMethod
    : 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    ;

path
    : STRING_LITERAL
    | PATH_LITERAL
    ;

// Middleware chain
middlewares
    : 'with' middlewareList
    ;

middlewareList
    : middleware (',' middleware)*
    ;

middleware
    : IDENTIFIER                                    // Simple middleware
    | IDENTIFIER '(' argumentList ')'               // Middleware with arguments
    ;

argumentList
    : argument (',' argument)*
    ;

argument
    : IDENTIFIER
    | STRING_LITERAL
    | NUMBER
    ;

// Controller method reference
controller
    : 'handle' IDENTIFIER '.' IDENTIFIER
    ;

// Optional description
description
    : STRING_LITERAL
    ;

// ==================== LEXER RULES ====================

// HTTP methods
GET     : 'GET';
POST    : 'POST';
PUT     : 'PUT';
DELETE  : 'DELETE';
PATCH   : 'PATCH';

// Keywords
WITH    : 'with';
HANDLE  : 'handle';
IMPORT  : 'import';
FROM    : 'from';
CONST   : 'const';

// Literals
STRING_LITERAL
    : '\'' ( ~['\\] | '\\' . )* '\''
    | '"' ( ~["\\] | '\\' . )* '"'
    ;

PATH_LITERAL
    : '/' ( [a-zA-Z0-9_\-:] | '/' )*
    ;

NUMBER
    : [0-9]+
    ;

IDENTIFIER
    : [a-zA-Z_][a-zA-Z0-9_]*
    ;

// Block comments for grouping
BLOCK_COMMENT
    : '/*' .*? '*/'
    | '//' ~[\r\n]*
    ;

// Whitespace and comments
WS
    : [ \t\r\n]+ -> skip
    ;

LINE_COMMENT
    : '//' ~[\r\n]* -> skip
    ;

