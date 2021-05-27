Get all annotations from product-web `run-extract-messages.yml` workflow runs which jobs match `/^Cypress Tests report/`. The configuration for this can be adjusted in `src/github.ts`.

There's probably some better way to get the relevant job runs that we need, but this seems to work just fine. We're using octokit to access Github API.

## Usage
You need a Github PAT with _workflow_ permission. The script expects `GITHUB_TOKEN` env variable.

`yarn download` will gather annotations for latest 100 github workflow runs on product-web. Already processed runs will be saved to `workflow-runs.json` and the annotations (with accompanying job and workflow info) are persisted in `annotations.json`. The script works incrementally so you can run it once per day and it will add to the previous data. Also, jobs with 10 or more annotations are skipped (since those are mostly runs where all or most of the cypress tests failed).

`yarn report` will spew out a report with errors grouped accompanied with links to relevant PR's and job runs.
