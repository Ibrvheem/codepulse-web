import { getAccessToken } from "./auth";

const url = process.env.BASE_URL;
const getAuthHeader = async (): Promise<Record<string, string>> => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "Bypass-Tunnel-Reminder",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => {
            return { message: "Network response was not ok" };
        });
        return { ...errorData, status: response.status };
    }
    return response.json().catch(() => {
        return { message: "Response was not JSON" };
    });
};

export const api = {
    get: async (endpoint: string, params?: any) => {
        const headers = await getAuthHeader();

        const response = await fetch(`${url}/${endpoint}`, {
            headers,
            cache: "no-store",
            ...params,
        });
        return handleResponse(response);
    },

    post: async (endpoint: string, payload: any) => {
        const headers = await getAuthHeader();
        console.log(`${url}/${endpoint}`);
        const response = await fetch(`${url}/${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });
        return handleResponse(response);
    },

    put: async (endpoint: string, payload: any) => {
        const headers = await getAuthHeader();
        const response = await fetch(`${url}/${endpoint}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
        });
        return handleResponse(response);
    },

    patch: async (endpoint: string, payload: any) => {
        const headers = await getAuthHeader();
        const response = await fetch(`${url}/${endpoint}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(payload),
        });
        return handleResponse(response);
    },

    delete: async (endpoint: string) => {
        const headers = await getAuthHeader();
        const response = await fetch(`${url}/${endpoint}`, {
            method: "DELETE",
            headers,
        });
        return handleResponse(response);
    },

    formData: async (endpoint: string, formData: FormData) => {
        const token = await getAccessToken();
        const headers: Record<string, string> = {
            "Bypass-Tunnel-Reminder": "Bypass-Tunnel-Reminder",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${url}/${endpoint}`, {
            method: "POST",
            headers,
            body: formData,
        });
        return handleResponse(response);
    },
};

export default api;
