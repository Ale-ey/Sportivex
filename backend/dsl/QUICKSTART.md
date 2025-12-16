# Quick Start Guide - Routes DSL

Get started with the Routes DSL in 5 minutes!

## Step 1: Install Dependencies

First, install ANTLR4 runtime for JavaScript:

```bash
cd backend/dsl
npm install
```

Install ANTLR4 command-line tool globally (if not already installed):

```bash
npm install -g antlr4
```

**Note:** On Windows, you may need to:
- Install Java (ANTLR4 requires Java to run)
- Download ANTLR JAR from https://www.antlr.org/download.html
- Add ANTLR to your PATH

## Step 2: Generate the Parser

Run the build script to generate the parser from the grammar:

```bash
node build.js
```

This will:
1. ✓ Check ANTLR4 installation
2. ✓ Generate parser from `RoutesDSL.g4`
3. ✓ Compile all `.routes` files to JavaScript
4. ✓ Verify generated files

## Step 3: Review the Generated Code

Check the generated files in `../src/routes/`:
- `auth.generated.js` - Generated from `auth.routes`
- `swimming.generated.js` - Generated from `swimming.routes`

Compare them with the original files to see the equivalence.

## Step 4: Create Your Own DSL Route File

Create a new file, e.g., `myroutes.routes`:

```
import express from 'express';
import myController from '../controllers/myController.js';
import { authenticateToken } from '../middlewares/auth.js';

/* MY ROUTES */
GET '/items' with authenticateToken handle myController.getItems;
POST '/items' with authenticateToken handle myController.createItem;
GET '/items/:id' with authenticateToken handle myController.getItemById;
PUT '/items/:id' with authenticateToken handle myController.updateItem;
DELETE '/items/:id' with authenticateToken handle myController.deleteItem;
```

## Step 5: Generate JavaScript

Compile your new DSL file:

```bash
node RouteCodeGenerator.js myroutes.routes ../src/routes/myroutes.js
```

Or add it to the build script in `package.json`:

```json
{
  "scripts": {
    "generate:myroutes": "node RouteCodeGenerator.js myroutes.routes ../src/routes/myroutes.js"
  }
}
```

Then run:

```bash
npm run generate:myroutes
```

## Step 6: Use in Your Express App

Import and use the generated router in your Express application:

```javascript
import myRoutes from './routes/myroutes.js';

app.use('/api/my', myRoutes);
```

## DSL Syntax Cheat Sheet

### Basic Route

```
<METHOD> '<path>' with <middleware> handle <controller>.<method>;
```

### Multiple Middleware

```
POST '/items' with auth, validate, sanitize handle ctrl.create;
```

### Middleware with Arguments

```
POST '/admin' with auth, requireRole(ADMIN_ONLY) handle ctrl.action;
```

### Route Parameters

```
GET '/items/:id' with auth handle ctrl.getById;
GET '/items/:id/comments/:commentId' with auth handle ctrl.getComment;
```

### Route Groups

Use comments to organize routes:

```
/* PUBLIC ROUTES */
GET '/public' handle ctrl.public;

/* PROTECTED ROUTES */
GET '/private' with auth handle ctrl.private;
```

## Common Commands

### Build Everything
```bash
node build.js
```

### Clean and Rebuild
```bash
node build.js rebuild
```

### Clean Only
```bash
node build.js clean
```

### Generate Specific Route File
```bash
node RouteCodeGenerator.js input.routes output.js
```

## Troubleshooting

### "antlr4: command not found"

Install ANTLR4 globally:
```bash
npm install -g antlr4
```

### "Cannot find module 'antlr4'"

Install dependencies:
```bash
npm install
```

### Syntax Error in DSL File

Common mistakes:
- Missing semicolon at end of route: `GET '/path' handle ctrl.method;`
- Misspelled keywords: `with` and `handle` are case-sensitive
- Missing quotes around path: Use `'/path'` not `/path`
- Incorrect middleware syntax: Use `middleware(arg)` not `middleware arg`

### Parser Generation Fails

Ensure:
1. Java is installed (ANTLR4 requires Java)
2. ANTLR4 is in your PATH
3. You're in the correct directory (`backend/dsl`)

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the example files: `auth.routes` and `swimming.routes`
- Extend the grammar in `RoutesDSL.g4` to add new features
- Add custom code generation logic in `RouteCodeGenerator.js`

## Benefits Recap

✓ **Less Code**: Write 50-70% less code for route definitions
✓ **More Readable**: Routes read like natural language
✓ **Consistent**: Enforced structure prevents errors
✓ **Maintainable**: Easy to update and refactor
✓ **Type-Safe**: Grammar validation catches errors early

## Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Review example `.routes` files
3. Check ANTLR4 documentation: https://www.antlr.org/
4. Review the grammar file: `RoutesDSL.g4`

Happy coding! 🚀

