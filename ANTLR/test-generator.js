import antlr4 from 'antlr4';
import RoutesLexer from './RoutesLexer.js';
import RoutesParser from './RoutesParser.js';
import ExpressCodeGenerator from './ExpressCodeGenerator.js';

// Simple inline test
const dslInput = `route Admin {
  /users: GET, POST
  /orders: GET
}

route Client {
  /profile: GET, UPDATE
}`;

console.log('Starting test...');

try {
    const chars = new antlr4.InputStream(dslInput);
    const lexer = new RoutesLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new RoutesParser(tokens);

    parser.buildParseTrees = true;
    const tree = parser.program();

    console.log('Parse tree created');

    const generator = new ExpressCodeGenerator();
    generator.visit(tree);

    const code = generator.getCompleteCode();
    console.log('\n' + '='.repeat(60));
    console.log(code);
    console.log('='.repeat(60));

} catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
}

console.log('\nTest complete');
