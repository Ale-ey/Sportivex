Faculty of Computing

SE-314: Software Construction
Class: BESE 14AB
Lab 13: Open Ended Lab

CLO-03: Design and develop solutions based on Software Construction principles.
CLO-04: Use modern tools such as Eclipse, NetBeans etc. for software construction.
Date: 08th Dec 2025
                                 Time: 09:00 AM - 11:50 PM 
                                            02:00 PM – 04:50 PM
Name: Sidra Sultana
CMS: 464214
       
Instructor: Dr. Aftab Farooq 
Lab Engineer: Mr. Ammer Saeed 
	Lab 13: Open Ended Lab

Task: Exploration of an Existing Parser Generator
Objective: Analyze the ANTLR-based route definition grammar in this codebase and summarize its design, capabilities, and usage.
Task Description (focused on this repository):
1.	Parser Generator Selection
•	The project uses ANTLR 4 to generate a parser for a small DSL that declares HTTP route permissions.
•	Grammar entry point `program` expects one or more route blocks followed by EOF.

2.	Introduction to Parser Generators
•	Parser generators (like ANTLR) create lexers/parsers from a formal grammar, reducing manual parsing effort.
•	They handle tokenization, precedence, and parse-tree construction, enabling DSLs and compilers.

3.	Tool Features (ANTLR in this project)
•	Parsing Algorithm: ANTLR 4 uses adaptive LL(*) parsing, suitable for expressive grammars.
•	Lexer/Parser Split: Tokens (`ROLE`, `ACTION`, `SUBURL`, `WS`) and parser rules are defined in `routes.g4`.
•	Code Generation: Generates lexer, parser, and visitor/listener classes for target languages (e.g., Java, Python, C#).
•	Error Reporting: Built-in syntax error listeners; custom listeners/strategies can be added if needed.

4.	Syntax Specification (DSL covered by `routes.g4`)
•	Route block: `route` ROLE `{` suburlDef+ `}`
•	Sub-URL: `SUBURL ':' actionList`
•	Action list: `ACTION (',' ACTION)*`
•	Lexical tokens:
  - `ROLE`: `Client` or `Admin`
  - `ACTION`: `GET | POST | UPDATE | DELETE`
  - `SUBURL`: path literal like `/users`, `/orders/v1`
  - `WS`: whitespace skipped

5.	Code Generation
•	Run ANTLR on `routes.g4` to emit lexer/parser sources. Typical command (Java target):
  - `antlr4 routes.g4` (or `antlr4 -Dlanguage=Python3 routes.g4` for Python).
•Generated artifacts include parse-tree classes; you attach semantics by implementing listeners/visitors.

6.	Error Handling
•	Default: ANTLR reports unexpected tokens with line/column info and attempts single-token insertion/deletion.
•	Extensible: Custom `ANTLRErrorListener` or recovery strategies can be plugged in to tailor messages for route DSL users.

7.	Integration with IDEs
•	ANTLR grammar editing supported by VS Code (ANTLR4 extension), IntelliJ IDEA (plugin), Eclipse (plugin).
•	Generated code integrates with standard build tools (Maven/Gradle for Java; pip/venv for Python targets).

8.	Real-world Applications / Fit
•	DSL models authorization matrices: mapping roles (`Client`, `Admin`) to allowed HTTP actions on sub-URLs.
•	Can back API gateways, route whitelists, or config-driven permission checks.

9.	Comparison with Alternatives
•	ANTLR vs hand-rolled parser: faster to build/maintain; clearer grammar; automatic error reporting.
•	ANTLR vs PLY/Bison: ANTLR offers richer tooling and multi-language targets; this DSL is simple enough for LL(*) and fits ANTLR well.

References:
•	Project grammar: `routes.g4`
•	ANTLR 4 docs: https://www.antlr.org
•	ANTLR4 VS Code extension: https://marketplace.visualstudio.com/items?itemName=mike-lischke.vscode-antlr4

Submission: Compile a report based on the above sections and submit per LMS instructions.
Assessment: Depth of analysis, correctness of grammar understanding, and clarity of presentation.
Note: Extend by adding semantic checks (e.g., duplicate sub-URL detection) via listeners/visitors if needed.
Deliverables: Completed report (this sheet) plus any supporting notes or screenshots of generated parser runs.




