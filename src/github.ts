import { Octokit } from "octokit";

const CONFIG = {owner: 'pleo-io', repo: 'product-web'}
const WORKFLOW_PATH = '.github/workflows/run-extract-messages.yml'
const RELEVANT_JOB_NAME_REGEX = /^Cypress Tests report/

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN })
export default octokit

function listWorkflows() {
    return octokit.rest.actions.listRepoWorkflows({...CONFIG})
}

async function getRelevantWorkflow() {
    const response = await listWorkflows()

    return response.data.workflows.find(workflow => workflow.path === WORKFLOW_PATH)
}

export async function listFailedWorkflowRuns(page = 1) {
    const workflow = await getRelevantWorkflow()
    
    const response = (await octokit.rest.actions.listWorkflowRuns({
        ...CONFIG,
        // @ts-ignore
        workflow_id: workflow!.id,
        status: 'completed',
        per_page: 100,
        page
    }))
    
    // even though some of the checks failed, it can still have 'skipped' conclusion
    return response.data.workflow_runs.filter(run => ['skipped', 'failure'].includes(run.conclusion))
}

function listJobsForWorkflowRun(run_id: number) {
    return octokit.rest.actions.listJobsForWorkflowRun({...CONFIG, run_id})
}

function listAnnotations(check_run_id: number) {
    return octokit.rest.checks.listAnnotations({
        ...CONFIG,
        check_run_id,
    });
}

export async function listRelevantWorkflowRunJobs(run_id: number) {
    const response = await listJobsForWorkflowRun(run_id)
    return response.data.jobs.filter(job => 
        job.name.match(RELEVANT_JOB_NAME_REGEX) && job.conclusion === 'failure'
    )
}

export async function listAnnotationsForWorkflowRunJobs(run_id: number) {
    const relevantJobs = await listRelevantWorkflowRunJobs(run_id)

    const annotations:any = []
    for(const job of relevantJobs) {
        const response = await listAnnotations(job.id)
        if (response.data.length > 0) {
            response.data.forEach(annotation => annotations.push({job, annotation}))
        }
    }

    return annotations
}

export async function listJobs(run_id:number) {
    return octokit.rest.actions.listJobsForWorkflowRun({
        ...CONFIG, run_id
      });
}