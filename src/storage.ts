import {readFile, writeFile} from 'fs/promises'

const WORKFLOW_RUNS_STORAGE = './workflow_runs.json'
const ANNOTATIONS = './annotations.json'

async function read<T = unknown>(fn:string):Promise<T> {
    const file = await readFile(fn)
    return JSON.parse(file.toString()) as unknown as T
}

async function write<T = unknown>(fn:string, data:T):Promise<T> {
    await writeFile(fn, JSON.stringify(data, null, '  '))
    return data
}

export function getWorkflowRuns() {
    return read<number[]>(WORKFLOW_RUNS_STORAGE)
}

export async function addWorkflowRun(run_id:number) {
    return await write<number[]>(WORKFLOW_RUNS_STORAGE, (await read<number[]>(WORKFLOW_RUNS_STORAGE)).concat(run_id))
}

export function getAnnotations():Promise<any> {
    return read(ANNOTATIONS)
}

export async function addAnnotations(annotation:any) {
    await write<any>(ANNOTATIONS, (await read<any>(ANNOTATIONS)).concat(annotation))
}

function getTitle(annotation:any) {
    return annotation.title.split('.')[1]
}
