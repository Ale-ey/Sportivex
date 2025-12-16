# Express Routes DSL

A Domain-Specific Language (DSL) for defining Express.js routes with less boilerplate and better readability.

## Overview

This DSL allows you to define Express routes in a more concise and declarative way, reducing repetitive code and making route definitions easier to maintain.

### Before (Traditional Express.js)

```javascript
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

### After (Using DSL)

```
POST '/time-slots' with authenticateToken, requireRole(ADMIN_OR_FACULTY) handle swimmingController.createTimeSlot;
PUT '/time-slots/:id' with authenticateToken, requireRole(ADMIN_ONLY) handle swimmingController.updateTimeSlot;
```

## Setup

### 1. Install Dependencies

```bash
npm install antlr4
npm install -g antlr4
```

### 2. Generate Parser

Generate the JavaScript parser from the ANTLR grammar:

```bash
cd backend/dsl
antlr4 -Dlanguage=JavaScript -visitor -o generated RoutesDSL.g4
```

This will create the following files in the `generated/` directory:
- `RoutesDSLLexer.js`
- `RoutesDSLParser.js`
- `RoutesDSLVisitor.js`
- `RoutesDSLListener.js`

### 3. Generate Routes

Convert your `.routes` DSL file to JavaScript:

```bash
node RouteCodeGenerator.js swimming.routes ../src/routes/swimming.generated.js
```

## DSL Syntax

### Import Statements

```
import { Router } from 'express';
import swimmingController from '../controllers/swimmingController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
```

### Constants

```
const ADMIN_ONLY = [Roles.ADMIN];
const ADMIN_OR_FACULTY = [Roles.ADMIN, Roles.FACULTY];
```

### Route Groups

Use comments to group related routes:

```
/* TIME SLOTS ROUTES */
GET '/time-slots' with authenticateToken handle swimmingController.getTimeSlots;
POST '/time-slots' with authenticateToken, requireRole(ADMIN_OR_FACULTY) handle swimmingController.createTimeSlot;
```

### Route Definition Syntax

```
<HTTP_METHOD> '<path>' [with <middleware1>[, <middleware2>, ...]] handle <controller>.<method>;
```

**Components:**
- `HTTP_METHOD`: GET, POST, PUT, DELETE, PATCH
- `path`: The route path (supports parameters like `:id`)
- `with`: (Optional) Keyword to introduce middleware chain
- `middleware`: One or more middleware functions (can have arguments)
- `handle`: Keyword to introduce controller method
- `controller.method`: The controller object and method name

### Examples

**Simple route (no middleware):**
```
GET '/rules' with authenticateToken handle swimmingController.getRules;
```

**Route with parameter:**
```
GET '/time-slots/:id' with authenticateToken handle swimmingController.getTimeSlotById;
```

**Route with multiple middleware:**
```
POST '/qr-codes' with authenticateToken, requireRole(ADMIN_ONLY) handle swimmingController.createQRCode;
```

**Route with middleware arguments:**
```
POST '/time-slots' with authenticateToken, requireRole(ADMIN_OR_FACULTY) handle swimmingController.createTimeSlot;
```

## Grammar Rules

The complete ANTLR grammar is defined in `RoutesDSL.g4`. Key elements:

### Parser Rules
- `routeFile`: Root rule containing imports, constants, and routes
- `imports`: Import statements section
- `constants`: Constant declarations section
- `routeDefinitions`: All route definitions grouped logically
- `routeGroup`: A group of related routes with optional comment
- `route`: Individual route definition

### Lexer Rules
- HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Keywords: `with`, `handle`, `import`, `from`, `const`
- Literals: Strings, paths, numbers, identifiers
- Comments: Block comments for grouping

## Project Structure

```
backend/dsl/
├── RoutesDSL.g4              # ANTLR grammar definition
├── RouteCodeGenerator.js      # Code generator (visitor pattern)
├── swimming.routes            # Example DSL file
├── auth.routes                # Auth routes in DSL
├── generated/                 # Generated parser files (created by ANTLR)
│   ├── RoutesDSLLexer.js
│   ├── RoutesDSLParser.js
│   └── RoutesDSLVisitor.js
├── package.json               # NPM configuration
└── README.md                  # This file
```

## Build Workflow

1. **Write DSL file** (e.g., `swimming.routes`)
2. **Generate JavaScript code**:
   ```bash
   node RouteCodeGenerator.js swimming.routes ../src/routes/swimming.js
   ```
3. **Use generated code** in your Express application

## Benefits

### 1. **Reduced Boilerplate**
- No repetitive `router.method()` calls
- Cleaner middleware chaining syntax
- Less visual noise

### 2. **Better Readability**
- Route definitions read like natural language
- Easy to scan and understand route structure
- Clear grouping of related routes

### 3. **Consistency**
- Enforced structure for all routes
- Standardized middleware patterns
- Less room for syntax errors

### 4. **Maintainability**
- Easy to add/modify routes
- Simple to refactor middleware chains
- Clear separation of concerns

### 5. **Static Analysis**
- Grammar-based validation
- Catch errors before runtime
- IDE support through grammar definition

## Advanced Features

### Custom Middleware

You can still define custom middleware in the generated file. The generator includes a placeholder comment where you can add middleware like:

```javascript
// Custom middleware definitions go here
const requireSwimmingRegistration = async (req, res, next) => {
  // ... middleware logic ...
};
```

### Extending the Grammar

To add new features to the DSL:

1. Modify `RoutesDSL.g4`
2. Regenerate the parser
3. Update `RouteCodeGenerator.js` visitor methods
4. Test with example `.routes` files

## Troubleshooting

### Parser Generation Fails

Ensure ANTLR4 is properly installed:
```bash
antlr4 -version
```

Should output version 4.x.x

### Code Generation Errors

Check that your `.routes` file follows the correct syntax. Common issues:
- Missing semicolons at end of routes
- Incorrect keyword spelling (with, handle)
- Unmatched quotes in paths or strings

### Import Errors in Generated Code

Make sure all import paths in your `.routes` file are correct relative to the output location.

## Best Practices

1. **Group Related Routes**: Use comments to organize routes logically
2. **Use Constants**: Define role arrays and middleware combinations as constants
3. **Consistent Naming**: Follow naming conventions for paths and handlers
4. **Document Complex Routes**: Add descriptions for routes with complex logic
5. **Version Control**: Keep both `.routes` files and generated `.js` files in version control

## Future Enhancements

Potential additions to the DSL:

- Route descriptions/documentation generation
- Automatic OpenAPI/Swagger spec generation
- Route validation rules
- Request/response type definitions
- Rate limiting declarations
- CORS configuration
- Route deprecation warnings

## Contributing

When modifying the DSL:

1. Update the grammar file (`RoutesDSL.g4`)
2. Update the code generator (`RouteCodeGenerator.js`)
3. Update example files
4. Update this README
5. Test with existing route definitions

## License

Same as the main project.

