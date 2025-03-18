## In progress
- [ ] OSS -> README fio setup

## Must have

- [ ] OSS -> readme co se stane kdyz neni pritomny open ai token
- [ ] OSS -> README guide how to create OpenAI token
- [ ] OSS -> README guide how to create google credentials
- [ ] OSS -> README airbank setup
- [ ] OSS -> README google sheet setup -> dev / prod -> public
- [ ] squash commits git

## Nice to have

- [ ] unit tests
- [ ] public google sheet
- [ ] typescript
- [ ] changelog and versioning
- [ ] function comments
- [ ] generated docs
- [ ] ci/cd tests
- [ ] ci/cd tests email notification
- [ ] CRON prod execution -> lambda
- [ ] pre-commit hook na conv. commits
- [ ] pre-commit format
- [ ] unique emojis
- [ ] eslint?
- [ ] run failed integration test twice? -> at the end after all are done
- [ ] limit počet transakcí co se posílá do LLM např. jen poslední + 5 předtím -> LLM kontext + tokens savings
- [ ] fetch vícero měsíců (pokud zapomenu) přes argument v main funkci
- [ ] fetch jednoho měsíce v minulosti
- [ ] fetch i vícero měsíců do jiného sheetu pro ad-hoc analýzu
- [ ] protected branch

## Bugs

## Refactor
- [ ] cleanups in mainFlow.mjs

## Done

- [x] OSS -> readme jak vytvořit google acc
- [x] smazat DS.store
- [x] testy by se měli pouštěd maximálně 30s po předchozím, ne dříve
- [x] clear completed -> ale email nebyl resetnuty
- [x] otestovat actions -> all, fio, mail 
- [x] integration tests
- [x] testy nerespektují conditions - vola se LLM i když je withLabeling=false
- [x] prevést testy na JS pro automatizaci testu?
- [x] sheets -> spreadsheets.values.clear pred cleanupem i jindy?
- [x] parallel labeling
- [x] is better to throw error or process.exit
- [x] reset environent for testing -> cleanup -> test / prod? -> diff. sheet?
- [x] change data federation check -> end user can have only air/fio -> some config for main? what to execute
- [x] .env variables checks
- [x] OSS it -> incomes and expenses prompt generic
- [x] unify date functions -> extract it to helper functions
- [x] switch to o3-mini
- [x] credentials to env
- [x] prošlo to Chatem a nepřidalo to jedinou kategorii
- [x] přehodit transance -> reverse -> radi se unor pod leden
- [x] refactor to lambda functions
- [x] spawning of dropdowns in google sheets is bugy
- [x] switch na airbank mail
- [x] trycatch -> data2 in dataFederation.mjs are not iterable (když mam email jako "read" např.),..
- [x] better success logs
- [x] category incomes
- [x] check integrity dat => počet řádku co jde do LLM a počet co z nich vyleze musí sedět přidat do pipeline
- [x] check jestli objekt z LLM odpovida očekávánemu
- [x] smazat "successfully" z console logu
- [x] LLM na automatické kategorizování
- [x] Dashboard in Google Sheets -> charts
- [x] Incomes 2.0 stejně jako expenses
- [x] Trading 212 do 3. sheetu investments
- [x] investments better sheet
- [x] kategorie prijmy sheet
- [x] gmail fetch airbank mail pouze adekvatni mesice ->
      [imap-simple](https://www.npmjs.com/package/imap-simple)
- [x] filtrovat prevody mezi mými účty lépe -> airbank neparsuju bank account ID -> filtrovat skrz label
- [x] incomes from airbank suspicious -> fix parsování větších transakcí
- [x] napojit air bank
- [x] odfiltrovat prevody na AIR bank
- [x] odfiltrovat prevody na FIO obch.
- [x] dynamic date req
- [x] A => ID, vyloučit z getu
- [x] fetch attachment -> pass the password
- [x] save AIR bank data
- [x] new column to expenses -> FIO/AIR
- [x] poc -> pdf to json
