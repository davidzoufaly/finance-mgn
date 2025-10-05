# In progress

# Bugs

# Must have

# Refactor

# Nice to have

- [ ] New Year Macro
- [ ] Better unit tests coverage
- [ ] Squash and merge -> conventional commits check

GitHub Action with commitlint: Run on push to the main branch and fail if the new commit doesn’t match.
Branch protection rule: Require status checks (e.g. commitlint job) to pass before merge.
PR title linting: Since squash merge often uses the PR title, you can enforce PR titles to follow Conventional Commits (e.g. using semantic-pull-requests).

# Done

- [x] upravit Investments -> Trading 212

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
