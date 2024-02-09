import inquirer from 'inquirer'
import ora, { type Ora } from 'ora'
import chalk from 'chalk';
import spawn from 'cross-spawn'
import fs from 'fs-extra'
import shell from 'shelljs';
import path from 'path'

class CreateReactCli {
  _projectName: string
  _spinner: Ora
  _cliName: string

  constructor(projectName: string) {
    this._projectName = projectName
    this._cliName = 'create-react'
    this._spinner = ora('Loading...');
    this.start(projectName)
  }

  //部分耗时操作的loading效果
  _loadingStart(text = 'Loading...') {
    this._spinner.text = text;
    this._spinner.start();
  }

  _loadingStop() {
    this._spinner.stop();
  }

  _renamePkgName(targetDir: string, newName: string) {
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = require(pkgPath);
    pkg.name = newName;
    fs.writeJSONSync(pkgPath, pkg, { spaces: 2 });
  };

  _create(template: string, npmClient: string, projectName: string) {
    const TEMPLATE_DIR = path.resolve(__dirname, '../', template);
    const TARGET_DIR = path.resolve(process.cwd(), projectName)
    fs.copySync(TEMPLATE_DIR, TARGET_DIR, { overwrite: true });
    this._renamePkgName(TARGET_DIR, projectName);
    console.log(chalk.green('project is created!'));
    console.log(chalk.yellow('Installing dependencies...'));
    try {
      const initResult = shell.exec('git init', {
        cwd: TARGET_DIR,
        silent: true,
      })
        .toString();
      if (initResult.includes('Initialized empty Git repository')) {
        // success console
        console.log(chalk.green(`✔[${this._cliName}]`), 'Git repo is initialized!');
      } else if (initResult.includes('Reinitialized existing Git repository')) {
        // warn console
        console.log(chalk.yellow(`⚠[${this._cliName}]`), 'This is already a git repo. No need to initialize. Skipped.');
      }
    } catch (e) {
      // error console
      console.log(chalk.red(`✘[${this._cliName}]`), 'Git repo initialize FAILED. You can try again later by hand.');
    }
    // info console
    console.log(chalk.cyan(`ℹ[${this._cliName}]`), 'Installing dependencies...');
    let ps;
    if (npmClient === 'pnpm') {
      ps = spawn('pnpm', ['install'], { cwd: TARGET_DIR, stdio: 'inherit' });
    } else {
      ps = spawn('yarn', [], { cwd: TARGET_DIR, stdio: 'inherit' });
    }

    ps.on('close', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`✘[${this._cliName}]`), 'Installing dependencies FAILED. You can try again later, then use commands:');  
      } else {
        console.log(chalk.green(`✔[${this._cliName}]`), 'Project is created. Have fun!');
      }
    });
  }

  async start(projectName: string) {
    const { template, npmClient } = await inquirer
      .prompt([
        {
          name: 'template',
          message: 'Please select a template.',
          type: "list", // checbox confirm list
          choices: [
            { name: "typescript", value: "templateTypescript" },
            { name: "javascript", value: "template" },
          ],
        },
        {
          name: 'npmClient',
          type: 'list',
          message: 'Please select a npm client',
          choices: [
            { name: "yarn", value: "yarn" },
            { name: "pnpm", value: "pnpm" },
          ],
        },
      ])
    console.log("template: ", template)
    console.log("npmClient: ", npmClient)
    console.log("projectName: ", projectName)

    this._create(template, npmClient, projectName)
  }
}

export default CreateReactCli