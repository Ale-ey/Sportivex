/**
 * Route Code Generator
 * Generates Express.js route code from the parsed DSL
 * 
 * Usage:
 * 1. Install ANTLR4: npm install antlr4
 * 2. Generate parser: antlr4 -Dlanguage=JavaScript RoutesDSL.g4
 * 3. Run this generator with the DSL file
 */

import antlr4 from 'antlr4';
import RoutesDSLLexer from './generated/RoutesDSLLexer.js';
import RoutesDSLParser from './generated/RoutesDSLParser.js';
import RoutesDSLVisitor from './generated/RoutesDSLVisitor.js';

class RouteCodeGeneratorVisitor extends RoutesDSLVisitor {
  constructor() {
    super();
    this.output = [];
    this.imports = [];
    this.constants = [];
    this.routes = [];
    this.currentGroup = null;
  }

  // Visit the entire route file
  visitRouteFile(ctx) {
    // Visit imports
    if (ctx.imports()) {
      this.visitImports(ctx.imports());
    }

    // Visit constants
    if (ctx.constants()) {
      this.visitConstants(ctx.constants());
    }

    // Visit route definitions
    if (ctx.routeDefinitions()) {
      this.visitRouteDefinitions(ctx.routeDefinitions());
    }

    return this.generateCode();
  }

  // Visit imports section
  visitImports(ctx) {
    const importStatements = ctx.importStatement();
    if (importStatements) {
      for (const stmt of importStatements) {
        this.imports.push(this.visitImportStatement(stmt));
      }
    }
  }

  visitImportStatement(ctx) {
    const importList = this.visitImportList(ctx.importList());
    const from = ctx.STRING_LITERAL().getText().slice(1, -1); // Remove quotes
    return `import ${importList} from '${from}';`;
  }

  visitImportList(ctx) {
    if (ctx.IDENTIFIER().length > 1) {
      // Multiple imports
      const identifiers = ctx.IDENTIFIER().map(id => id.getText());
      return `{ ${identifiers.join(', ')} }`;
    } else {
      // Single import
      return ctx.IDENTIFIER(0).getText();
    }
  }

  // Visit constants section
  visitConstants(ctx) {
    const declarations = ctx.constantDeclaration();
    if (declarations) {
      for (const decl of declarations) {
        this.constants.push(this.visitConstantDeclaration(decl));
      }
    }
  }

  visitConstantDeclaration(ctx) {
    const name = ctx.IDENTIFIER().getText();
    const value = this.visitConstantValue(ctx.constantValue());
    return `const ${name} = ${value};`;
  }

  visitConstantValue(ctx) {
    if (ctx.IDENTIFIER()) {
      // Array of identifiers
      const identifiers = ctx.IDENTIFIER().map(id => id.getText());
      return `[${identifiers.join(', ')}]`;
    } else if (ctx.STRING_LITERAL()) {
      return ctx.STRING_LITERAL().getText();
    } else if (ctx.NUMBER()) {
      return ctx.NUMBER().getText();
    }
  }

  // Visit route definitions
  visitRouteDefinitions(ctx) {
    const groups = ctx.routeGroup();
    if (groups) {
      for (const group of groups) {
        this.visitRouteGroup(group);
      }
    }
  }

  visitRouteGroup(ctx) {
    // Check for group comment
    if (ctx.groupComment()) {
      const comment = ctx.groupComment().BLOCK_COMMENT().getText();
      this.routes.push(`\n// ${comment.replace(/^\/\*\s*|\s*\*\/$/g, '').trim()}`);
    }

    // Visit all routes in this group
    const routes = ctx.route();
    if (routes) {
      for (const route of routes) {
        this.routes.push(this.visitRoute(route));
      }
    }
  }

