import axios from 'axios'
import { tool } from 'langchain'
import * as z from 'zod'

export const listFiles = tool(
    async () => {
        console.log("Using list files tool");
        const res = await axios.get('http://01a0d33e-359b-72ba-8e17-39e48dfcae3f.agent.localhost/list-files');
        console.log(res.data);
        return JSON.stringify(res.data.files)
    },{
        name: 'list-files',
        description: 'List all the files and folders in the codebase directory. This is useful for understanding what files are available to work with',
        schema: z.object({})
    }
)

export const readFiles = tool(
    async ({ files: [] }) => {
        console.log('Using read files tool');
        const res = await axios.post(`http://01a0d33e-359b-72ba-8e17-39e48dfcae3f.agent.localhost/read-files?files=${files}`);
        console.log(res.data)
        return JSON.stringify(res.data.results)
    }, {
        name: 'read-files',
        description: 'Read multiple files from the codebase. Returns the contents of the files in a JSON object.',
        schema: z.object({
            results: z.array(z.string()).describe("The list of files absolute path to read.")
        })
    }
)

export const updateFiles = tool(
    async({ files: [] }) => {
        console.log("Using update files tool");
        const res = await axios.post('http://01a0d33e-359b-72ba-8e17-39e48dfcae3f.agent.localhost/update-files', {
            updates: files
        })

        console.log(res.data);
        return JSON.stringify(res.data.results)
    },{
        name: 'update-files',
        description: 'Update the contents of the specified files in the codebase. Returns the results of the updates in a JSON object. This tool can also create the files if they do not exist.',
        schema: z.object({
            updates: z.array(
                z.object({
                    file: z.string().describe("The file path to update"),
                    content: z.string().describe("The content to update the file with")
                })
            ).describe("The list of files to update.")
        })
    }
)
