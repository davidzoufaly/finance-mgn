# Finance Management Tool (ETL)

A lightweight finance management tool that fetches and processes transaction data, leverages OpenAI to categorize transactions, and integrates with Google Sheets to store, update, and retrieve financial data. Additionally, it aggregates transaction data from various sources.

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

## Overview

### Key Features:

- **External Data Fetching:** Retrieves attachments and transactions from external services (e.g., Air and FIO).
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

1. **Install Dependencies**

   Ensure all necessary packages are installed by running:

   ```shell
   yarn install
   ```

2. **Set Up Environment Variables**

   Rename `.env.template` to `.env` in your project root.

3. **Google Sheets Integration**

   - It is recommended to use two different Google Sheets files: one for development/testing and another for production (stable financial transactions).
   - Google Sheet identifiers must be copied from the URL and set in `.env`.
   - Google Sheets sharing settings must be set to "Everyone with the link can edit."
   - **Authentication:**
     - A Google Sheets service account must be created, and the credentials file (`service-account.json`) must exist in the root folder of this project.
     - Follow [this tutorial](https://support.google.com/a/answer/7378726?hl=en) to create a service account:
       1. In Google Cloud, create a new project.
       2. Enable the Google Sheets API.
       3. Under "Credentials," create a service account.
       4. Generate a JSON key for the account, which will be downloaded automatically.
       5. Place the JSON file in the root folder of this project.
   - Some data sources need to be configured. It can be FIO Bank, AIR Bank, or a custom source (e.g., parsing transaction PDFs from other banks).

4. **FIO Bank (Optional)**

   - Go to your internet banking settings -> API.
   - Add a new token.
   - Select the requested bank account, set the token validity (maximum of 6 months), mark it as read-only, and enable the "prolong validity when logged in" option.
   - Authorize the token creation.
   - Copy the token value and paste it into your `.env` file.
   - If you need to modify FIO API calls, refer to [their documentation](https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf).

5. **AIR Bank (Optional)**

6. **OpenAI Integration (Optional)**

   - If you want to enable transaction categorization, rename the following files and fill in your category identifiers and descriptions:
     - `expenses.template.txt` -> `expenses.txt`
     - `incomes.template.txt` -> `incomes.txt`

7. **Other `.env` Values**

## Run

### Supported Flags

The application and integration tests support the following flags:

| Flag           | Shortcut | Values                  | Default     |
| -------------- | -------- | ----------------------- | ----------- |
| --environment  | -e       | development, production | development |
| --withLabeling | -w       | boolean                 | true        |
| --actions      | -a       | all, mail, fio, none    | all         |
| --cleanup      | -c       | all, mail, sheets, none | none        |

- If flags are omitted and `.env` values are not properly configured, the app will throw an error.

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

- To run unit tests (by default in watch mode), run:

  ```shell
  yarn test:unit
  ```
