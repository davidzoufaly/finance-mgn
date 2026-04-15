# Graph Report - .  (2026-04-15)

## Corpus Check
- Corpus is ~36,917 words - fits in a single context window. You may not need a graph.

## Summary
- 124 nodes · 158 edges · 26 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Project Config & Integrations|Project Config & Integrations]]
- [[_COMMUNITY_Core ETL Pipeline|Core ETL Pipeline]]
- [[_COMMUNITY_Dashboard & Metrics|Dashboard & Metrics]]
- [[_COMMUNITY_Transaction Labeling|Transaction Labeling]]
- [[_COMMUNITY_Email Report Generation|Email Report Generation]]
- [[_COMMUNITY_Planned Bank Integrations|Planned Bank Integrations]]
- [[_COMMUNITY_Air Bank PDF Parsing|Air Bank PDF Parsing]]
- [[_COMMUNITY_Email Attachment Fetching|Email Attachment Fetching]]
- [[_COMMUNITY_Integration Testing|Integration Testing]]
- [[_COMMUNITY_Dev Tooling & CI|Dev Tooling & CI]]
- [[_COMMUNITY_Fio Bank API|Fio Bank API]]
- [[_COMMUNITY_Documentation Export|Documentation Export]]
- [[_COMMUNITY_Tsup Build Config|Tsup Build Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_Type Definitions|Type Definitions]]
- [[_COMMUNITY_Types Index|Types Index]]
- [[_COMMUNITY_App Arguments|App Arguments]]
- [[_COMMUNITY_Constants Index|Constants Index]]
- [[_COMMUNITY_Features Index|Features Index]]
- [[_COMMUNITY_Utils Index|Utils Index]]
- [[_COMMUNITY_Test Cases|Test Cases]]
- [[_COMMUNITY_Test Main|Test Main]]
- [[_COMMUNITY_Test Subset Tests|Test Subset Tests]]
- [[_COMMUNITY_Tests Index|Tests Index]]
- [[_COMMUNITY_Sheet Cleanup|Sheet Cleanup]]

## God Nodes (most connected - your core abstractions)
1. `mainFlow()` - 12 edges
2. `Finance Management Tool (ETL)` - 10 edges
3. `fetchEmailAttachment()` - 7 edges
4. `createEmailBody()` - 7 edges
5. `labelTransactions()` - 6 edges
6. `cleanupGoogleSheetsSheet()` - 5 edges
7. `runTests()` - 5 edges
8. `OpenAI Integration` - 5 edges
9. `Google Sheets Integration` - 5 edges
10. `Income Categories` - 5 edges

## Surprising Connections (you probably didn't know these)
- `mainFlow()` --calls--> `getSheetId()`  [INFERRED]
  src/features/main.ts → src/constants/constants.ts
- `createEmailBody()` --calls--> `getLastMonth()`  [INFERRED]
  src/features/createEmailBody.ts → src/constants/constants.ts
- `Finance Management Tool (ETL)` ----> `David Zoufaly`  [EXTRACTED]
  README.md → LICENSE.md
- `Finance Management Tool (ETL)` ----> `MIT License`  [EXTRACTED]
  README.md → LICENSE.md
- `Finance Management Tool (ETL)` ----> `Zod`  [EXTRACTED]
  README.md → CHANGELOG.md

## Hyperedges (group relationships)
- **ETL Pipeline Flow** —  [INFERRED 0.90]
- **LLM Prompt Composition System** —  [INFERRED 0.88]
- **Developer Experience Toolchain** —  [INFERRED 0.85]

## Communities

### Community 0 - "Project Config & Integrations"
Cohesion: 0.12
Nodes (22): Air Bank, CodeQL, Data Federation, David Zoufaly, Monthly Financial Email Report, Expense Categories, Expense Categories Template, Finance Management Tool (ETL) (+14 more)

### Community 1 - "Core ETL Pipeline"
Cohesion: 0.21
Nodes (12): dataFederation(), normalizeDates(), cleanupGoogleSheets(), cleanupGoogleSheetsSheet(), clearSheetData(), configurationCheck(), filterOutTargetMonth(), getExistingDataFromSheet() (+4 more)

