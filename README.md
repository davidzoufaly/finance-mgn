# Finance Management Tool (ETL)

A lightweight finance management tool that fetches and processes transaction data, leverages OpenAI to
categorize transactions, and integrates with Google Sheets to store, update, and retrieve financial data.
Additionally, it aggregates transaction data from various sources.

## Table of Contents

- [Finance Management Tool (ETL)](#finance-management-tool-etl)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Project Structure](#project-structure)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Install dependencies](#install-dependencies)
  - [Setup configuration](#setup-configuration)
  - [Run](#run)

## Overview

This project automates the management of financial transactions by:

- **Transaction Labeling:** Uses OpenAI to generate categories.
- **Data Integrity:** Validates data before and after processing.
- **Google Sheets Integration:** Reads from and writes to Google Sheets.
- **Data Federation:** Aggregates data from multiple sources.
- **External Data Fetching:** Retrieves attachments and transactions from external services (e.g., Air and
  FIO).

## Project Structure

The project consists of the following main files and directories:

1. **README.md**  
   Provides an overview, configuration, and usage instructions.

2. **package.json**  
   Manages project dependencies and scripts (ensuring packages such as `googleapis`, `dotenv`, and `openai`
   are listed).

3. **.env**  
   Contains environment-specific configurations and credentials (e.g., API tokens, email credentials, Google
   API credentials).

4. **src/constants.mjs**  
   Exports environment variables and constants used throughout the project.

5. **src/labelTransactions.mjs**  
   Merges new and existing transactions, creates composite prompts, calls OpenAI for labeling, and performs
   data integrity checks.

6. **src/googleSheet.mjs**  
   Interacts with Google Sheets to retrieve existing data and update sheets with new transactions.

7. **src/dataFederation.mjs**  
   Aggregates and unifies transaction data from multiple sources to form a consolidated dataset for further
   processing.

8. **src/fetchAirAttachment.mjs**  
   Fetches and processes attachment data from Air, such as PDF files containing financial data.

9. **src/fetchFioTransactions.mjs**  
   Retrieves transaction data from the FIO bank API or similar services.

10. **src/prompts/**  
    Houses text files used as templates for constructing prompts (e.g., `generic-prompt.txt`, and other
    prompt-specific files).

## Configuration

Rename `env.template` as `.env` file in your project root and fill the values.

# Usage

## Install dependencies

Ensure all necessary packages are installed by running:

```shell
npm run install
```

## Setup configuration

If you want to leverage categorization of transactions go to
[expenses.template.txt](./src/prompts/expenses.txt) and [incomes.template.txt](./src/prompts/incomes.txt),
rename them to `expenses.txt` and `incomes.txt` fill your categories identifiers and descriptions.

## Run

Run the app using:

```shell
node index.mjs
```
