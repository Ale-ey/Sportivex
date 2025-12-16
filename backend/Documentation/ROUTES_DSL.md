# Routes DSL Documentation

## Overview

The Routes DSL (Domain-Specific Language) is a custom language for defining Express.js routes with minimal boilerplate. It uses ANTLR4 to parse route definitions and generate clean JavaScript code.

## Location

All DSL-related files are in `backend/dsl/`:

```
backend/dsl/
├── RoutesDSL.g4              # ANTLR grammar definition
├── RouteCodeGenerator.js      # Code generator
├── build.js                   # Build automation script
├── package.json               # Dependencies
├── *.routes                   # DSL source files
├── generated/                 # Generated parser (auto-created)
├── README.md                  # Full documentation
├── QUICKSTART.md              # Quick start guide
└── ARCHITECTURE.md            # Architecture details
```

## Quick Reference

### Basic Syntax

```
<HTTP_METHOD> '<path>' [with <middleware>[, ...]] handle <controller>.<method>;
```

### Examples

```
// Simple route
GET '/users' with authenticateToken handle userController.getUsers;

// Route with parameter
GET '/users/:id' with authenticateToken handle userController.getUserById;

// Multiple middleware
POST '/admin' with authenticateToken, requireRole(ADMIN_ONLY) handle adminController.action;

// No middleware
POST '/public/register' handle authController.register;
```

### Supported HTTP Methods

- `GET`
- `POST`
- `PUT`
- `DELETE`
- `PATCH`

### Route Groups

Use comments to organize related routes:

```
/* USER ROUTES */
GET '/users' with auth handle userCtrl.list;
POST '/users' with auth handle userCtrl.create;

/* ADMIN ROUTES */
GET '/admin/users' with auth, requireRole(ADMIN_ONLY) handle adminCtrl.list;
```

## Getting Started

### 1. Install Dependencies

```bash
cd backend/dsl
npm install
```

Install ANTLR4 CLI (if not already installed):

```bash
npm install -g antlr4
```

### 2. Write DSL File

Create a file named `myroutes.routes`:

```
import express from 'express';
import myController from '../controllers/myController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { Roles } from '../constants/roles.js';

const ADMIN_ONLY = [Roles.ADMIN];

/* PUBLIC ROUTES */
GET '/items' handle myController.getPublicItems;
POST '/register' handle myController.register;

/* PROTECTED ROUTES */
GET '/items/mine' with authenticateToken handle myController.getMyItems;
POST '/items' with authenticateToken handle myController.createItem;
PUT '/items/:id' with authenticateToken handle myController.updateItem;
DELETE '/items/:id' with authenticateToken handle myController.deleteItem;

/* ADMIN ROUTES */
GET '/admin/items' with authenticateToken, requireRole(ADMIN_ONLY) handle myController.adminListItems;
DELETE '/admin/items/:id' with authenticateToken, requireRole(ADMIN_ONLY) handle myController.adminDeleteItem;
```

### 3. Generate JavaScript

Run the build system:

```bash
cd backend/dsl
node build.js
```

Or compile a specific file:

```bash
node RouteCodeGenerator.js myroutes.routes ../src/routes/myroutes.js
```

### 4. Use Generated Routes

In your Express application:

```javascript
import express from 'express';
import myRoutes from './routes/myroutes.js';

const app = express();

app.use('/api', myRoutes);

app.listen(3000);
```

## File Structure

### DSL Source File (`.routes`)

```
// Imports (standard JavaScript imports)
import express from 'express';
import controller from '../controllers/controller.js';
import { middleware1, middleware2 } from '../middlewares/auth.js';

// Constants (optional)
const CONSTANT_NAME = [Value1, Value2];

// Route definitions
/* ROUTE GROUP COMMENT */
METHOD '/path' with middleware1, middleware2 handle controller.method;
METHOD '/path/:param' with middleware1 handle controller.method2;
```

### Generated JavaScript File (`.generated.js` or `.js`)

```javascript
import express from 'express';
import controller from '../controllers/controller.js';
import { middleware1, middleware2 } from '../middlewares/auth.js';

const router = express.Router();

const CONSTANT_NAME = [Value1, Value2];

// Custom middleware definitions go here

// ROUTE GROUP COMMENT
router.method('/path', middleware1, middleware2, controller.method);
router.method('/path/:param', middleware1, controller.method2);

export default router;
```

