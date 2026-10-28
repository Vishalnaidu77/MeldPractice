import axios from 'axios';
import * as z from 'zod'
import { tool } from 'langchain'
import { Config } from '../config/config.js'

export const listFiles = tool(
    async({}, config) => {
        try {

            config.writer(`Listing files in the current directory for project...`);
            const res = await axios.get(`http://sandbox-service-${config.context.projectId}:8000/list-files`);

            return JSON.stringify(res.data)
        } catch (err) {
            console.log('List files tool failed', err);
            throw new Error(`Failed to list files: ${err.message}`)
        }
    },
    { 
        name: "list_files", 
        description: "List all files in the current directory",
        schema: z.object({})
    }
)

export const readFiles = tool(
    async({ files }, config) => {
        try {

            config.writer(`Reading files: ${files.join(", ")} in the current directory for project...`);
            const fileQuery = files.join(",");
            const res = await axios.post(`http://sandbox-service-${config.context.projectId}:8000/read-files?files=${fileQuery}`);

            return JSON.stringify(res.data.results);
        } catch (err) {
            console.log('Read files tool failed', err);
            throw new Error(`Failed to read files: ${err}`);
        }
    },
    {
        name: "read-files",
        description: "Read multple files from the current directory.",
        schema: z.object({
            files: z.array(z.string()).describe("Content of the files to be read.")
        })
    }
)

export const updateFiles = tool(
    async({ updates }, config) => {
        try {

            config.writer(`Updating files: ${updates.map(u => u.file).join(", ")} in the current directory for project...`);
            
            const res = await axios.patch(`http://sandbox-service-${config.context.projectId}:8000/update-files`, { updates });
            
            config.writer(`Files updated successfully: ${updates.map(u => u.file).join(", ")}`);
            return JSON.stringify(res.data.results)
        } catch (err) {
            console.log('Update files tool failed', err);
            throw new Error(`Failed to update files: ${err}`)
        }
    }, {
        name: "update-files",
        description: "Update the files in the codebase. This tool is also use to create new files in the codebase. If the file does not exist, it will be created.",
        schema: z.object({
            updates: z.array(z.object({
                file: z.string().describe("Path of the file."),
                content: z.string().describe("Content to be updated in the file.")
            })).describe("Array of file updates with file path and content.")
        })
    }
)