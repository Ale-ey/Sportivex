import RoutesVisitor from './RoutesVisitor.js';

/**
 * Visitor that generates Express router code from the DSL parse tree
 */
export default class ExpressCodeGenerator extends RoutesVisitor {
    constructor() {
        super();
        this.generatedCode = [];
        this.currentRole = null;
    }

    /**
     * Visit the program node - entry point
     */
    visitProgram(ctx) {
        this.generatedCode = [];
        this.visitChildren(ctx);
        return this.generatedCode.join('\n');
    }

    /**
     * Visit each route definition (e.g., route Admin { ... })
     */
    visitRouteDef(ctx) {
        // Get the role (Admin or Client)
        this.currentRole = ctx.ROLE().getText();

        // Add a comment for this role section
        this.generatedCode.push(`\n// ${this.currentRole} Routes`);

        // Visit all suburlDef children
        return this.visitChildren(ctx);
    }

    /**
     * Visit each suburl definition (e.g., /users: GET, POST)
     */
    visitSuburlDef(ctx) {
        const suburl = ctx.SUBURL().getText();
        const actionList = ctx.actionList();

        // Get all ACTION tokens from the actionList
        const actions = actionList.ACTION().map(a => a.getText());

        // Generate a router statement for each action
        actions.forEach(action => {
            const code = this.generateRouterStatement(suburl, action, this.currentRole);
            this.generatedCode.push(code);
        });
    }

    /**
     * Generate the Express router statement
     * @param {string} path - The URL path (e.g., /users)
     * @param {string} action - The HTTP method (GET, POST, UPDATE, DELETE)
     * @param {string} role - The role (Admin or Client)
     * @returns {string} - The generated router code
     */
    generateRouterStatement(path, action, role) {
        // Map UPDATE to PUT for Express
        const method = action === 'UPDATE' ? 'put' : action.toLowerCase();

        // Create controller name from role (e.g., Admin -> adminController)
        const controllerName = `${role.toLowerCase()}Controller`;

        // Create handler name (e.g., GET -> GETHandler)
        const handlerName = `${action}Handler`;

        // Generate the router statement
        return `router.${method}('${path}', authenticateToken, ${controllerName}.${handlerName});`;
    }

    /**
     * Get the complete generated code with imports
     */
    getCompleteCode() {
        const imports = [
            "import express from 'express';",
            "import authenticateToken from './middleware/auth.js';",
            "import adminController from './controllers/adminController.js';",
            "import clientController from './controllers/clientController.js';",
            "",
            "const router = express.Router();",
            ""
        ];

        const exports = [
            "",
            "export default router;"
        ];

        return [...imports, ...this.generatedCode, ...exports].join('\n');
    }
}
