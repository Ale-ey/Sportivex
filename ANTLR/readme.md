## Express Route Code Generator (ANTLR + DSL)

This project defines a small domain-specific language (DSL) for HTTP route permissions and uses **ANTLR 4** plus **Node.js** to generate Express router code from that DSL.

### 1. DSL Overview

- **Grammar file**: `Routes.g4`
- **Concepts**:
  - **Roles**: `Admin`, `Client`
  - **Sub-URLs**: paths like `/users`, `/orders`, `/profile`
  - **Actions**: `GET`, `POST`, `UPDATE`, `DELETE`
- **Syntax**:
  - A route block:
    - `route Admin { ... }`
  - A sub-URL definition:
    - `/users: GET, POST`

Example (`routes.dsl`):

```text
route Admin {
  /users: GET, POST
  /orders: GET
}

route Client {
  /profile: GET, UPDATE
}
```

### 2. How It Works

- `Routes.g4` defines the grammar (tokens + parser rules).
- ANTLR generates:
  - `RoutesLexer.js`
  - `RoutesParser.js`
  - `RoutesVisitor.js`
  - `RoutesListener.js`
- `ExpressCodeGenerator.js` extends `RoutesVisitor`:
  - Walks the parse tree.
  - Keeps track of the current role.
  - For each sub-URL and action, emits an Express `router.method()` call.
- `generateRoutes.js`:
  - Reads a DSL file (default `routes.dsl`).
  - Builds the parse tree.
  - Runs `ExpressCodeGenerator`.
  - Prints or writes the generated router code.

### 3. Project Files

- `Routes.g4` – ANTLR grammar for the routes DSL.
- `routes.dsl` – Sample DSL input.
- `ExpressCodeGenerator.js` – Visitor that generates Express router statements.
- `generateRoutes.js` – CLI entry point to run the generator.
- `parse.js` – Simple script that parses `routes.dsl` and prints the parse tree.
- `RouteCompiler.js` – Example visitor that just logs roles and sub-URLs.
- `test-generator.js` – Inline test that generates code from a hard-coded DSL string.
- `output.js` – Example of generated Express router code.

Generated (by ANTLR):

- `RoutesLexer.js`
- `RoutesParser.js`
- `RoutesVisitor.js`
- `RoutesListener.js`

### 4. Installing & Running

#### Install dependencies

```bash
npm install
```

Make sure the ANTLR-generated JS files (`RoutesLexer.js`, `RoutesParser.js`, etc.) are present; they are already included in this project.

#### Generate routes from `routes.dsl`

```bash
node generateRoutes.js
```

This:
- Reads `routes.dsl`.
- Prints the generated Express router code to the console.

#### Generate routes to a file

```bash
node generateRoutes.js routes.dsl generated-routes.js
```

This writes the router code to `generated-routes.js`.

#### View the raw parse tree

```bash
node parse.js
```

#### Run the inline generator test

```bash
node test-generator.js
```

### 5. Generated Express Router Shape

The generator produces code similar to:

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
router.put('/profile', authenticateToken, clientController.UPDATEHandler);

export default router;
```

Action mapping:

- `GET` → `router.get()`
- `POST` → `router.post()`
- `UPDATE` → `router.put()`
- `DELETE` → `router.delete()`

### 6. Using in an Express App

After generating `generated-routes.js`:

```javascript
import express from 'express';
import generatedRoutes from './generated-routes.js';

const app = express();

app.use('/api', generatedRoutes);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

You must provide:

- `./middleware/auth.js` with `authenticateToken`.
- `./controllers/adminController.js` and `./controllers/clientController.js` exporting handlers like `GETHandler`, `POSTHandler`, `UPDATEHandler`, `DELETEHandler`.

### 7. Regenerating Parser from Grammar (optional)

If you change `Routes.g4`, regenerate the parser (example command using the provided `antlr-4.13.1-complete.jar` and JS target):

```bash
java -jar antlr-4.13.1-complete.jar -Dlanguage=JavaScript -visitor -listener Routes.g4
```

This will update `RoutesLexer.js`, `RoutesParser.js`, `RoutesVisitor.js`, and `RoutesListener.js`.

### 8. Requirements

- Node.js (ES modules enabled).
- `antlr4` npm package.
- Java (if you want to re-run ANTLR on the grammar).

