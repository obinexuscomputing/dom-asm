import { Command } from "commander";
import { parseFile as parseHTML } from './api/htmlApi';
import { notImplemented } from './utils';
import path from 'path';
import fs from 'fs';

const program = new Command();

// Helper function to validate file existence
function validateFile(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return absolutePath;
}

// Helper function to handle command execution
function executeCommand(action: () => any) {
  try {
    const result = action();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
}

// Version and description
program
  .name('@obinexuscomputing/asm')
  .version('1.0.0')
  .description('DOM ASM CLI tool for parsing and analyzing web assets');

// CSS Commands
program
  .command('css')
  .description('CSS related commands')
  .addCommand(
    new Command('parse')
      .argument('<file>', 'CSS file to parse')
      .description('Parse a CSS file')
      .action((file) => {
        executeCommand(() => {
          const validatedPath = validateFile(file);
          // CSS parsing is not implemented yet
          notImplemented('CSS', 'parse');
        });
      })
  );

// HTML Commands
program
  .command('html')
  .description('HTML related commands')
  .addCommand(
    new Command('parse')
      .argument('<file>', 'HTML file to parse')
      .description('Parse an HTML file')
      .action((file) => {
        executeCommand(() => {
          const validatedPath = validateFile(file);
          return parseHTML(validatedPath);
        });
      })
  );

// JavaScript Commands
program
  .command('js')
  .description('JavaScript related commands')
  .addCommand(
    new Command('parse')
      .argument('<file>', 'JavaScript file to parse')
      .description('Parse a JavaScript file')
      .action((file) => {
        executeCommand(() => {
          const validatedPath = validateFile(file);
          // JS parsing is not implemented yet
          notImplemented('JavaScript', 'parse');
        });
      })
  );

// Common options for all commands
program.option('-d, --debug', 'Enable debug output');
program.option('-o, --output <file>', 'Output file (defaults to stdout)');

// Error handling for unknown commands
program.on('command:*', function (operands) {
  console.error(`Error: Unknown command '${operands[0]}'`);
  const availableCommands = program.commands.map(cmd => cmd.name());
  console.error('Available commands:', availableCommands.join(', '));
  process.exit(1);
});

export function run() {
  program.parse(process.argv);
}