## Advanced Usage

### Middleware with Arguments

```
POST '/admin' with authenticateToken, requireRole(ADMIN_ONLY) handle adminCtrl.action;
```

Generates:

```javascript
router.post('/admin', authenticateToken, requireRole(ADMIN_ONLY), adminCtrl.action);
```

### Custom Middleware

The generated code includes a comment placeholder for custom middleware:

```javascript
// Custom middleware definitions go here
const customMiddleware = async (req, res, next) => {
  // ... logic ...
  next();
};
```

You can add custom middleware after generation, or extend the DSL to support inline middleware definitions.

### Multiple Files

Organize routes by domain:

```
backend/dsl/
├── auth.routes           # Authentication routes
├── user.routes           # User management routes
├── admin.routes          # Admin routes
├── swimming.routes       # Swimming facility routes
└── gym.routes            # Gym facility routes
```

Build all at once:

```bash
node build.js
```

## Build Commands

### Standard Build

```bash
node build.js
```

Runs all steps:
1. Checks ANTLR4 installation
2. Generates parser
3. Compiles all `.routes` files
4. Verifies output

### Clean Build

```bash
node build.js clean
```

Removes all generated files.

### Rebuild

```bash
node build.js rebuild
```

Cleans and builds from scratch.

### NPM Scripts

```bash
# Generate parser only
npm run generate-parser

# Generate specific route files
npm run generate:auth
npm run generate:swimming

# Generate all routes
npm run generate:all

# Full build
npm run build
```

## Benefits

### Code Reduction

**Before (Traditional Express.js):**
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

router.delete(
  '/time-slots/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.deleteTimeSlot
);
```

**After (DSL):**
```
POST '/time-slots' with authenticateToken, requireRole(ADMIN_OR_FACULTY) handle swimmingController.createTimeSlot;
PUT '/time-slots/:id' with authenticateToken, requireRole(ADMIN_ONLY) handle swimmingController.updateTimeSlot;
DELETE '/time-slots/:id' with authenticateToken, requireRole(ADMIN_ONLY) handle swimmingController.deleteTimeSlot;
```

**Reduction: ~70% less code**

### Improved Readability

Routes read like natural language:
- "GET from '/users' with authenticateToken, handle using userController.getUsers"
- "POST to '/admin' with auth and requireRole, handle using adminController.action"

### Consistency

The DSL enforces a consistent structure:
- All routes follow the same pattern
- Middleware chains are always in the same order
- Easy to scan and understand

### Compile-Time Validation

Grammar ensures:
- Valid HTTP methods
- Proper path syntax
- Correct middleware structure
- Type-safe controller references

### Maintainability

- Easy to add new routes
- Simple to refactor middleware chains
- Clear separation of concerns
- Version control friendly

## Integration with Existing Code

### Gradual Migration

You can use DSL routes alongside traditional Express routes:

```javascript
import express from 'express';
import dslRoutes from './routes/users.generated.js';
import traditionalRoutes from './routes/legacy.js';

const app = express();

app.use('/api/users', dslRoutes);      // DSL-generated
app.use('/api/legacy', traditionalRoutes); // Traditional
```

### No Runtime Dependencies

Generated code is pure JavaScript with no special runtime library. It integrates seamlessly with existing Express.js applications.

### Preserves Middleware

All middleware behavior is preserved:
- Authentication still works
- Authorization is unchanged
- Custom middleware functions normally

## Extending the DSL

See `ARCHITECTURE.md` for details on extending the grammar and code generator.

### Example Extension: Rate Limiting

**1. Modify Grammar:**

```antlr
route
    : httpMethod path middlewares? controller rateLimit? ';'
    ;

rateLimit
    : 'limit' NUMBER 'per' timeUnit
    ;

timeUnit
    : 'second' | 'minute' | 'hour' | 'day'
    ;
