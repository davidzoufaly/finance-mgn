## In progress

- [ ] Enhance email notification -> add there number of transactions for last month, overall values & link to google sheet
- [ ] sheet exp. p/r a inc. p/r YTD a YTD p/r
- [ ] email methods tsdoc

## Bugs

## Must have

- [ ] Remove seen/unseen logic
- [ ] Google docs cleanup method -> not just last month but also respect specific month when defined
- [ ] Generate new version
- [ ] Fix unit tests

## Nice to have

- [ ] delete email-body.txt after run
- [ ] Automated version and changelog generation

---

- [ ] Add possibility to process multiple months.
- [ ] Add possibility to fetch month(s) to different Google Sheet for ad-hoc analysis.
- [ ] Better unit tests coverage

## Refactor

## Done

- [x] Generate June
- [x] Retry LLM part 3 times
- [x] Limit number of trasnactions that are sent to LLM. Now all transactions from the whole year are sent. It could be limited for last 150 transactions
- [x] update expenses prompt
- [x] labelovat 04, 05 manuálně v tabulce
- [x] readme add ts compilation to clean code part aka pre-commit job
- [x] sheet new Quarter makro nefunguje správně
- [x] přidat Q2 a Q3 a Q4 exp. p/r a do inc. p/r
- [x] sheet 2025 overview -> Q1/Q2,.. růst výpočet není správně
