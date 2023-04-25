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
