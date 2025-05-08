# Finance Management Tool (ETL)

A lightweight finance management tool that fetches and processes transaction data, leverages OpenAI to
categorize transactions, and integrates with Google Sheets to store, update, and retrieve financial data.
Additionally, it aggregates transaction data from various sources.

## Table of Contents

- [Finance Management Tool (ETL)](#finance-management-tool-etl)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Features:](#key-features)
    - [Key Technical Aspects:](#key-technical-aspects)
  - [Configuration](#configuration)
  - [Run](#run)
    - [Supported Flags](#supported-flags)
    - [Commands](#commands)
  - [Contribution Guide](#contribution-guide)
    - [Git Hooks](#git-hooks)

## Overview

### Key Features:

- **External Data Fetching:** Retrieves attachments and transactions from external services (e.g., Air and
  FIO).
- **Data Federation:** Aggregates data from multiple sources.
- **Transaction Labeling:** Uses OpenAI to generate categories.
- **Data Integrity:** Validates data after labeling.
- **Google Sheets Integration:** Reads from, cleans, and writes to Google Sheets.

### Key Technical Aspects:

- **Cleanup:** If an operation fails, cleanup is performed automatically.
- **Error Handling:** All errors are propagated to the top level and properly caught and logged.
- **Testing:** The app is covered by both integration tests and unit tests.
- **Logging:** Every action is logged to the console.
- **Developer Experience:** DX is enhanced using Prettier, EditorConfig, and environment variables (`.env`).

## Configuration

Note: As step 4 and 5 are optimal one of them needs to be set -> app cannot work properly without a "data source".

1. **Install Dependencies**

   Ensure all necessary packages are installed by running:

   ```shell
   yarn install
   ```

2. **Set Up Environment Variables**

   Rename `.env.template` to `.env` in your project root.

3. **Google Sheets Integration**

   - It is recommended to use two different Google Sheets files: one for development/testing and another for
     production.
   - Google Sheets identifiers must be copied from the URL and set in [./.env](.env) for `GOOGLE_SHEET_ID_PROD` and `GOOGLE_SHEET_ID_DEV` (optional).
   - Google Sheets sharing settings must be set to "Everyone with the link can edit."
   - At [this link](https://docs.google.com/spreadsheets/d/1Izk8IJrqmZxZtTmh4nCfjaUFT2m6Uf_YKNHiCh0ulzI/edit?usp=sharing) you can copy generic template with all calculations prepared
   - **Authentication:**
     - A Google Sheets service account must be created, and the credentials file (`service-account.json`) must
       exist in the root folder of this project.
     - Follow [this tutorial](https://support.google.com/a/answer/7378726?hl=en) to create a service account:
       1. In Google Cloud, create a new project.
       2. Enable the Google Sheets API.
       3. Under "Credentials," create a service account.
       4. Generate a JSON key for the account, which will be downloaded automatically.
       5. Place the JSON file in the root folder of this project.

   Note: Some data sources need to be configured. It can be FIO Bank, AIR Bank, or a custom source (e.g., parsing
   transaction PDFs from other banks).

4. **FIO Bank (Optional)**

   1. Go to your internet banking settings -> API.
   2. Add a new token.
   3. Select the requested bank account, set the token validity (maximum of 6 months), mark it as read-only,
      and enable the "prolong validity when logged in" option.
   4. Authorize the token creation.
   5. Copy the token value and paste it into your [./.env](.env) file for `FIO_TOKEN`.

   Note: If you need to modify FIO API calls, refer to
   [their documentation](https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf).

5. **AIR Bank (Optional)**

   - Go to your internet banking
   - Go to Accounts and Cards -> Options -> Setting up statement sending.
   - Set sending into your mailbox (default mail tight to air bank account) OR you can set different email via "Statement sending for others settings".
   - Make sure you picked "monthly" sending.
   - First email should arrive first day of the next month at 7am CET.
   - By default email attachment is password protected by phone number tight to air bank account
   - Add `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_HOST`, `AIR_ATTACHMENT_PASSWORD` in [./.env](.env)

   Note: It is not possible to use gmail as it does not support basic authentication. For example you can use email by Seznam.cz.

6. **OpenAI Integration (Optional)**

   - If you want to enable transaction categorization, folow these steps.

   1. rename the following files and fill in your category
      identifiers and descriptions:

   - `./src/static/prompts/expenses.template.txt` -> `./src/static/prompts/expenses.txt`
   - `./src/static/prompts/incomes.template.txt` -> `./src/static/prompts/incomes.txt`
     Register & Sign-in to [OpenAI developer platform](https://platform.openai.com)

   2. Go to Settings -> Organization -> Billing
   3. Add credit balance (5USD is enough for more than a year of monthly execution -> depends on used model, price changes, number of transactions, if you will do more frequent tests etc.)
   4. Create new project
   5. Go to API keys
   6. Create new secret key -> owned by you, fill name, assign project, permissions all -> create secret key
   7. Copy the key value and add it to [./.env](.env) for OPENAI_TOKEN.

   Note: Default model for development is `gpt-4o-mini` as is fast and cheap, for production `o3-mini` is used as it returns good results and reliable output structure

7. **Other `.env` Values**

## Run

### Supported Flags

The application and integration tests support the following flags:

| Flag           | Shortcut | Values                  | Default     |
| -------------- | -------- | ----------------------- | ----------- |
| --environment  | -e       | development, production | development |
| --withLabeling | -w       | boolean                 | undefined   |
| --actions      | -a       | all, mail, fio          | undefined   |
| --cleanup      | -c       | all, mail, sheets       | undefined   |

Integration tets supports one additional flag to target specific test cases identifiers which should be used standalone, without combination of flags mentioned above.

| Flag | Shortcut | Type  | Values  | Default |
| ---- | -------- | ----- | ------- | ------- |
| --id | -i       | array | 1,..,27 | []      |

Note: If flags are omitted and `.env` values are not properly configured, the app will throw an error. In code these flags are called 'app arguments'.

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

- To reset the environment (delete the last month of data in the sheet and mark emails as unread), run:

  ```shell
  yarn cleanup:all
  ```

- To run integration tests (supports flags described in [Supported Flags](#supported-flags)):

  ```shell
  yarn test:integration
  ```

  Note: Intregration tests also accepts flag `--id` to run specific test case(s) by id.

  Example using id:

  ```shell
  yarn test:integration --id 12 25 5
  ```

- To run unit tests (by default in watch mode), run:

  ```shell
  yarn test:unit
  ```

- To build applucation, run:

  ```shell
  yarn build
  ```

- To start generate documentation, run:

  ```shell
  yarn docs:generate
  ```

- To start documentation server, run:

  Note:

  ```shell
  yarn docs:start
  ```

  - To create new version, run:

  Note:

  ```shell
  yarn release
  ```

## Contribution Guide

### Git Hooks

- Git hooks are configured by [Lefthook](https://github.com/evilmartians/lefthook) in
  [lefthook.yaml](./lefthook.yml).
- If hooks are updated / added there is need to run `yarn lefthook install`.
- Repository is using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and they are
  enforced by `commitlint` in `commit-msg` hook.
- Repository code is formatted by [Biome](https://biomejs.dev/) and [.editorconfig](./.editorconfig) in `pre-commit` hook.
- Quality check is done by [Biome](https://biomejs.dev/) in `pre-commit` hook.

### Imports

Imports are using aliases "@", they works across the project and they are set [tsconfig](./tsconfig.json)

### Typedoc

All objects (methods, contants, type, classes) has to be exported even when they are used within single module, otherwise typedoc won't include it. There are two commands related to documentation, one is for generating documentation and second one for starting the server.

### Versioning

Versioning is done via single yarn script, it bumbs version in [package.json](./package.json), create version in [CHANGELOG.md](./CHANGELOG.md)
