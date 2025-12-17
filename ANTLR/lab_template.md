
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
Objective: The objective of this task is to explore and analyze the features, capabilities, and usage of an existing parser generator tool. The selected tool will be instrumental in generating parsers for a chosen programming language.
Task Description:
1.	Select a Parser Generator:
•	Choose a widely used parser generator tool, such as ANTLR, Bison, JavaCC, Yacc, PLY, or any other of your preference. 
•	Ensure the selected tool supports a programming language of interest.
PLY (Python Lex-Yacc) is chosen as it is a pure Python implementation of the classic Unix tools lex and yacc, widely used for parsing in Python projects.
2.	Introduction to Parser Generators:
•	Research and provide a brief overview of parser generators, highlighting their role in compiler construction and language processing.
Parser generators are tools that automatically generate parsers from formal grammar specifications. They play a crucial role in compiler construction and language processing by:

- Automating the creation of lexical analyzers (tokenizers) and parsers
- Handling complex grammar rules and precedence
- Enabling the development of domain-specific languages
- Facilitating syntax analysis in interpreters and compilers

PLY specifically implements LALR(1) parsing, similar to yacc, and is designed for Python applications..
3.	Tool Features:
•	Explore the features and capabilities of the chosen parser generator tool.
•	Investigate its support for different parsing algorithms (LL, LR, etc.).
•	Examine its ability to handle syntactic and semantic analysis.
  PLY provides the following key features:
•Parsing Algorithm : Supports L ALR(1) parsing, which is powerful for
handling complex grammars
•Lexical Analysis : Built-in lexer generation with regular expression
support
•Grammar Specification : Python-based grammar definition using
functions and docstrings
•Code Generation : Automatic generation of parsing tables and code at
runtime
•Error Handling : Configurable error recovery mechanisms
•Syntactic and Semantic Analysis : Supports both through parser
actions and semantic actions
PLY focuses primarily on syntactic analysis but allows integration of semantic
actions.

4.	Syntax Specification:
•	Investigate how the tool allows the specification of the grammar for the programming language.
•	Explore the syntax used for defining production rules and symbols.
 In PLY, grammar is specified using Python code:
•Tokens: Defined as a list of strings
•Lexer Rules : Functions with names t_TOKENNAME and regular
expressions in docstrings
•Parser Rules : Functions with names p_rulename and grammar rules
in docstrings
•Precedence : Optional precedence table for operators
Example syntax:

5.	Code Generation:
•	Analyze the code generation capabilities of the parser generator.
•	Explore how the tool generates parsing code for the specified grammar.
  PLY generates parsing code dynamically :
•Lexer Generation :lex.lex() creates the le xer from tok en
definitions
•Parser Generation :yacc.yacc() creates the parser fr om grammar
rules
•Table Generation : Creates L ALR parsing tables automatically
•Runtime Compilation : No separate compilation step; tables are built
when the module is imported

6.	Error Handling:
•	Examine the mechanisms provided by the parser generator for error detection and recovery.
•	Investigate how gracefully the tool handles syntactic errors.
 PLY provides error handling through:
•Lexical Errors :t_error(t) function for unrecognized tokens
•Syntax Errors :p_error(p) function for parsing errors
•Error Recovery : Parser can skip tokens and continue parsing
•Error T okens: Special error productions in grammar rules
Example:




7.	Integration with IDEs:
•	Explore whether the parser generator integrates well with popular Integrated Development Environments (IDEs) like Eclipse, IntelliJ, or Visual Studio Code.
 PLY integrates well with VS Code through:
•Python Extension : Standard Python debugging and execution
•Jupyter Notebooks : Direct execution in cells (as demonstrated her e)
•Terminal Integration : Run parsers from VS Code terminal
•No Special Plugins : Works with standard Python development tools
VS Code's Python extension provides syntax highlighting, debugging, and
IntelliSense for PLY code.	

8.	Real-world Applications:
•	Research and provide examples of real-world applications or projects that have successfully used the chosen parser generator.
 PLY is used in various Python projects:
•Sly: Alexing and parsing library built on PL Y
•Python's ast module : While not directly using PL Y, similar concepts
•Domain-specific languages : Configuration file parsers, query
languages
•Educational tools : Compiler construction courses
•Game development : Script parsing for game logic
Examples include parsers for SQL -like languages, mathematical e xpressions, and
custom configuration for mats.

9.	Comparison with Alternatives:
•	Optionally, compare the selected parser generator with alternative tools, highlighting its strengths, weaknesses, and any unique features.
 PLY vs ANTLR :
•PLY: Pure Python, L ALR(1), simpler for Python developers
•ANTLR : Multi-language, LL(*), mor e powerful grammars, better IDE
integration
PLY vs Bison/Y acc:
•PLY: Python-native, no e xternal tools needed
•Bison/Y acc: C-based, r equir es compilation, mor e matur e
Strengths of PL Y:
•Easy integration with Python projects
•No external dependencies
•Good performance for L ALR grammars
Weaknesses:
•Limited to L ALR(1), may not handle all grammars
•Less IDE support compared to ANTLR
•Smaller community than some alter natives

References:
Books & Academic Sources
1.	Aho, A. V., Lam, M. S., Sethi, R., & Ullman, J. D. (2006). Compilers: Principles, Techniques, and Tools (2nd ed.). Pearson.
— Standard textbook explaining lexers, parsers, LALR, LL parsing, and compiler theory.
2.	Grune, D., Jacobs, C. J. H., Langendoen, K., & Bal, H. E. (2012). Modern Compiler Design. Springer.
— Detailed discussion on parsing algorithms and grammar handling.
Official Documentation & Repositories
3.	PLY (Python Lex-Yacc) Official Documentation:
https://www.dabeaz.com/ply/
— Author’s site with complete reference and examples.
4.	PLY GitHub Repository:
https://github.com/dabeaz/ply
— Source code and implementation details.
5.	ANTLR Official Documentation:
https://www.antlr.org/
— Used for comparison with PLY (LL* parser).
6.	GNU Bison (Yacc alternative) Documentation:
https://www.gnu.org/software/bison/manual/
— Useful for LR/LALR parsing references.

Submission: Prepare a comprehensive report summarizing your findings. Include sections on the selected parser generator's features, syntax specification, code generation, error handling, integration with IDEs, real-world applications, and any relevant comparisons. The report should be well-organized and include references to the sources of information.
Assessment: Your evaluation will be based on the depth of your exploration, clarity in presenting findings, and the overall quality of your report. Additionally, consider the relevance of the selected parser generator to real-world software engineering practices.
Note: This task aims to provide you with a practical understanding of parser generators and their significance in software development. Ensure to document your exploration thoroughly and draw insights that can contribute to a deeper understanding of these tools in the context of software construction.
Deliverables:
Compile a single word document by filling in the solution part and submit this Word file on LMS. In case of any problems with submissions on LMS, submit your Lab assignments by emailing it to aftab.farooq@seecs.edu.pk.

