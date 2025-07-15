## In progress

- [ ] sheet add savings rate

## Bugs

## Must have

- [ ] sheet exp. p/r a inc. p/r YTD a YTD p/r
- [ ] sheet add expense ratio last month
- [ ] sheet add net income last month
- [ ] sheet add some trend line for expense ratio -> savings ration YTD average
- [ ] Remove seen/unseen logic
- [ ] Google docs cleanup method -> not just last month but also respect specific month when defined
- [ ] Generate new version
- [ ] Fix unit tests

## Nice to have

- [ ] Automated version and changelog generation
- [ ] Add possibility to process multiple months.
- [ ] Add possibility to fetch month(s) to different Google Sheet for ad-hoc analysis.
- [ ] Better unit tests coverage

## Refactor

## Done

- [x] sheet add total expenses monthly level
- [x] sheet add total incomes monthly level
- [x] Enhance email notification -> add there number of transactions for last month, overall values & link to google sheet
- [x] email methods tsdoc
- [x] Generate June
- [x] Retry LLM part 3 times
- [x] Limit number of trasnactions that are sent to LLM. Now all transactions from the whole year are sent. It could be limited for last 150 transactions
- [x] update expenses prompt
- [x] labelovat 04, 05 manuálně v tabulce
- [x] readme add ts compilation to clean code part aka pre-commit job
- [x] sheet new Quarter makro nefunguje správně
- [x] přidat Q2 a Q3 a Q4 exp. p/r a do inc. p/r
- [x] sheet 2025 overview -> Q1/Q2,.. růst výpočet není správně
