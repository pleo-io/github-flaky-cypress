import { getAnnotations } from "./storage";

function getTitle(annotation:any) {
    return annotation.title
}

async function report() {
    const data = await getAnnotations()

    const report = data.reduce((rep:any, {annotation, job, run}:any) => {
        const title = getTitle(annotation)
        rep[title] = rep[title] || []
        rep[title].push({
            job: job.html_url,
            run: run.html_url,
            pull_requests: run.pull_requests.map((req:any) => ({html_url: `https://github.com/pleo-io/product-web/pull/${req.number}`, head: req?.head?.ref}))
        })
        return rep
    }, {})

    // @ts-ignore
    const summary = Object.entries(report).map(([name, annotations]) => [name, annotations.length])
    summary.sort((a, b) => b[1]-a[1])

    return {full: report, summary: Object.fromEntries(summary)}
}

async function run() {
    const rep = await report()
    console.log(JSON.stringify(rep, null, '  '))
}

run()