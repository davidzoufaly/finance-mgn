// note lognout transakce a podle mě se nepropisují správně některé fieldy např. č. účtu v poznámce a proto nejde KB na B4 nebo zpráva pro příjemce

# In progress

# Bugs

- [ ] KB převod se nepropisuje na domácnost na B4 -> prompt / trvalka note -> mělo by jet -> w8 for another month

# Must have

- [ ] propisovat do google sheets zpravu pro prijemce FIO

# Refactor

# Nice to have

- [ ] New Year Macro
- [ ] Better unit tests coverage

# Done

- [x] upravit Investments -> Trading 212
- [x] opravit new quarter macro i s homepage

I was struggling to keep control of my budget: multiple bank accounts, clunky or expensive third-party apps with limited flexibility, and too much manual work exporting data and processing it in Sheets/Excel — it just didn’t work for me.

So, since January, I’ve been building this, and today I’m ready to share it 🎉

A lean Automation that:

- Pulls monthly transactions from Fio Bank & Air Bank
- Optionally assigns category IDs to each transaction using AI
- Writes everything to Google Sheets
- Sends a clean summary to my inbox

It runs automatically on the 1st of every month. I spend ~3 minutes sanity-checking categories, and I’m done. I also built a few sheets on top of these data with KPIs, charts, and drill-down options (the template is open-sourced as well).

Cost: Free if you skip AI; if you want AI labeling, just bring your own OpenAI token.

Repo: https://github.com/davidzoufaly/finance-mgn

#opensource #fintech #ETL #TypeScript #GoogleSheets #automation
