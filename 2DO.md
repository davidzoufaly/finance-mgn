## In progress

- ( ) zod? -> tip for other with working with LLM
- ( ) function comments
- ( ) generated doc

## Bugs

- ( ) Tabulka 2025 -> po přidání nového Q v Progress -> check jestli jsou správně data -> pokud ne upravit makro
- ( ) Pri gitu biome import sort někdy prehaze import a neni to commitnuté

## Must have

## Nice to have

- ( ) move configs to /configs

---

- ( ) unit tests
- ( ) ci/cd unit tests
- ( ) ci/cd integration tests

---

- ( ) changelog and versioning
- ( ) make repo public
- ( ) polish readme (add new scripts,..)
- ( ) contribution guide as separate md
- ( ) protected branch
- ( ) hosted docs -> github pages

---

- ( ) CRON prod execution -> github action
- ( ) email notification -> success / failure of upload

---

- ( ) limit počet transakcí co se posílá do LLM např. jen poslední + 5 předtím -> LLM kontext + tokens savings
- ( ) fetch vícero měsíců (pokud zapomenu) přes argument v main funkci
- ( ) fetch jednoho měsíce v minulosti
- ( ) fetch i vícero měsíců do jiného sheetu pro ad-hoc analýzu

---

## Refactor

## Done

- (x) cleanups in mainFlow.mjs
- (x) integration tests support --actions none instead of only --actions=none
- (x) Run agregation tests based on ID
- (x) 🏁 All [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object] tests completed
- (x) Tabulka 2025 overview chyby ve vzorci -> expected
- (x) public google sheet
- (x) OSS -> README guide how to OpenAI
- (x) OSS -> README airbank setup
- (x) unique emoji
- (x) Some transactions were lost by LLM process for incomes: pre-LLM 12 vs. post-LLM 12
- (x) otestovat -> integration tests run
- (x) open ai model as env
- (x) smazat js files
- (x) aliases imports
- (x) semicolons biome
- (x) building and running of unit tests
- (x) compiled test-runner -> jak poustet?
- (x) organize imports -> biome -> only formatter?
- (x) tsc check pre commit
- (x) typescript
- (x) fix biome errors
- (x) biome
- (x) license file
- (x) pre-commit format
- (x) pre-commit hook na conv. commits
- (x) squash commits git
- (x) OSS -> README google sheet setup -> dev / prod -> public
- (x) OSS -> README guide how to create google credentials
- (x) OSS -> readme co se stane kdyz neni pritomny open ai token
- (x) OSS -> README fio setup
- (x) OSS -> readme jak vytvořit google acc
- (x) smazat DS.store
- (x) testy by se měli pouštěd maximálně 30s po předchozím, ne dříve
- (x) clear completed -> ale email nebyl resetnuty
- (x) otestovat actions -> all, fio, mail
- (x) integration tests
- (x) testy nerespektují conditions - vola se LLM i když je withLabeling=false
- (x) prevést testy na JS pro automatizaci testu?
- (x) sheets -> spreadsheets.values.clear pred cleanupem i jindy?
- (x) parallel labeling
- (x) is better to throw error or process.exit
- (x) reset environent for testing -> cleanup -> test / prod? -> diff. sheet?
- (x) change data federation check -> end user can have only air/fio -> some config for main? what to execute
- (x) .env variables checks
- (x) OSS it -> incomes and expenses prompt generic
- (x) unify date functions -> extract it to helper functions
- (x) switch to o3-mini
- (x) credentials to env
- (x) prošlo to Chatem a nepřidalo to jedinou kategorii
- (x) přehodit transance -> reverse -> radi se unor pod leden
- (x) refactor to lambda functions
- (x) spawning of dropdowns in google sheets is bugy
- (x) switch na airbank mail
- (x) trycatch -> data2 in dataFederation.mjs are not iterable (když mam email jako "read" např.),..
- (x) better success logs
- (x) category incomes
- (x) check integrity dat => počet řádku co jde do LLM a počet co z nich vyleze musí sedět přidat do pipeline
- (x) check jestli objekt z LLM odpovida očekávánemu
- (x) smazat "successfully" z console logu
- (x) LLM na automatické kategorizování
- (x) Dashboard in Google Sheets -> charts
- (x) Incomes 2.0 stejně jako expenses
- (x) Trading 212 do 3. sheetu investments
- (x) investments better sheet
- (x) kategorie prijmy sheet
- (x) gmail fetch airbank mail pouze adekvatni mesice ->
  (imap-simple)(https://www.npmjs.com/package/imap-simple)
- (x) filtrovat prevody mezi mými účty lépe -> airbank neparsuju bank account ID -> filtrovat skrz label
- (x) incomes from airbank suspicious -> fix parsování větších transakcí
- (x) napojit air bank
- (x) odfiltrovat prevody na AIR bank
- (x) odfiltrovat prevody na FIO obch.
- (x) dynamic date req
- (x) A => ID, vyloučit z getu
- (x) fetch attachment -> pass the password
- (x) save AIR bank data
- (x) new column to expenses -> FIO/AIR
- (x) poc -> pdf to json
