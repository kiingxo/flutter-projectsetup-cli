#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .command('run')
  .description('Initialize a new Flutter project with clean architecture structure')
  .action(async () => {
    console.log(chalk.blue('Welcome to the FlutterQuickStart CLI!'));


    if (!isFlutterInstalled()) {
      console.log(chalk.red('Flutter is not installed on your system.'));
      const { installFlutter } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installFlutter',
          message: 'Would you like to install Flutter now?',
          default: true,
        },
      ]);

      if (installFlutter) {
        installFlutterOnSystem();
      } else {
        console.log(chalk.yellow('Flutter installation is required to proceed.'));
        process.exit(1);
      }
    } else {
      console.log(chalk.green('Flutter is already installed.'));
    }

    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter your project name:',
      },
      {
        type: 'confirm',
        name: 'addCleanArchitectureStructure',
        message: 'Do you want to set up a Clean Architecture structure?',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'dependencies',
        message: 'Select additional dependencies to install:',
        choices: [
          { name: 'http', checked: true },
          { name: 'riverpod', checked: true },
          { name: 'equatable', checked: true },
          { name: 'get_it', checked: true },
          { name: 'injectable', checked: true },
          { name: 'json_annotation', checked: true },
          { name: 'retrofit', checked: true },
          { name: 'build_runner', checked: true, value: 'build_runner --dev' },
        ],
      },
    ]);

    const { projectName, addCleanArchitectureStructure, dependencies } = answers;


    console.log(chalk.green(`Creating Flutter project: ${projectName}...`));
    shell.exec(`flutter create ${projectName}`);

    process.chdir(projectName);

 
    if (addCleanArchitectureStructure) {
      console.log(chalk.green('Setting up Clean Architecture structure...'));
      setupCleanArchitectureStructure();
    }

   
    if (dependencies.length > 0) {
      addDependencies(dependencies);
    }

    console.log(chalk.green('Flutter project setup complete!'));
  });

program
  .command('check-flutter')
  .description('Check if Flutter is installed, and install it if not')
  .action(async () => {
    if (!isFlutterInstalled()) {
      console.log(chalk.red('Flutter is not installed on your system.'));
      const { installFlutter } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installFlutter',
          message: 'Would you like to install Flutter now?',
          default: true,
        },
      ]);

      if (installFlutter) {
        installFlutterOnSystem();
      } else {
        console.log(chalk.yellow('Flutter installation is required to proceed.'));
      }
    } else {
      console.log(chalk.green('Flutter is already installed.'));
    }
  });

function isFlutterInstalled() {
  return shell.which('flutter');
}

async function installFlutterOnSystem() {
  console.log(chalk.green('Installing Flutter...'));

  if (shell.which('brew')) {
    shell.exec('brew install --cask flutter');
  } else {
    console.log(chalk.yellow('Homebrew is not installed. You need to install Flutter manually.'));
    console.log(chalk.yellow('Visit https://flutter.dev/docs/get-started/install to download and install Flutter.'));
    process.exit(1);
  }

  if (!shell.exec('which flutter').stdout.includes('flutter/bin')) {
    const flutterPath = '/usr/local/bin/flutter/bin';
    shell.exec(`echo 'export PATH="$PATH:${flutterPath}"' >> ~/.zshrc`);
    shell.exec('source ~/.zshrc');
    console.log(chalk.green('Flutter has been installed and added to your PATH.'));
  } else {
    console.log(chalk.green('Flutter is already in your PATH.'));
  }
}

function setupCleanArchitectureStructure() {
  const basePath = path.join(process.cwd(), 'lib');

  const directories = [
    'core/',
    'features/feature_name/data/datasources',
    'features/feature_name/data/models',
    'features/feature_name/data/repositories',
    'features/feature_name/domain/entities',
    'features/feature_name/domain/repositories',
    'features/feature_name/domain/usecases',
    'features/feature_name/presentation/bloc_or_providers_or_controllers',
    'features/feature_name/presentation/pages',
    'features/feature_name/presentation/widgets',
  ];

  directories.forEach((dir) => {
    const dirPath = path.join(basePath, dir);
    fs.mkdirSync(dirPath, { recursive: true });
  });

  console.log(chalk.green('Clean Architecture structure created successfully!'));
}

function addDependencies(dependencies) {
  console.log(chalk.green('Adding selected dependencies...'));
  const dependenciesString = dependencies.join(' ');
  shell.exec(`flutter pub add ${dependenciesString}`);
  console.log(chalk.green('Dependencies added successfully!'));
}

program.parse(process.argv);