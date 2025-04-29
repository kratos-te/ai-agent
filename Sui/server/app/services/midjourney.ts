import axios from 'axios';
import { MIDJOURNEY_PROXY_URL, MIDJOURNEY_MODE } from '../constants';

export const StatusCodeSuccess = 1;
export const StatusCodeExisted = 21;
export const StatusCodeInQueue = 22;
export const StatusCodeInvalidPrompt = 24;
export const StatusCodeInvalidToken = 3;

export const StatusFetchSuccess = "SUCCESS";

export interface FetchRes {
    action: string;
    description: string;
    failReason: string;
    finishTime: number;
    id: string;
    imageUrl: string;
    progress: string;
    prompt: string;
    promptEn: string;
    properties: Record<string, unknown>;
    startTime: number;
    state: string;
    status: string;
    submitTime: number;
}

/**
 * Fetch task by ID
 * @param {string} id task ID
 * @returns Promise<FetchRes>
 */
export const fetch = async (id: string): Promise<FetchRes> => {
    const headers = {
        Accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    try {
        let response = await axios.get<FetchRes>(`${MIDJOURNEY_PROXY_URL}/mj/task/${id}/fetch`, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export interface ImagineParams {
    base64Array?: Record<string, unknown>[];
    notifyHook?: string;
    prompt: string;
    state?: string;
}

export interface ImagineRes {
    code: number;
    description: string;
    properties: Record<string, unknown>;
    result: string;
}

export enum Mode {
    FAST,
    RELAX
}

/**
 * Submit Imagine task
 * @param {ImagineParams} params imagineDTO
 * @returns Promise<ImagineRes>
 */
export const imagine = async (params: ImagineParams, mode: MIDJOURNEY_MODE): Promise<ImagineRes> => {
    params.prompt = handleImagePrompt(params.prompt, mode);
    const headers = {
        Accept: '*/*',
        'Content-Type': 'application/json'
    };
    try {
        let response = await axios.post<ImagineRes>(`${MIDJOURNEY_PROXY_URL}/mj/submit/imagine`, params, { headers });
        return response.data;
    } catch (error) {
        console.error('Error submitting Imagine task:', error);
        throw error;
    }
};

export function handleImagePrompt(prompt: string, mode: MIDJOURNEY_MODE): string {
    if (!(prompt.includes(`--quality`) || prompt.includes(`--q`))) {
        prompt = prompt.concat(` --quality .25`);
    }

    if (prompt.includes(`--turbo`)) {
        prompt = prompt.replaceAll(`--turbo`, '');
    }

    if (mode === MIDJOURNEY_MODE.FAST) {
        if (!prompt.includes(`--fast`)) {
            prompt = prompt.concat(` --fast`);
        }
    } else {
        if (prompt.includes(`--fast`)) {
            prompt = prompt.replaceAll(`--fast`, '');
        }
    }
    return prompt;
}