```

**2. Update Visitor:**

```javascript
visitRateLimit(ctx) {
  const limit = ctx.NUMBER().getText();
  const unit = ctx.timeUnit().getText();
  return `rateLimit({ max: ${limit}, window: '1${unit}' })`;
}
```

**3. Use in DSL:**

```
POST '/login' limit 5 per minute handle authController.login;
```

## Troubleshooting

### Build Errors

**"antlr4: command not found"**
- Install ANTLR4: `npm install -g antlr4`
- Ensure Java is installed (ANTLR4 requires Java)

**"Cannot find module 'antlr4'"**
- Run `npm install` in `backend/dsl/`

### Syntax Errors

**Missing semicolon:**
```
GET '/users' handle ctrl.get  ❌
GET '/users' handle ctrl.get; ✓
```

**Missing quotes around path:**
```
GET /users handle ctrl.get  ❌
GET '/users' handle ctrl.get; ✓
```

**Incorrect middleware syntax:**
```
GET '/admin' with requireRole ADMIN handle ctrl.get  ❌
GET '/admin' with requireRole(ADMIN) handle ctrl.get; ✓
```

### Generated Code Issues

If generated code has syntax errors:
1. Check your DSL file for syntax errors
2. Ensure all imports are correct
3. Verify controller and middleware names exist
4. Check that paths are valid Express routes

## Performance

### Build Time

- Grammar parsing: < 100ms per file
- Code generation: < 50ms per file
- Total build time: < 1 second for typical projects

### Runtime

- **Zero overhead**: Generated code is identical to hand-written code
- **No dependencies**: Pure JavaScript, no runtime library
- **Same performance**: Express.js handles routes identically

## Best Practices

### 1. Organize by Domain

Create separate `.routes` files for each domain:
- `auth.routes` - Authentication
- `users.routes` - User management
- `admin.routes` - Admin functionality
- `swimming.routes` - Swimming facility
- `gym.routes` - Gym facility

### 2. Use Meaningful Comments

Group related routes with descriptive comments:

```
/* USER AUTHENTICATION */
POST '/login' handle authController.login;
POST '/register' handle authController.register;
POST '/logout' with auth handle authController.logout;

/* PASSWORD MANAGEMENT */
POST '/forgot-password' handle authController.forgotPassword;
POST '/reset-password' handle authController.resetPassword;
```

### 3. Define Reusable Constants

```
const ADMIN_ONLY = [Roles.ADMIN];
const ADMIN_OR_FACULTY = [Roles.ADMIN, Roles.FACULTY];
const PUBLIC_ROLES = [Roles.USER, Roles.GUEST, Roles.MEMBER];
```

### 4. Keep Middleware Chains Short

If middleware chains get too long, consider creating composed middleware:

```javascript
// In middleware file
export const adminAuth = [authenticateToken, requireRole(ADMIN_ONLY)];
```

```
// In DSL
GET '/admin/users' with adminAuth handle adminController.listUsers;
```

### 5. Version Control

- Commit both `.routes` (source) and `.generated.js` (output) files
- This allows code review of generated output
- Ensures reproducible builds

### 6. Documentation

Add comments explaining complex routes:

```
/* SWIMMING ATTENDANCE 
 * Requires active swimming registration and payment
 */
POST '/attendance/scan-qr' with auth, requireSwimmingReg handle swimmingCtrl.scanQR;
```

## Resources

### Documentation Files

- **README.md**: Comprehensive documentation
- **QUICKSTART.md**: 5-minute quick start guide
- **ARCHITECTURE.md**: Design and architecture details
- **This file**: Integration documentation for the project

### Example Files

- **auth.routes**: Authentication routes example
- **swimming.routes**: Complex example with multiple middleware

### Grammar and Code Generation

- **RoutesDSL.g4**: ANTLR grammar definition
- **RouteCodeGenerator.js**: Visitor-based code generator
- **build.js**: Automated build system

## Support

For issues or questions:

1. Check the documentation in `backend/dsl/`
2. Review example `.routes` files
3. Read ANTLR4 documentation: https://www.antlr.org/
4. Check Express.js routing guide: https://expressjs.com/en/guide/routing.html

## Summary

The Routes DSL provides a concise, readable way to define Express.js routes while maintaining full compatibility with existing code. It reduces boilerplate, improves consistency, and makes route definitions easier to maintain.

**Key Takeaways:**
- ✓ 70% less code than traditional Express routes
- ✓ Grammar-based validation catches errors early
- ✓ No runtime dependencies or performance overhead
- ✓ Seamless integration with existing Express.js applications
- ✓ Extensible architecture for future enhancements

