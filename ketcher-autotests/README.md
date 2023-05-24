## Prerequisites

1. You should have [Node.js](https://nodejs.org/en/download/) installed on your machine. Download LTS (long-term support) release compatible with your OS.
2. You should have an IDE (eg. [VS Code](https://code.visualstudio.com/)) and its [extension for Playwright](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) for convenience of running and debugging tests.
3. You should have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed. Choose a proper instruction for your OS. You can use VSCode as a Git client or install another for convenience (eg. [SourceTree](https://www.sourcetreeapp.com/), [GitExtensions](http://gitextensions.github.io/), etc.)
4. Generate an SSH key pair and add it to your GitLab profile, see [how to generate SSH](https://git.epam.com/help/user/ssh.md)

Now you're ready to clone the repository :tada:

## Cloning project and install dependencies

1. Go to a folder on your machine that you will use as your working directory.
2. Clone repository to your working directory using this guide [how to clone Git repo](https://docs.gitlab.com/ee/user/project/repository/#clone-and-open-in-visual-studio-code)
3. Open a terminal, go to your working directory and run `npm install`. This will install the dependencies from `package.json` file.

# Add environment variables to your .env file

In order to run tests across different environments you need to create .env file.

You can use next command to create .env : `cp .env.example .env`
Or you can create it by hand and paste environment variables that are described in this PR [Environment variables] (https://git.epam.com/epm-lsop/ketcher-autotests/-/merge_requests/10)

## Scripts

### `npm t`

Starts running all the tests

### `npm run test:debug`

Starts testing with debugging enabled

### `npm run test -- <any_string>`

where `<any_string>` can be a part of filename, for example. Example: `npm run test -- canvas`. It will run tests in `ketcher-canvas.spec.ts`.

### `npm run test -- --update-snapshots`

Updates screenshots. Run only if you are sure, that functionality has been changed and screenshot is no longer valid.

### `npx playwright codegen <url>`

Starts a playwright codegen tool to simplify the script creation. Check the [codegen documentation](https://playwright.dev/docs/codegen-intro)

## Name of folders in the project

Folders are named the same as structure in Jira

### Check for additional information on Playwright scripts here https://playwright.dev/docs/running-tests#command-line

### UTILS

To search some bond / atom testers can use next methods:

For atoms:

getAtomByIndex - get atom by attributes and index
getTopAtomByAttributes - get top atom by attributes
getRightAtomByAttributes - get right atom by attributes
getBottomAtomByAttributes - get bottom atom by attributes
getLeftAtomByAttributes - get left atom by attributes
getFirstAtomCoordinatesByAttributes - get one atom by attributes

For bonds:

getBondByIndex - get bond by attributes and index
getTopBondByAttributes - get top bond by attributes
getRightBondByAttributes - get right bond by attributes
getBottomBondByAttributes - get bottom bond by attributes
getLeftBondByAttributes - get left bond by attributes
getFirstBondCoordinatesByAttributes - get one bond by attributes

To select tools with nested / sub levels use:

selectNestedTool - select specific tool that has sub / nested levels.

## Docker

- Docker runs automatically in the pipeline after pushing changes to the repository. (It runs tests on the current version of frontend)
- When you want to run tests in Docker on your computer, Docker should be run

Its configuration allows you to work in 2 modes (you should choose one of them):

1. Run only autotests
2. Run ketcher-frontend and autotests.

### Prerequisites:

- **Docker Desktop**
  - How to install for Mac OS: https://docs.docker.com/desktop/install/mac-install/
  - How to install for Windows: https://docs.docker.com/desktop/install/windows-install/
  - How to install for Linux: https://docs.docker.com/desktop/install/linux-install/
- **Build Docker**:
  For build docker, you should choose ONLY ONE way to build ("Autotest" or "Autotest + frontend"):
  - **Autotest**
    - Directory "ketcher-autotests": `npm run docker:autotest:build`
  - **Autotest + frontend**
    - Directory "ketcher": You should build the app: `npm run build`
    - Directory "ketcher": Build autotests for docker:`npm run docker:build:autotests`
- **Choose environment**:
  In the directory "ketcher-autotests" set .env variable the variable KETCHER_URL, where you want to run tests
  - Rc: KETCHER_URL=link_to_rc
  - Frontend in Docker: KETCHER_URL=http://frontend:4002

### Commands

#### Autotest

Run this command in the directory "ketcher-autotests"

- `npm run docker:autotest:start` run all tests
- `npm run docker:autotest:update` run all tests and update snapshots
- `npm run docker:autotest:start name_test_file` run a specific test (point out filename)

- if your command doesn't exist in package.json and you want to run it in the docker container: `npm run docker:autotest any_command`
- if you want to **delete** the docker build, run the next command in the directory "ketcher-autotest": `npn run docker:autotest:delete`

#### Autotest + frontend

Run this command in the directory "ketcher-autotests"

- `npm run docker:test` run all tests
- `npm run docker:update` run all tests and update snapshots
- `npm run docker:test name_test_file` run a specific test (point out filename)
- `npm run docker:debug` run all tests with debugging enabled

- if your command doesn't exist in package.json and you want to run it in the docker container: `npm run docker any_command`
- if you want to **stop** docker, run the next command in the directory "ketcher": `npm run docker:down`
