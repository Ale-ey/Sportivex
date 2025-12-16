# Routes DSL - Architecture & Design

## Overview

This document describes the architecture and design decisions behind the Routes DSL (Domain-Specific Language) for Express.js route definitions.

## Problem Statement

Traditional Express.js route definitions suffer from several issues:

1. **Verbosity**: Repetitive `router.method()` calls with nested callbacks
2. **Readability**: Complex middleware chains are hard to scan
3. **Maintainability**: Changes require touching multiple lines of boilerplate
4. **Consistency**: Easy to make small mistakes in structure

### Example Problem

```javascript
// 10 lines of code for 2 routes
router.post(
  '/time-slots',
  authenticateToken,
  requireRole(ADMIN_OR_FACULTY),
  swimmingController.createTimeSlot
);

router.put(
  '/time-slots/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.updateTimeSlot
);
```

## Solution: External DSL

We created an External DSL using ANTLR4 to provide a more concise and declarative syntax.

### Same Example in DSL

```
// 2 lines of code for 2 routes
POST '/time-slots' with authenticateToken, requireRole(ADMIN_OR_FACULTY) handle swimmingController.createTimeSlot;
PUT '/time-slots/:id' with authenticateToken, requireRole(ADMIN_ONLY) handle swimmingController.updateTimeSlot;
```

## Architecture Components

### 1. Grammar Definition (`RoutesDSL.g4`)

The ANTLR4 grammar defines the syntax and structure of the DSL.

#### Design Decisions

**Declarative Syntax**: Routes read like sentences
```
<METHOD> <path> [with <middleware>] handle <controller>
```

**Keywords**: Simple, intuitive keywords
- `with`: Introduces middleware chain
- `handle`: Introduces controller method
- `import`, `from`, `const`: Match JavaScript syntax

**Flexibility**: Supports various patterns
- Optional middleware
- Multiple middleware with arguments
- Route parameters
- Comments for grouping

#### Grammar Structure

```
routeFile
  ├── imports           // JavaScript import statements
  ├── constants         // Constant declarations
  └── routeDefinitions  // Route definitions grouped logically
      └── routeGroup*
          ├── groupComment?
          └── route+
```

### 2. Code Generator (`RouteCodeGenerator.js`)

The code generator uses the Visitor pattern to traverse the parse tree and generate JavaScript code.

#### Design Pattern: Visitor

```
RouteCodeGeneratorVisitor extends RoutesDSLVisitor
  ├── visitRouteFile()           // Entry point
  ├── visitImports()             // Process imports
  ├── visitConstants()           // Process constants
  ├── visitRouteDefinitions()    // Process all routes
  └── generateCode()             // Generate final JavaScript
```

**Advantages:**
- Separation of concerns (parsing vs. code generation)
- Easy to extend with new features
- Type-safe traversal of parse tree
- Composable visitor methods

#### Code Generation Strategy

1. **Parse Phase**: ANTLR generates parse tree
2. **Visit Phase**: Visitor traverses tree, collecting information
3. **Generation Phase**: Collected data transformed to JavaScript

```
DSL Source → Lexer → Tokens → Parser → Parse Tree → Visitor → JavaScript Code
```

### 3. Build System (`build.js`)

The build system automates the workflow:

1. Check ANTLR4 installation
2. Generate parser from grammar
3. Compile all `.routes` files
4. Verify generated files

#### Design Features

- **Cross-platform**: Works on Windows, macOS, Linux
- **Pretty output**: Colored, structured console output
- **Error handling**: Clear error messages with suggestions
- **Incremental builds**: Only regenerates what's needed

## Language Design Principles

### 1. Minimalism

Keep the language small and focused. Only include features necessary for route definitions.

**What we included:**
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Paths with parameters
- Middleware chains
- Controller references
- Imports and constants

**What we excluded:**
- Complex logic or conditionals
- Variable declarations beyond constants
- Function definitions
- Control flow statements

### 2. Readability

