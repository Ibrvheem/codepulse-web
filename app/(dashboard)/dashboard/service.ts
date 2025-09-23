"use server"

import api from "@/lib/api"

export async function getSummaries() {
    try {
        const response = await api.get("summary");
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error fetching summaries:", error);
        throw error;
    }
}