# In progress

# Bugs

# Must have

# Refactor

# Nice to have

- [] Update deps. to work with Node v25 + setup support in Github Action
- [] V novém roce aby LLM měl transakce
- [] Vlastní LLM pro naučené transakce z předchozích let?
- [] Klasifikace podle machine learning technik a LLM jen edge cases?
- [] Přidat KB transakce
- [] Přidat revolut transakce
- [] Přidat Českou Spořitelnu transakce
- [] Squash and merge PR -> conventional commits check

GitHub Action with commitlint: Run on push to the main branch and fail if the new commit doesn’t match.
Branch protection rule: Require status checks (e.g. commitlint job) to pass before merge.
PR title linting: Since squash merge often uses the PR title, you can enforce PR titles to follow Conventional Commits (e.g. using semantic-pull-requests).

# Done

- [x] vyběry hotovosti se špatně propsali -> vybráno z airu pře čsob (17.3.2026) -> 2x výběr 600 + 200 + 2x 35 poplatek a ve výkazu jen 50kč ? -> špatné parsování z pdf?
- [x] přidat nový spoř. účet (fio) do whitelistu
