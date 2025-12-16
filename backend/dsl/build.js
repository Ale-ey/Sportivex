#!/usr/bin/env node

/**
 * Build Script for Routes DSL
 * Generates parser from ANTLR grammar and compiles DSL files to JavaScript
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * Check if ANTLR4 is installed
 */
async function checkAntlr() {
  logStep('1/4', 'Checking ANTLR4 installation...');
  
  try {
    const { stdout } = await execAsync('antlr4 -version');
    logSuccess(`ANTLR4 found: ${stdout.trim()}`);
    return true;
  } catch (error) {
    logError('ANTLR4 not found or not in PATH');
    log('Please install ANTLR4:', 'yellow');
    log('  npm install -g antlr4', 'yellow');
    log('  OR follow instructions at: https://www.antlr.org/download.html', 'yellow');
    return false;
  }
}

/**
 * Generate parser from ANTLR grammar
 */
async function generateParser() {
  logStep('2/4', 'Generating parser from ANTLR grammar...');
  
  try {
    // Create generated directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, 'generated'), { recursive: true });
    
    const command = 'antlr4 -Dlanguage=JavaScript -visitor -o generated RoutesDSL.g4';
    await execAsync(command, { cwd: __dirname });
    
    logSuccess('Parser generated successfully');
    return true;
  } catch (error) {
    logError('Failed to generate parser');
    console.error(error.message);
    return false;
  }
}

/**
 * Compile a single DSL file to JavaScript
 */
async function compileDSL(inputFile, outputFile) {
  const { generateFromFile } = await import('./RouteCodeGenerator.js');
  
  try {
    log(`  Compiling ${path.basename(inputFile)}...`, 'blue');
    await generateFromFile(inputFile, outputFile);
    logSuccess(`Generated ${path.basename(outputFile)}`);
    return true;
  } catch (error) {
    logError(`Failed to compile ${path.basename(inputFile)}`);
    console.error(error.message);
    return false;
  }
}

/**
 * Find all .routes files and compile them
 */
async function compileAllDSL() {
  logStep('3/4', 'Compiling DSL files...');
  
  const routesDir = __dirname;
  const outputDir = path.join(__dirname, '..', 'src', 'routes');
  
  try {
    const files = await fs.readdir(routesDir);
    const routeFiles = files.filter(f => f.endsWith('.routes'));
    
    if (routeFiles.length === 0) {
      logWarning('No .routes files found');
      return true;
    }
    
    log(`Found ${routeFiles.length} DSL file(s)`, 'blue');
    
    let successCount = 0;
    for (const file of routeFiles) {
      const inputPath = path.join(routesDir, file);
      const outputName = file.replace('.routes', '.generated.js');
      const outputPath = path.join(outputDir, outputName);
      
      const success = await compileDSL(inputPath, outputPath);
      if (success) successCount++;
    }
    
    if (successCount === routeFiles.length) {
      logSuccess(`All ${successCount} DSL file(s) compiled successfully`);
      return true;
    } else {
      logWarning(`${successCount}/${routeFiles.length} file(s) compiled successfully`);
      return false;
    }
  } catch (error) {
    logError('Failed to compile DSL files');
    console.error(error.message);
    return false;
  }
}

/**
 * Verify generated files
 */
async function verifyGenerated() {
  logStep('4/4', 'Verifying generated files...');
  
  const generatedDir = path.join(__dirname, 'generated');
  const requiredFiles = [
    'RoutesDSLLexer.js',
    'RoutesDSLParser.js',
    'RoutesDSLVisitor.js'
  ];
  
  try {
    for (const file of requiredFiles) {
      const filePath = path.join(generatedDir, file);
      await fs.access(filePath);
    }
    
    logSuccess('All required files generated');
    return true;
  } catch (error) {
    logError('Some generated files are missing');
    return false;
  }
}

/**
 * Clean generated files
 */
async function clean() {
  log('Cleaning generated files...', 'yellow');
  
  try {
    const generatedDir = path.join(__dirname, 'generated');
    await fs.rm(generatedDir, { recursive: true, force: true });
    logSuccess('Cleaned generated directory');
  } catch (error) {
    logWarning('Failed to clean: ' + error.message);
  }
}

/**
 * Main build process
 */
async function build() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Routes DSL Build System', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  const startTime = Date.now();
  
  // Step 1: Check ANTLR4
  if (!await checkAntlr()) {
    process.exit(1);
  }
  
  // Step 2: Generate parser
  if (!await generateParser()) {
    process.exit(1);
  }
  
  // Step 3: Compile DSL files
  if (!await compileAllDSL()) {
    process.exit(1);
  }
  
  // Step 4: Verify generated files
  if (!await verifyGenerated()) {
    process.exit(1);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(60), 'bright');
  log(`  Build completed successfully in ${duration}s`, 'green');
  log('='.repeat(60) + '\n', 'bright');
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'clean':
      await clean();
      break;
      
    case 'rebuild':
      await clean();
      await build();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      log('\nRoutes DSL Build System', 'bright');
      log('\nUsage:', 'cyan');
      log('  node build.js [command]');
      log('\nCommands:', 'cyan');
      log('  (none)    Build parser and compile DSL files');
      log('  clean     Remove generated files');
      log('  rebuild   Clean and build');
      log('  help      Show this help message\n');
      break;
      
    default:
      await build();
  }
}

// Run the script
main().catch(error => {
  logError('Build failed: ' + error.message);
  console.error(error);
  process.exit(1);
});

