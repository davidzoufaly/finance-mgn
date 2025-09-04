## In progress

## Bugs

## Must have

- [ ] Drill to expenses filtered by month and category from exp. p/r

## Refactor

- [ ] Převést targetMonth na date format v main funkci a nemuset jej převádět na více místech unvitř aplikace. Je potřeba někde string?

## Nice to have

- [ ] Add possibility to process multiple months.
- [ ] Add possibility to fetch month(s) to different Google Sheet for ad-hoc analysis.
- [ ] Better unit tests coverage

## Done

- [x] Generate new version
- [x] Automated version and changelog generation
- [x] Fix unit tests
- [x] Enhance readme - in key technical aspects in DX refer to contribution guidde
- [x] Google docs cleanup method -> not just last month but also respect specific month when defined
- [x] refactor cleanup google sheets to smaller function called 3times
- [x] Remove seen/unseen logic
- [x] upravit výdaje na domácnost -> nový nájem
- [x] sheet nejlepší kategorie ? pod budget co není 0?
- [x] sheet overview nejproblemovejsi kategorie absolutně + relativně, QTD, YTD
- [x] sheet Overview Růst / Plán YTD překlopit na uzavřené Q ne na poslední uzavřený měsíc
- [x] srpen kategorie check
- [x] nesedí výdaje v mailu a výdaje v expenses sheet (částka)
- [x] zbavit se #DIV/0! pomocí =IFERROR()
- [x] sheet investice plan, investice YTD, investice cil / ytd, cil ytd / investice ytd
- [x] sheet add some trend line chart for expenses, incomes, expense ratio -> savings ration YTD average monthly granularity
- [x] sheet add some trend line chart for expenses, incomes, expense ratio -> savings ration YTD average quarterly granularity
- [x] sheet overview 2025 - růst -> přidat metriky cíl / růst ytd, cíl YTD / růst YTD
- [x] sheet exp. p/r a inc. p/r YTD a YTD p/r
- [x] sheet add net income last month
- [x] sheet add expense ratio last month
- [x] sheet add savings rate
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