  visitRoute(ctx) {
    const method = ctx.httpMethod().getText().toLowerCase();
    const path = this.visitPath(ctx.path());
    const middlewares = ctx.middlewares() ? this.visitMiddlewares(ctx.middlewares()) : [];
    const controller = this.visitController(ctx.controller());
    
    // Build the route statement
    const middlewareChain = middlewares.length > 0 
      ? `, ${middlewares.join(', ')}, ` 
      : ', ';
    
    return `router.${method}('${path}'${middlewareChain}${controller});`;
  }

  visitPath(ctx) {
    if (ctx.STRING_LITERAL()) {
      return ctx.STRING_LITERAL().getText().slice(1, -1); // Remove quotes
    } else if (ctx.PATH_LITERAL()) {
      return ctx.PATH_LITERAL().getText();
    }
  }

  visitMiddlewares(ctx) {
    return this.visitMiddlewareList(ctx.middlewareList());
  }

  visitMiddlewareList(ctx) {
    const middlewares = ctx.middleware();
    return middlewares.map(mw => this.visitMiddleware(mw));
  }

  visitMiddleware(ctx) {
    const name = ctx.IDENTIFIER(0).getText();
    
    if (ctx.argumentList()) {
      // Middleware with arguments
      const args = this.visitArgumentList(ctx.argumentList());
      return `${name}(${args.join(', ')})`;
    }
    
    return name;
  }

  visitArgumentList(ctx) {
    const args = ctx.argument();
    return args.map(arg => this.visitArgument(arg));
  }

  visitArgument(ctx) {
    if (ctx.IDENTIFIER()) {
      return ctx.IDENTIFIER().getText();
    } else if (ctx.STRING_LITERAL()) {
      return ctx.STRING_LITERAL().getText();
    } else if (ctx.NUMBER()) {
      return ctx.NUMBER().getText();
    }
  }

  visitController(ctx) {
    const object = ctx.IDENTIFIER(0).getText();
    const method = ctx.IDENTIFIER(1).getText();
    return `${object}.${method}`;
  }

  // Generate the final JavaScript code
  generateCode() {
    const parts = [];

    // Add imports
    if (this.imports.length > 0) {
      parts.push(this.imports.join('\n'));
      parts.push('');
    }

    // Add router initialization
    parts.push('const router = express.Router();');
    parts.push('');

    // Add constants
    if (this.constants.length > 0) {
      parts.push(this.constants.join('\n'));
      parts.push('');
    }

    // Add middleware definitions (if needed)
    // This part would include custom middleware like requireSwimmingRegistration
    // For simplicity, we'll add a comment indicating where custom middleware should go
    parts.push('// Custom middleware definitions go here');
    parts.push('');

    // Add routes
    if (this.routes.length > 0) {
      parts.push(this.routes.join('\n'));
      parts.push('');
    }

    // Add export
    parts.push('export default router;');
    parts.push('');

    return parts.join('\n');
  }
}

/**
 * Generate JavaScript code from DSL file
 * @param {string} dslCode - The DSL code as a string
 * @returns {string} Generated JavaScript code
 */
export function generateRouteCode(dslCode) {
  // Create lexer and parser
  const chars = new antlr4.InputStream(dslCode);
  const lexer = new RoutesDSLLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new RoutesDSLParser(tokens);

  // Parse the input
  const tree = parser.routeFile();

  // Generate code
  const generator = new RouteCodeGeneratorVisitor();
  return generator.visit(tree);
}

/**
 * Main function to generate code from file
 */
export async function generateFromFile(inputFile, outputFile) {
  const fs = await import('fs/promises');
  
  try {
    // Read DSL file
    const dslCode = await fs.readFile(inputFile, 'utf-8');
    
    // Generate JavaScript code
    const jsCode = generateRouteCode(dslCode);
    
    // Write to output file
    await fs.writeFile(outputFile, jsCode, 'utf-8');
    
    console.log(`✓ Successfully generated ${outputFile} from ${inputFile}`);
    return jsCode;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node RouteCodeGenerator.js <input.routes> <output.js>');
    process.exit(1);
  }
  
  generateFromFile(args[0], args[1])
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

