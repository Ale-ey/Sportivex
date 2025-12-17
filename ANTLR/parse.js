import antlr4 from 'antlr4';
import RoutesLexer from './RoutesLexer.js';
import RoutesParser from './RoutesParser.js';
import fs from 'fs';

const input = fs.readFileSync('routes.dsl', 'utf8');

const chars = new antlr4.InputStream(input);
const lexer = new RoutesLexer(chars);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new RoutesParser(tokens);

parser.buildParseTrees = true;
const tree = parser.program();

// PRINT PARSE TREE
console.log(tree.toStringTree(parser));
