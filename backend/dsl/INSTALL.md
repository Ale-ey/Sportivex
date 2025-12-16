# Installation Guide - Routes DSL

Complete installation guide for the Routes DSL system.

## Prerequisites

### 1. Node.js and NPM

Ensure you have Node.js (v14 or higher) and NPM installed:

```bash
node --version
npm --version
```

If not installed, download from: https://nodejs.org/

### 2. Java Runtime

ANTLR4 requires Java. Check if Java is installed:

```bash
java -version
```

If not installed:
- **Windows**: Download from https://www.java.com/
- **macOS**: `brew install java`
- **Linux**: `sudo apt-get install default-jre`

## Installation Steps

### Step 1: Install Project Dependencies

Navigate to the DSL directory:

```bash
cd backend/dsl
```

Install NPM dependencies:

```bash
npm install
```

This installs:
- `antlr4`: ANTLR4 runtime for JavaScript

### Step 2: Install ANTLR4 CLI

Install ANTLR4 command-line tool globally:

```bash
npm install -g antlr4
```

Verify installation:

```bash
antlr4 -version
```

Expected output: `ANTLR 4.x.x` (any 4.x version)

#### Alternative: Manual Installation

If the NPM package doesn't work, install manually:

**Windows:**
1. Download ANTLR JAR: https://www.antlr.org/download.html
2. Create `antlr4.bat`:
   ```batch
   @echo off
   java -jar C:\path\to\antlr-4.x-complete.jar %*
   ```
3. Add to PATH

**macOS/Linux:**
1. Download ANTLR JAR: https://www.antlr.org/download.html
2. Create alias in `~/.bashrc` or `~/.zshrc`:
   ```bash
   alias antlr4='java -jar /path/to/antlr-4.x-complete.jar'
   ```
3. Reload shell: `source ~/.bashrc`

### Step 3: Generate Parser

Generate the JavaScript parser from the ANTLR grammar:

```bash
node build.js
```

This will:
1. ✓ Check ANTLR4 installation
2. ✓ Generate parser from grammar
3. ✓ Compile example DSL files
4. ✓ Verify generated files

Expected output:
```
============================================================
  Routes DSL Build System
============================================================

[1/4] Checking ANTLR4 installation...
✓ ANTLR4 found: 4.x.x

[2/4] Generating parser from ANTLR grammar...
✓ Parser generated successfully

[3/4] Compiling DSL files...
Found 2 DSL file(s)
  Compiling auth.routes...
✓ Generated auth.generated.js
  Compiling swimming.routes...
✓ Generated swimming.generated.js
✓ All 2 DSL file(s) compiled successfully

[4/4] Verifying generated files...
✓ All required files generated

============================================================
  Build completed successfully in 0.52s
============================================================
```

### Step 4: Verify Installation

Check that the following files were created:

```
backend/dsl/generated/
├── RoutesDSLLexer.js
├── RoutesDSLParser.js
├── RoutesDSLVisitor.js
└── ...other generated files
```

And output files:

```
backend/src/routes/
├── auth.generated.js
├── swimming.generated.js
```

## Verification Tests

### Test 1: Parser Generation

```bash
cd backend/dsl
rm -rf generated
node build.js
```

Should complete without errors.

### Test 2: DSL Compilation

Create a test file `test.routes`:

```
import express from 'express';
import testController from '../controllers/testController.js';
import { authenticateToken } from '../middlewares/auth.js';

GET '/test' with authenticateToken handle testController.test;
```

Compile it:

```bash
node RouteCodeGenerator.js test.routes test.generated.js
```

Check `test.generated.js` was created.

### Test 3: Generated Code Syntax

Verify generated JavaScript is valid:

```bash
node --check test.generated.js
```

Should output nothing (no syntax errors).

Clean up:

```bash
rm test.routes test.generated.js
```

## Troubleshooting

### Issue: "antlr4: command not found"

**Solution 1:** Install globally:
```bash
npm install -g antlr4
```

**Solution 2:** Use NPX:
```bash
npx antlr4 -version
```

Then modify `build.js` to use `npx antlr4` instead of `antlr4`.

**Solution 3:** Manual installation (see Step 2 Alternative above)

### Issue: "java: command not found"

ANTLR4 requires Java. Install Java:

**Windows:**
- Download from: https://www.java.com/en/download/
- Install and restart terminal

**macOS:**
```bash
brew install java
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install default-jre
```

Verify:
```bash
java -version
```

### Issue: NPM install fails

**Clear cache and retry:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Parser generation fails

**Check ANTLR4 version:**
```bash
antlr4 -version
```

Should be 4.x.x. If not, reinstall:
```bash
npm uninstall -g antlr4
npm install -g antlr4
```

**Check Java version:**
```bash
java -version
```

Should be Java 8 or higher.

### Issue: Permission errors on Linux/macOS

**Run with sudo:**
```bash
sudo npm install -g antlr4
```

**Or use NPX (no global install):**
```bash
npx antlr4 -version
```

### Issue: Generated files are empty

**Check grammar syntax:**
```bash
antlr4 RoutesDSL.g4
```

Look for any error messages.

**Regenerate from scratch:**
```bash
node build.js rebuild
```

## Platform-Specific Notes

### Windows

- Use `cmd.exe` or PowerShell
- Paths use backslashes: `backend\dsl\`
- Make sure Java is in PATH
- May need to restart terminal after installing Java

### macOS

- Use Terminal or iTerm2
- Paths use forward slashes: `backend/dsl/`
- Can use Homebrew for easy installation:
  ```bash
  brew install java
  brew install node
  ```

### Linux

- Use Bash or Zsh
- Paths use forward slashes: `backend/dsl/`
- Install via package manager:
  ```bash
  sudo apt-get install nodejs npm default-jre
  ```

## IDE Setup

### VS Code

Install extensions for better experience:

1. **ANTLR4 grammar syntax support**
   - Extension: "ANTLR4 grammar syntax support"
   - Provides syntax highlighting for `.g4` files

2. **JavaScript/TypeScript**
   - Built-in support for `.js` files

### Custom File Association

Add to VS Code `settings.json`:

```json
{
  "files.associations": {
    "*.routes": "javascript"
  }
}
```

This provides JavaScript-like syntax highlighting for `.routes` files.

## Next Steps

After successful installation:

1. **Read Quick Start Guide**: `QUICKSTART.md`
2. **Review Examples**: Check `auth.routes` and `swimming.routes`
3. **Try Building**: Modify an example and rebuild
4. **Create Your Own**: Write a new `.routes` file
5. **Read Full Documentation**: `README.md` and `ARCHITECTURE.md`

## Uninstallation

To remove the DSL system:

```bash
# Remove generated files
cd backend/dsl
rm -rf generated node_modules

# Remove global ANTLR4
npm uninstall -g antlr4

# Remove generated route files (optional)
rm ../src/routes/*.generated.js
```

## Getting Help

If you encounter issues:

1. Check this installation guide
2. Review `QUICKSTART.md`
3. Check ANTLR4 docs: https://www.antlr.org/
4. Verify all prerequisites are installed
5. Try the troubleshooting steps above

## Summary

Installation checklist:

- ☐ Node.js and NPM installed
- ☐ Java Runtime installed
- ☐ Project dependencies installed (`npm install`)
- ☐ ANTLR4 CLI installed (`npm install -g antlr4`)
- ☐ Parser generated (`node build.js`)
- ☐ Example files compiled successfully
- ☐ Generated files verified

Once all items are checked, you're ready to use the Routes DSL!

Proceed to `QUICKSTART.md` for usage instructions.

