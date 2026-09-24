import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path'

const WORKING_DIR = '/workspace';

const app = express();
app.use(express.json())
app.use(morgan('combined'));

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello from the sandbox agent!" });
});

/**
 * @route GET /list-files
 * @description List all the files in working directory and its subdirectories. Returns a JSON Object with the
 * file paths reletive to the working directory. Exclude directories like node_modules, .git, etc.
 * @returns {Object} - List of files
 * - eg. {
 *      "files": [
 *          "index.js", 
 *          "folder/hello.js"
 *      ]
 * }
 */

app.get("/list-files", async (req, res) => {

    const listFiles = async (dir, baseDir) => {
        let files = [];
        const elements = await fs.promises.readdir(dir, { withFileTypes: true });

        for(const element of elements){
            const fullPath = path.join(dir, element.name)
            const relativePath = path.relative(baseDir, fullPath);

            if(element.isDirectory() && ['node_modules', '.git', 'dist', '.vscode', 'build'].includes(element.name)){
                continue;
            }

            if(element.isDirectory()){
                const subFiles = await listFiles(fullPath, baseDir);
                files.push(...subFiles);
            } else {
                files.push(relativePath);
            }
        }

        return files;
    }

    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR);
        return res.status(200).json({
            message: "Files listed successfully!",
            success: true,
            files
        })
    } catch (err) {
        return res.status(500).json({
            message: "Error listing files",
            success: false,
            err: err.message
        })
    }
})

/**
 * @route GET /read-files
 * @desc Read multiple files
 * @param {string} files - Comma-separated list of files
 * @returns {Object} - Contents of the files
 */

app.post("/read-files", async (req, res) => {
    const files = req.query.files;

    if (!files) {
        return res.status(400).json({
            message: "No files requested!"
        })
    }

    const fileList = files.split(",");

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = `${WORKING_DIR}/${file}`;
        try {
            const content = await fs.promises.readFile(filePath, "utf-8");

            return {
                [filePath.replaceAll(WORKING_DIR, "")]: content
            }
        } catch (err) {
            return {
                [filePath.replaceAll(WORKING_DIR, "")]: `Error reading files: ${err.message}`
            }
        }
    }))

    return res.status(200).json({
        message: "File contents",
        results
    });
});

/**
 * @route PATCH /update-files
 * @desc Update multiple files
 * @param {Array} updates - Array of file updates
 * @returns {Object} - Results of the updates
 */

app.patch("/update-files", async (req, res) => {
    const updates = req.body.updates;

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: "Invalid update payload!"
        })
    }

    const results = await Promise.all(updates.map(async (update) => {
        const { file, content } = update;
        const filePath = path.join(WORKING_DIR, file);

        try {
            await fs.promises.writeFile(filePath, content, 'utf-8');
            return {
                [filePath]: "Updated successfully"
            };
        } catch (err) {
            return {
                [filePath]: `Error updating file: ${err.message}`
            }
        }
    }))

    res.status(200).json({
        message: "Updates applied!",
        results
    })
})

/**
 * @route POST /create-files
 * @desc Create multiple files
 * @param {Array} files - Array of files
 * @returns {Object} - Results of the creation
 */

app.post("/create-files", async (req, res) => {
    const files = req.body.files

    if (!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: "Invalid files payload!",
            success: false
        })
    }

    const results = await Promise.all(files.map(async (fileObj) => {
        const { file, content } = fileObj;
        const filePath = path.join(WORKING_DIR, file);

        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, 'utf-8');

            return {
                [filePath.replaceAll(WORKING_DIR, "")]: "File created successfully"
            }
        } catch (err) {
            return {
                [filePath.replaceAll(WORKING_DIR, "")]: `Error creating file: ${err.message}`
            }
        }
    }))

    res.status(200).json({
        message: "Files created successfully!",
        results
    })
})


export default app;