# Express Route Code Generator

This project automatically generates Express router code from a custom DSL defined in `Routes.g4`.

## Files

- **Routes.g4** - ANTLR grammar defining the DSL syntax
- **routes.dsl** - Example DSL input file with route definitions
- **ExpressCodeGenerator.js** - Visitor class that generates Express code
- **generateRoutes.js** - Main script to run the code generator
- **RoutesLexer.js** - Generated ANTLR lexer
- **RoutesParser.js** - Generated ANTLR parser
- **RoutesVisitor.js** - Generated ANTLR visitor base class

## Usage

### Basic Usage (Output to Console)

```bash
node generateRoutes.js
```

This will read `routes.dsl` by default and output the generated code to the console.

### Specify Input File

```bash
node generateRoutes.js myroutes.dsl
```

### Generate and Save to File

```bash
node generateRoutes.js routes.dsl generated-routes.js
```

This will parse `routes.dsl` and save the generated Express code to `generated-routes.js`.

## Example

Given this DSL input (`routes.dsl`):

```
route Admin {
  /users: GET, POST
  /orders: GET
}

route Client {
  /profile: GET, UPDATE
}
```

The generator produces:

```javascript
import express from 'express';
import authenticateToken from './middleware/auth.js';
import adminController from './controllers/adminController.js';
import clientController from './controllers/clientController.js';

const router = express.Router();

// Admin Routes
router.get('/users', authenticateToken, adminController.GETHandler);
router.post('/users', authenticateToken, adminController.POSTHandler);
router.get('/orders', authenticateToken, adminController.GETHandler);

// Client Routes
router.get('/profile', authenticateToken, clientController.GETHandler);
router.put('/profile', authenticateToken, clientController.PUTHandler);

export default router;
```

## How It Works

1. **Lexer & Parser**: ANTLR reads the DSL and creates a parse tree
2. **Visitor Pattern**: `ExpressCodeGenerator` walks the parse tree
3. **Code Generation**: For each route definition:
   - Extracts the role (Admin/Client)
   - Extracts the path (e.g., /users)
   - Extracts the actions (GET, POST, etc.)
   - Generates corresponding `router.method()` statements
4. **Output**: Combines all generated code with necessary imports

## Integration with MERN Backend

The generated code can be directly imported into your Express app:

```javascript
// In your main Express app
import generatedRoutes from './generated-routes.js';

app.use('/api', generatedRoutes);
```

Make sure you have:
- `authenticateToken` middleware in `./middleware/auth.js`
- Controller files: `./controllers/adminController.js` and `./controllers/clientController.js`
- Each controller should export handlers like `GETHandler`, `POSTHandler`, etc.

## Action Mapping

- `GET` → `router.get()`
- `POST` → `router.post()`
- `UPDATE` → `router.put()`
- `DELETE` → `router.delete()`

## Requirements

- Node.js (ES modules support)
- antlr4 npm package
- Generated ANTLR files from Routes.g4
