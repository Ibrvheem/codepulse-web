"use server"

import api from "@/lib/api"
import { revalidateTag } from "next/cache";
import { NewProjectData } from "./types";

export async function getSummaries(id: string) {
    try {
        const response = await api.get(`summary/${id}`);
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error fetching summaries:", error);
        return error;
    }
}

export async function getProjects() {
    try {
        const response = await api.get("projects", {
            next: {
                tags: ["projects"],
            }
        });
        return response;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return error;
    }
}
export async function getProject(id: string) {
    try {
        const response = await api.get(`projects/${id}`, {
            next: {
                tags: ["projects"],
            }
        });
        return response;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return error;
    }
}

export async function createProject(data: NewProjectData) {
    try {
        const response = await api.post("projects", data);
        revalidateTag("projects");
        return response;
    } catch (error) {
        console.error("Error creating project:", error);
        return error;
    }
}