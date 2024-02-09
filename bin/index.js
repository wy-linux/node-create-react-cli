#!/usr/bin/env node
const { program } = require('commander');
const pkg = require('../package.json');

// 使用ts-node加载ts文件
require('ts-node').register({
  project: require.resolve('../tsconfig.json'),
  transpileOnly: true,
  ignore: [
    `(?:^|/)node_modules/(\\.pnpm/)?(?!.*${pkg.name})`,
  ],
});

// 读取用户手动传入的 项目名称
program
  .name('create-react')
  .argument("<project-name>", "create a react project")
  // .command("*")
  // .description("create a react project")
  .action((projectName) => {
    const CreateReactCli = require('./create').default;
    new CreateReactCli(projectName)
  });

program.parse(process.argv)


