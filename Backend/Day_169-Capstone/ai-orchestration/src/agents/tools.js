import axios from 'axios';
import dotenv from "dotenv";
import { tool } from "langchain"
import * as z from "zod";
import { fileURLToPath } from "node:url";

dotenv.config({
    path: fileURLToPath(new URL("../../.env", import.meta.url)),
    quiet: true,
});

export function getSandboxAgentUrl(projectId) {
    const configuredUrl = process.env.SANDBOX_AGENT_URL?.trim();
    if (configuredUrl) {
        let url;
        try {
            url = new URL(configuredUrl);
        } catch {
            throw new Error("SANDBOX_AGENT_URL must be a valid HTTP or HTTPS URL.");
        }

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error("SANDBOX_AGENT_URL must be a valid HTTP or HTTPS URL.");
        }

        return configuredUrl.replace(/\/+$/, "");
    }

    const requestSandboxId = typeof projectId === "string" ? projectId.trim() : "";
    const sandboxId = requestSandboxId || process.env.SANDBOX_ID?.trim();
    if (!sandboxId) {
        throw new Error("Set SANDBOX_AGENT_URL or provide a projectId/SANDBOX_ID before using sandbox tools.");
    }
    if (sandboxId.length > 48 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(sandboxId)) {
        throw new Error("projectId must be a valid Kubernetes service identifier.");
    }

    return `http://sandbox-service-${sandboxId}:3000`;
}

export const listFiles = tool(
    async ({ }, config) => {
        const writer = config.context?.writer ?? (() => {});
        writer?.("Listing files in project directory...\n");
        const sandboxUrl = getSandboxAgentUrl(config.context?.projectId);
        const response = await axios.get(`${sandboxUrl}/list-files`);
        writer?.(`Files listed successfully. Files: ${response.data.files.join(",")}\n`);

        return JSON.stringify(response.data.files);
    },
    {
        name: "list_files",
        description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({})
    }
)

export const readFiles = tool(
    async ({ files = [] }, config) => {
        const writer = config.context?.writer ?? (() => {});
        writer?.(`Reading files...${files.join(",")}\n`);
        const sandboxUrl = getSandboxAgentUrl(config.context?.projectId);
        const query = new URLSearchParams({ files: files.join(",") });
        const response = await axios.get(`${sandboxUrl}/read-files?${query}`);
        writer?.("Files read successfully.\n");
        return JSON.stringify(response.data);
    },
    {
        name: "read_files",
        description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe("File paths returned by list_files, relative to the project root")
        })
    }
)

export const updateFiles = tool(
    async ({ files }, config) => {
        const writer = config.context?.writer ?? (() => {});
        writer?.(`Updating files...${files.map(f => f.file).join(",")}\n`);
        const sandboxUrl = getSandboxAgentUrl(config.context?.projectId);
        const response = await axios.patch(`${sandboxUrl}/update-files`, {
            updates: files
        });
        writer?.("Files updated successfully.\n");
        return JSON.stringify(response.data.results);
    },
    {
        name: "update_files",
        description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand. this tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe("The file path relative to the project root"),
                content: z.string().describe("The new content for the file, the content should support json format.")
            })).describe("The list of files to update and their new contents")
        })
    }
)