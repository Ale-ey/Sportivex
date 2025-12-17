1. Define your routes in `routes.dsl` using the DSL (e.g., `route Admin { /users: GET, POST }`).
2. (Optional) Run `node parse.js` to parse `routes.dsl` and print the ANTLR parse tree for debugging.
3. Run `node generateRoutes.js routes.dsl [output.js]` to:
   - Lex and parse the DSL with `RoutesLexer`/`RoutesParser`.
   - Visit the parse tree with `ExpressCodeGenerator` and generate Express router code.
4. Use the generated router file (e.g., `output.js`) in your Express app and mount it (for example, `app.use('/api', generatedRoutes);`).
5. If you change the grammar in `Routes.g4`, regenerate the ANTLR JS files, then repeat steps 1–4.