The DSL should read like natural language.

```
GET '/users/:id' with authenticateToken handle userController.getUser;
```

Reads as: "GET from '/users/:id', with authenticateToken, handle using userController.getUser"

### 3. Safety

Use static typing and grammar validation to catch errors early.

**Grammar Constraints:**
- Required semicolons prevent ambiguity
- Structured middleware arguments
- Type-safe controller references
- Well-defined path syntax

### 4. Compatibility

Generate clean, idiomatic JavaScript that integrates seamlessly with existing code.

**Generated Code:**
- Uses ES6 modules
- Follows Express.js conventions
- Preserves imports and constants
- No runtime dependencies

## Implementation Details

### Lexer Rules

The lexer tokenizes the input into meaningful units:

```
Keywords:     GET, POST, PUT, DELETE, PATCH, with, handle, import, from, const
Literals:     STRING_LITERAL, PATH_LITERAL, NUMBER
Identifiers:  IDENTIFIER (for variables, functions, etc.)
Comments:     BLOCK_COMMENT, LINE_COMMENT
Whitespace:   WS (skipped)
```

**Key Design Choice: PATH_LITERAL**

We created a special token for paths to avoid quoting requirements:
```
/users/:id  →  PATH_LITERAL token
```

However, we still support quoted strings for consistency with JavaScript.

### Parser Rules

The parser defines the language structure:

```antlr
route: httpMethod path middlewares? controller description? ';'
```

**Optional Elements:**
- `middlewares?`: Routes can have no middleware
- `description?`: Optional documentation string

**Required Elements:**
- HTTP method: Must be valid (GET, POST, etc.)
- Path: Must be present
- Controller: Must be present
- Semicolon: Required for clarity

### Visitor Implementation

The visitor pattern allows us to:

1. **Collect Information**: Build data structures from parse tree
2. **Transform Data**: Convert DSL concepts to JavaScript concepts
3. **Generate Code**: Produce formatted JavaScript output

**Example: Visiting a Route**

```javascript
visitRoute(ctx) {
  const method = ctx.httpMethod().getText().toLowerCase();
  const path = this.visitPath(ctx.path());
  const middlewares = ctx.middlewares() 
    ? this.visitMiddlewares(ctx.middlewares()) 
    : [];
  const controller = this.visitController(ctx.controller());
  
  return `router.${method}('${path}', ${middlewares.join(', ')}, ${controller});`;
}
```

## Extensibility

The DSL is designed to be easily extended.

### Adding New Features

**1. Extend Grammar**

Add new parser rules to `RoutesDSL.g4`:

```antlr
route
    : httpMethod path middlewares? controller rateLimit? description? ';'
    ;

rateLimit
    : 'limit' NUMBER 'per' TIME_UNIT
    ;
```

**2. Extend Visitor**

Add corresponding visitor methods:

```javascript
visitRateLimit(ctx) {
  const limit = ctx.NUMBER().getText();
  const unit = ctx.TIME_UNIT().getText();
  return `rateLimit({ max: ${limit}, window: '1${unit}' })`;
}
```

**3. Update Generator**

Incorporate new features in code generation:

```javascript
visitRoute(ctx) {
  // ... existing code ...
  const rateLimit = ctx.rateLimit() 
    ? this.visitRateLimit(ctx.rateLimit())
    : null;
  
  // Add to middleware chain if present
}
```

### Potential Extensions

1. **Route Validation**
   ```
   POST '/users' with auth, validate(userSchema) handle ctrl.create;
   ```

2. **Response Types**
   ```
   GET '/users/:id' with auth handle ctrl.get returns User;
   ```

3. **Rate Limiting**
   ```
   POST '/login' limit 5 per minute handle auth.login;
   ```

4. **CORS Configuration**
   ```
   GET '/api/public' cors(origins: ['*.example.com']) handle ctrl.get;
   ```

5. **OpenAPI Generation**
   ```
   GET '/users/:id' with auth handle ctrl.get
     @description "Get user by ID"
     @response 200 User
     @response 404 NotFound;
   ```

