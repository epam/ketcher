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
4. Possible you may need install browsers (f.ex. `npx playwright install chromium`)

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

### Writing tests

You can add _DeploySentinel Recorder_ https://www.deploysentinel.com/docs/recorder extension for Google Chrome. It allows to record user interactions in browser and generate playwright code.

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

- Docker runs automatically in the pipeline after pushing changes to the repository.
- When you want to run tests in Docker on your computer, Docker should be run
- Docker allows creating snapshots independent of the operating system

### Prerequisites:

- **Docker Desktop**
  - How to install for Mac OS: https://docs.docker.com/desktop/install/mac-install/
  - How to install for Windows: https://docs.docker.com/desktop/install/windows-install/
  - How to install for Linux: https://docs.docker.com/desktop/install/linux-install/
- **Build Docker**:
  - Directory "ketcher-autotests": `npm run docker:build`
- **Set environment**:
  In the directory "ketcher-autotests" set .env variable
  - DOCKER=true
  - KETCHER_URL
    - Rc: KETCHER_URL=link_to_rc
    - Local frontend: KETCHER_URL=http://host.docker.internal:port (port where you run application)
  - OPTIONAL: IGNORE_UNSTABLE_TESTS=true (if you want to ignore unstable tests)
- **OPTIONAL: Build frontend**:
  if you want to run tests based on the localhost:4002, you can put KETCHER_URL=http://localhost:4002

### Run tests:

**OPTIONAL: Test Polymer Editor **:
If you want to run tests from Polymer Editor, add `ENABLE_POLYMER_EDITOR=true` in scripts:

- Root package.json: "build:example": "ENABLE_POLYMER_EDITOR=true npm run build -w example";

Also make sure, that test is not skipped! Check if test starts with
`test.skip('We test something', async ({ page }) => {`
Remove "skip" before running.

- **Run app in browser: from root directory "ketcher"**:

- `npm ci`
- `npm run build`
- `npm run serve`

- **Run docker**:

  - `cd ketcher-autotests`
  - `npm run docker:build`
  - `npm run docker:test`

### How to use?

1. Write a test and make sure, that it works on your local machine.
2. Run command npm run docker:test
3. Docker will generate a snapshot for Linux. Make `commit, push` your test and snapshot for Linux in the repository.  
   (snapshot for mac OS and windows will be ignored and won't be in GitHub)

### Commands

Run this command in the directory "ketcher-autotests"

- `npm run docker:test` run all tests
- `npm run docker:test file_name` run tests in a specific file
- `npm run report` show report
- `npm run docker:update` update all snapshots
- `npm run docker:update:test -- "test_title"` update only 1 snapshot with test_title

### Known issues

The "file name too long" error in Git is related to the maximum length of file names in the operating system. In most cases, this happens on Windows systems, where the maximum path length to a file is 260 characters.

One way to work around this limitation in Git is to use the command git config --system core.longpaths true. This command allows Git to work with long file names on Windows that exceed the maximum path length.

If you do not have administrator rights, you can try to modify the Git configuration for the current user using the command git config --global core.longpaths true. This command will modify the Git settings only for your user account, and administrator rights are not required to execute it.