### Community 2 - "Dashboard & Metrics"
Cohesion: 0.23
Nodes (13): Finance Management System, Budget Fulfillment, Savings Trend, Expenses YTD/Plan Ratio, Income YTD/Plan Ratio, Overview Dashboard, Budget Tracking Section, Investice (Investments) Section (+5 more)

### Community 3 - "Transaction Labeling"
Cohesion: 0.24
Nodes (8): getLastMonth(), getOpenAIModel(), getSheetId(), sortByDateDesc(), getValidatedLLMResult(), integrityChecks(), labelTransactions(), labelTransactionsWithRetry()

### Community 4 - "Email Report Generation"
Cohesion: 0.39
Nodes (5): compareIncomesVsExpenses(), createEmailBody(), replaceTemplateVariables(), formatCzechCurrency(), sumValuesAtIndex()

### Community 5 - "Planned Bank Integrations"
Cohesion: 0.29
Nodes (8): Ceska Sporitelna (Planned), Data Integrity Validation, Fio Bank, KB Bank (Planned), ML Classification Idea, Revolut (Planned), TODO / 2DO, Transaction Labeling

### Community 6 - "Air Bank PDF Parsing"
Cohesion: 0.48
Nodes (5): findTransactions(), isTextItemArray(), processPage(), processTransactions(), splitIntoRows()

### Community 7 - "Email Attachment Fetching"
Cohesion: 0.52
Nodes (6): connectToImapServer(), disconnectFromImapServer(), fetchEmailAttachment(), fetchEmails(), openInbox(), validateEmailCredentials()

### Community 8 - "Integration Testing"
Cohesion: 0.48
Nodes (5): getTestsSubset(), runReset(), runTest(), runTests(), sleep()

### Community 9 - "Dev Tooling & CI"
Cohesion: 0.4
Nodes (5): Biome, Changelog, Conventional Commits, Lefthook, Release Please

### Community 10 - "Fio Bank API"
Cohesion: 0.83
Nodes (3): fetchFioTransactions(), getMonthRange(), validateTargetMonth()

### Community 11 - "Documentation Export"
Cohesion: 1.0
Nodes (2): Rationale: Export All Objects for Typedoc, Typedoc

### Community 12 - "Tsup Build Config"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "App Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Type Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Types Index"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "App Arguments"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Constants Index"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Features Index"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Utils Index"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Test Cases"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Test Main"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Test Subset Tests"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Tests Index"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Sheet Cleanup"
Cohesion: 1.0
Nodes (1): Cleanup Mechanism

## Knowledge Gaps
- **13 isolated node(s):** `Data Integrity Validation`, `Cleanup Mechanism`, `Biome`, `Typedoc`, `Changelog` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Documentation Export`** (2 nodes): `Rationale: Export All Objects for Typedoc`, `Typedoc`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tsup Build Config`** (1 nodes): `tsup.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Entry Point`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Type Definitions`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Types Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Arguments`** (1 nodes): `appArguments.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Constants Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Features Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utils Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Cases`** (1 nodes): `integrationTestCases.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Main`** (1 nodes): `integrationTestsMain.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Subset Tests`** (1 nodes): `getTestsSubset.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tests Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sheet Cleanup`** (1 nodes): `Cleanup Mechanism`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mainFlow()` connect `Core ETL Pipeline` to `Fio Bank API`, `Transaction Labeling`, `Email Report Generation`, `Email Attachment Fetching`?**
  _High betweenness centrality (0.356) - this node is a cross-community bridge._
- **Why does `Finance Management Tool (ETL)` connect `Project Config & Integrations` to `Planned Bank Integrations`?**
  _High betweenness centrality (0.352) - this node is a cross-community bridge._
- **Why does `Zod` connect `Project Config & Integrations` to `Transaction Labeling`?**
  _High betweenness centrality (0.297) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `mainFlow()` (e.g. with `getSheetId()` and `fetchEmailAttachment()`) actually correct?**
  _`mainFlow()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `createEmailBody()` (e.g. with `mainFlow()` and `sumValuesAtIndex()`) actually correct?**
  _`createEmailBody()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Data Integrity Validation`, `Cleanup Mechanism`, `Biome` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Config & Integrations` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._