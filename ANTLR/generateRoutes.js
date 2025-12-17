import antlr4 from 'antlr4';
import RoutesLexer from './RoutesLexer.js';
import RoutesParser from './RoutesParser.js';
import ExpressCodeGenerator from './ExpressCodeGenerator.js';
import fs from 'fs';

/**
 * Main script to parse the DSL and generate Express router code
 */
function generateExpressRoutes(inputFile, outputFile = null) {
    try {
        // Read the DSL input file
        const input = fs.readFileSync(inputFile, 'utf8');
        console.log(`📖 Reading DSL file: ${inputFile}\n`);

        // Create ANTLR lexer and parser
        const chars = new antlr4.InputStream(input);
        const lexer = new RoutesLexer(chars);
        const tokens = new antlr4.CommonTokenStream(lexer);
        const parser = new RoutesParser(tokens);

        // Build the parse tree
        parser.buildParseTrees = true;
        const tree = parser.program();

        console.log('🌳 Parse tree generated successfully\n');

        // Create the code generator visitor
        const generator = new ExpressCodeGenerator();

        // Walk the parse tree to generate code
        generator.visit(tree);

        // Get the complete generated code with imports
        const generatedCode = generator.getCompleteCode();

        // Output the generated code
        console.log('✨ Generated Express Router Code:\n');
        console.log('─'.repeat(60));
        console.log(generatedCode);
        console.log('─'.repeat(60));

        // Write to file if output path is specified
        if (outputFile) {
            fs.writeFileSync(outputFile, generatedCode, 'utf8');
            console.log(`\n✅ Code written to: ${outputFile}`);
        }

        return generatedCode;

    } catch (error) {
        console.error('❌ Error generating routes:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the generator
// Usage: node generateRoutes.js [input-file] [output-file]
const inputFile = process.argv[2] || 'routes.dsl';
const outputFile = process.argv[3] || null;

generateExpressRoutes(inputFile, outputFile);
