import { listAnnotationsForWorkflowRunJobs, listFailedWorkflowRuns } from './github'
import { addAnnotations, addWorkflowRun, getWorkflowRuns } from './storage'

const WAIT = 5000

async function run() {
    try {
        console.log(`[${(new Date).toUTCString()}] Checking latest workflow runs...`)
        const runs = (await listFailedWorkflowRuns())
        //.concat(await listFailedWorkflowRuns(2)).concat(await listFailedWorkflowRuns(3))

        let checkedRuns = await getWorkflowRuns()

        for(const run of runs) {
            
            if(checkedRuns.includes(run.id)) {
                // console.log(`Already checked workflow run ${run.id}`)
            } else {
                console.log(`Checking workflow run ${run.id}`)
                const jobsWithAnnotations = await listAnnotationsForWorkflowRunJobs(run.id)
                if (jobsWithAnnotations.length > 0) {
                    console.log('Annotations found', jobsWithAnnotations.length)

                    if (jobsWithAnnotations.length > 10) {
                        console.log('Too many annotations, skipping')
                    } else {
                        await addAnnotations(jobsWithAnnotations.map((job:any) => ({...job, run})))
                    }
                }
                checkedRuns = await addWorkflowRun(run.id)
                await new Promise(resolve => setTimeout(resolve, WAIT))
            }
        }

        console.log('DONE')
    }catch(e) {
        console.error("ERROR")
        console.error(e)
    }
}

run()
