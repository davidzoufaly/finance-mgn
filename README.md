# Finance Management Tool (ETL)

A lightweight finance management tool that fetches and processes transaction data for a specific month. By default, the app works with the last full month; the targeted month cannot be older than 3 months due to FIO API limitations. It leverages OpenAI to
categorize transactions, and integrates with Google Sheets to store, update, and retrieve financial data.
It aggregates transaction data from various sources (FIO bank and AIR bank).

## Table of Contents

- [Finance Management Tool (ETL)](#finance-management-tool-etl)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Features](#key-features)
    - [Key Technical Aspects](#key-technical-aspects)
  - [Configuration](#configuration)
  - [Run](#run)
    - [Supported Flags](#supported-flags)
    - [Commands](#commands)
  - [Automation Trigger](#automation-trigger)
  - [Contribution Guide](#contribution-guide)
    - [Clean Code](#clean-code)
    - [Imports](#imports)
    - [Typedoc](#typedoc)
    - [Versioning](#versioning)
    - [TODO](#todo)

## Overview

### Key Features

- **External Data Fetching:** Retrieves attachments and transactions from external services (Air bank and
  FIO bank).
- **Data Federation:** Aggregates data from multiple sources.
- **Transaction Labeling:** Uses OpenAI to assign proper categories.
- **Data Integrity:** Validates data after labeling - number of transactions and transactions values.
- **Google Sheets Integration:** Reads from, cleans, and writes to Google Sheets.
- **Automation:** The entire ETL process is automated using GitHub Actions and email notification is sent after successfull run.

### Key Technical Aspects

- **Cleanup:** If an operation fails, cleanup is performed automatically.
- **Error Handling:** All errors are propagated to the top level and properly caught and logged.
- **Testing:** The app includes both integration tests and few unit tests.
- **Logging:** Every action is logged to the console.
- **Developer Experience:** DX is enhanced using Biome, EditorConfig, and environment variables (`.env`).

## Configuration

Note: Steps 4 and 5 are optional, but at least one must be configured — the app cannot function properly without a data source.

1. **Install Dependencies**

   Ensure all necessary packages are installed by running:

   ```shell
   yarn install
   ```

2. **Set Up Environment Variables**

   Rename `.env.template` to `.env` in your project root.

3. **Google Sheets Integration**

   - It is recommended to use two separate Google Sheets: one for development/testing and another for
     production.
   - Google Sheets identifiers must be copied from the URL and set in [./.env](.env) for `GOOGLE_SHEET_ID_PROD` and optionally `GOOGLE_SHEET_ID_DEV`.
   - Google Sheets sharing settings must be set to "Anyone with the link can edit."
   - You can copy a generic template with all calculations from [this link](https://docs.google.com/spreadsheets/d/1Izk8IJrqmZxZtTmh4nCfjaUFT2m6Uf_YKNHiCh0ulzI/edit?usp=sharing).
   - **Authentication:**
     - A Google Sheets service account must be created, and the credentials file (`service-account.json`) must
       exist in the root folder of this project.
     - Follow [this tutorial](https://support.google.com/a/answer/7378726?hl=en) to create a service account:
       1. In Google Cloud, create a new project.
       2. Enable the Google Sheets API.
       3. Under "Credentials," create a service account.
       4. Generate a JSON key, which will be downloaded automatically.
       5. Place the JSON file in the root folder of this project.

   Note: Some data sources must be configured. These can be FIO Bank, AIR Bank, or a custom source (e.g., parsing transaction PDFs from other banks).

4. **FIO Bank (Optional)**

   1. Go to your internet banking settings -> API.
   2. Create a new token.
   3. Select the desired bank account, set the token validity (maximum of 6 months), mark it as read-only,
      and enable the "prolong validity when logged in" option.
   4. Authorize the token creation.
   5. Copy the token value and paste it into your [./.env](.env) file as `FIO_TOKEN`.

   Note: If you need to modify FIO API calls, refer to the [official documentation](https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf).

5. **AIR Bank (Optional)**

   - Go to your internet banking.
   - Navigate to Accounts and Cards -> Options -> Statement sending setup.
   - Set delivery to your mailbox (the default email tied to the AIR Bank account), or configure a different email under "Statement sending for others."
   - Ensure you selected "monthly" sending.
   - The first email should arrive on the first day of the following month at 7 AM CET.
   - By default, the email attachment is password-protected using the phone number tied to the AIR Bank account.
   - Add `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_IMAP_SERVER`, `EMAIL_IMAP_PORT`, and `AIR_ATTACHMENT_PASSWORD` in [./.env](.env).

   Note: Gmail is not supported due to the lack of basic authentication. You can use email providers such as Seznam.cz.

6. **OpenAI Integration (Optional)**

   - To enable transaction categorization, follow these steps:

   1. Rename the following files and fill in your category identifiers and descriptions:

      - `./src/static/prompts/expenses.template.txt` -> `./src/static/prompts/expenses.txt`
      - `./src/static/prompts/incomes.template.txt` -> `./src/static/prompts/incomes.txt`

      Register and sign in to the [OpenAI developer platform](https://platform.openai.com)

   2. Go to Settings -> Organization -> Billing.
   3. Add credit (e.g., $5 is sufficient for more than a year of monthly execution, depending on usage).
   4. Create a new project.
   5. Go to API Keys.
   6. Create a new secret key — fill in the name, assign the project, select full permissions, then create.
   7. Copy the key value and add it to [./.env](.env) as `OPENAI_TOKEN`.

   Note: The default model for development is `gpt-4o-mini` for its speed and cost-efficiency. In production, `o3-mini` is used for its reliable output structure.

## Run

### Supported Flags

The application and integration tests support the following flags:

| Flag           | Shortcut | Type    | Values                  | Default     |
| -------------- | -------- | ------- | ----------------------- | ----------- |
| --environment  | -e       | string  | development, production | development |
| --withLabeling | -w       | boolean | true, false             | undefined   |
| --actions      | -a       | string  | all, mail, fio          | undefined   |
| --cleanup      | -c       | string  | all, mail, sheets       | undefined   |
| --month        | -m       | string  | MM-yyyy                 | undefined   |

Integration tests support one additional flag to target specific test case identifiers. It should be used standalone, without other flags.

| Flag | Shortcut | Type  | Values  | Default |
| ---- | -------- | ----- | ------- | ------- |
| --id | -i       | array | 1,..,27 | []      |

Note: If flags are omitted and `.env` values are not properly configured, the app will throw an error. In the code, these flags are referred to as "app arguments."

### Commands

Start commands support flags for configuring the application.

- To start the application in development mode, run:

  ```shell
  yarn start
  ```

- To start the application in production mode, run:

  ```shell
  yarn start:prod
  ```

- To reset the environment (delete the last month of data and mark emails as unread), run:

  ```shell
  yarn cleanup:all
  ```

- To run integration tests (supports flags described above):

  ```shell
  yarn test:integration
  ```

  Note: Integration tests also accept the `--id` flag to run specific test case(s) by ID.

  Example:

  ```shell
  yarn test:integration --id 12 25 5
  ```

- To run unit tests run:

  ```shell
  yarn test:unit
  ```

  Note: Unit tests are also triggered on merge to main via Github Action and can be run in watch mode using `yarn test:watch`

- To build the application, run:

  ```shell
  yarn build
  ```

- To generate documentation, run:

  ```shell
  yarn docs:generate
  ```

- To start the documentation server, run:

  ```shell
  yarn docs:start
  ```

- To create a new version, run:

  ```shell
  yarn release
  ```

## Automation Trigger

To use the monthly automation GitHub Action for the entire ETL process after forking the repository, set up additional secrets beyond those listed in [.env.template](.env.template): `EMAIL_SMTP_SERVER`, `EMAIL_SMTP_PORT`, and `EMAIL_USERNAME_CI_NOTIFICATION`. The action can be triggered manually via the GitHub UI with all supported flags.

After the automation completes, an email notification is sent to the address specified by `EMAIL_USERNAME_CI_NOTIFICATION`. This email contains a detailed monthly financial summary, including the number and total value of expenses, incomes, and investments for the last month, as well as key metrics like net income, savings rate, and expense ratio. The email also includes a direct link to the relevant Google Sheet with all financial data, and workflow details such as repository, workflow name, run ID, and trigger time. The email is formatted in HTML for clarity and readability.

## Contribution Guide

### Clean Code

- Git hooks are configured by [Lefthook](https://github.com/evilmartians/lefthook) in
  [lefthook.yaml](./lefthook.yml).
- After updating or adding hooks, run `yarn lefthook install`.
- The repository uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), enforced by `commitlint` in the `commit-msg` hook.
- Code formatting is handled by [Biome](https://biomejs.dev/) and [.editorconfig](./.editorconfig) via the `pre-commit` hook.
- Code quality checks are also performed using [Biome](https://biomejs.dev/) in the `pre-commit` hook.
- Type check is performed using TSC in the `pre-commit` hook.

### Imports

Imports use the "@" alias configured in [tsconfig](./tsconfig.json) and work project-wide. Vitest may execute files outside the test scope, so in `.test.ts` files, prefer relative imports instead of using the index via aliases or directly.

### Typedoc

All objects (methods, constants, types, classes) must be exported, even if used in a single module — otherwise, Typedoc won't include them. Two commands exist for documentation: one generates the docs, the other starts the server. Documentation is also hosted via GitHub Pages [here](https://davidzoufaly.github.io/finance-mgn/), served directly from the main branch.

### Versioning

Versioning is handled via a single yarn script `yarn version`. It bumps the version in [package.json](./package.json) and creates a version entry in [CHANGELOG.md](./CHANGELOG.md).

### TODO

Ideas what could be added is written in [2DO.md](./2DO.md) file.
