import axios from 'axios';
import * as z from 'zod'
import { tool } from 'langchain'
import { Config } from '../config/config.js'

const SANDBOX_URL = Config.SANDBOX_URL;

export const listFiles = tool(
    async() => {
        try {
            console.log('Running List files tool');
            const res = await axios.get(`${SANDBOX_URL}/list-files`);
            console.log('List files tool completed', res.data);
            return JSON.stringify(res.data)
        } catch (err) {
            console.log('List files tool failed', err);
            throw new Error(`Failed to list files: ${err}`)
        }
    },
    { 
        name: "list_files", 
        description: "List all files in the current directory",
        schema: z.object({})
    }
)

export const readFiles = tool(
    async({ files }) => {
        try {
            console.log('Running read files tool');
            const fileQuery = files.join(",");
            const res = await axios.post(`${SANDBOX_URL}/read-files?files=${fileQuery}`);
            console.log('Read files tool completed', res.data);
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
    async({ updates }) => {
        try {
            console.log('Running update files tool');
            const res = await axios.patch(`${SANDBOX_URL}/update-files`, { updates });
            console.log('Update files tool completed', res.data);
            return JSON.stringify(res.data.results)
        } catch (err) {
            console.log('Update files tool failed', err);
            throw new Error(`Failed to update files: ${err}`)
        }
    }, {
        name: "update-files",
        description: "Update the files in the codebase.",
        schema: z.object({
            updates: z.array(z.object({
                file: z.string().describe("Path of the file."),
                content: z.string().describe("Content to be updated in the file.")
            })).describe("Array of file updates with file path and content.")
        })
    }
)