## Testing Strategy

### Grammar Testing

1. **Valid Input**: Test that valid DSL is accepted
2. **Invalid Input**: Test that invalid DSL is rejected
3. **Edge Cases**: Test boundary conditions

### Code Generation Testing

1. **Correctness**: Generated code is syntactically correct
2. **Equivalence**: Generated code behaves like hand-written code
3. **Idiomatic**: Generated code follows best practices

### Integration Testing

1. **Build Process**: End-to-end build works correctly
2. **Runtime**: Generated routes work in Express.js
3. **Compatibility**: Works with existing middleware and controllers

## Performance Considerations

### Build Time

- Grammar parsing is fast (< 100ms for typical files)
- Code generation is nearly instant
- Build system overhead is minimal

### Runtime

- **No overhead**: Generated code is pure JavaScript
- **No dependencies**: No runtime library required
- **Same performance**: Identical to hand-written routes

## Comparison with Alternatives

### Internal DSL (Fluent API)

```javascript
// Internal DSL approach
router
  .route('/users/:id')
  .middleware(auth, validate)
  .get(userController.getUser)
  .put(userController.updateUser);
```

**Pros:**
- No build step
- Native JavaScript
- IDE support

**Cons:**
- More verbose
- Limited syntax flexibility
- Harder to enforce structure

### External DSL (Our Approach)

**Pros:**
- Maximum conciseness
- Custom syntax
- Static validation
- Better readability

**Cons:**
- Build step required
- Learning curve for syntax
- Tooling setup

## Best Practices

### 1. Keep DSL Files Organized

```
backend/dsl/
├── auth.routes          # Authentication routes
├── user.routes          # User management
├── admin.routes         # Admin routes
└── api.routes           # Public API routes
```

### 2. Use Comments for Grouping

```
/* USER MANAGEMENT */
GET '/users' with auth handle userCtrl.list;
POST '/users' with auth, validate handle userCtrl.create;

/* USER PROFILE */
GET '/profile' with auth handle userCtrl.getProfile;
PUT '/profile' with auth handle userCtrl.updateProfile;
```

### 3. Define Constants for Reusability

```
const ADMIN_ONLY = [Roles.ADMIN];
const PUBLIC_USER = [Roles.USER, Roles.GUEST];
```

### 4. Version Control Both DSL and Generated Code

- Commit `.routes` files (source)
- Commit `.generated.js` files (output)
- This allows code review of both

## Security Considerations

### Input Validation

The grammar enforces:
- Valid HTTP methods only
- Proper path syntax
- Correct middleware structure

### Code Injection

- String literals are properly escaped
- No evaluation of user input
- Generated code is static

### Access Control

The DSL doesn't bypass security:
- Middleware still enforces authentication
- Role checks are preserved
- No elevation of privileges

## Future Work

### Short Term

1. **IDE Support**: Syntax highlighting for `.routes` files
2. **Linting**: Static analysis of DSL files
3. **Testing Tools**: Framework for testing DSL code
4. **Documentation Generation**: Auto-generate API docs from DSL

### Long Term

1. **Type System**: TypeScript-style type annotations
2. **Route Validation**: Compile-time checks for routes
3. **Optimization**: Dead code elimination
4. **Debugging**: Source maps for generated code

## Conclusion

The Routes DSL demonstrates how external DSLs can improve code quality through:

- **Abstraction**: Hide boilerplate behind concise syntax
- **Validation**: Catch errors at build time
- **Consistency**: Enforce structure across codebase
- **Maintainability**: Easy to read and modify

The architecture is designed to be simple, extensible, and practical for real-world use in Express.js applications.

## References

- ANTLR4 Documentation: https://www.antlr.org/
- Domain-Specific Languages by Martin Fowler
- Language Implementation Patterns by Terence Parr
- Express.js Routing: https://expressjs.com/en/guide/routing.html

