import crypto from 'crypto';
import moment from 'moment';
import fs from 'fs';
import axios, { AxiosRequestConfig, Method } from 'axios';
import child_process from 'child_process';
const util = require('util');
const exec = util.promisify(child_process.exec);

export const rgbToHex = (r: number, g: number, b: number): string => {
    function valueToHex(c: number) {
        var hex = c.toString(16);
        if (hex.length === 1) hex = `0${hex}`;
        return hex.toUpperCase();
    }
    return valueToHex(r) + valueToHex(g) + valueToHex(b);
};

export const sleep = (ms: number): Promise<Function> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const md5 = (data: any) => {
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
};

export function sha256(data: any): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

export const isEnglish = (str: string): boolean => {
    // const englishReg: RegExp = /^[a-zA-Z]+$/;
    // return englishReg.test(str);

    const englishCount = (str.match(/[a-zA-Z]/g) || []).length;
    return (englishCount / str.length) * 100 > 80 ? true : false;
};

export const isChinese = (str: string): boolean => {
    const chineseReg: RegExp = /[\u4e00-\u9fa5]/;
    return chineseReg.test(str);
};

export const isSameDay = (date1: string, date2: string): boolean => {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
};
export const getdays = (start_date: string, end_date: string | number): any[] => {
    const startTime = moment.utc(start_date);
    const endTime = moment.utc(end_date);

    let days: any[] = [];

    while (startTime.isBefore(endTime)) {
        const firstDay = startTime.startOf('day');
        if (days.length > 0) {
            days[days.length - 1].end = firstDay.toISOString();
        }
        days.push({ from: firstDay.toISOString() });
        startTime.add(1, 'day');
    }
    days[days.length - 1].end = moment.utc(end_date).endOf('day').toISOString();
    return days;
};

export const startDateFromWeek = (_date: any) => {
    const year = Number(_date.split('_')[0]),
        week = Number(_date.split('_')[1]);
    const date = new Date(year, 0, 1);
    const daysUntilTargetWeek = (week - 1) * 7 - date.getDay() + 1;
    date.setDate(date.getDate() + daysUntilTargetWeek);
    return date;
};

export const getweeks = (start_date: string, end_date: string | number): any[] => {
    const startTime = moment.utc(start_date);
    const endTime = moment.utc(end_date);

    let weeks: any[] = [];

    while (startTime.isBefore(endTime)) {
        const firstDayOfWeek = startTime.startOf('week');
        const firstDayOfWeekMidnight = firstDayOfWeek.startOf('day');
        if (weeks.length > 0) {
            weeks[weeks.length - 1].end = firstDayOfWeekMidnight.toISOString();
        }
        weeks.push({ from: firstDayOfWeekMidnight.toISOString() });
        startTime.add(1, 'week');
    }
    weeks[weeks.length - 1].end = moment.utc(end_date).endOf('week').endOf('day').toISOString();
    return weeks;
};

export const getmonths = (start_date: string, end_date: string | number): any[] => {
    const startTime = moment.utc(start_date);
    const endTime = moment.utc(end_date);

    let months: any[] = [];

    while (startTime.isBefore(endTime)) {
        const firstDayOfMonth = startTime.startOf('month');
        const firstDayOfMonthMidnight = firstDayOfMonth.startOf('day');
        if (months.length > 0) {
            months[months.length - 1].end = firstDayOfMonthMidnight.toISOString();
        }
        months.push({ from: firstDayOfMonthMidnight.toISOString() });
        startTime.add(1, 'month');
    }
    months[months.length - 1].end = moment.utc(end_date).endOf('month').endOf('day').toISOString();
    return months;
};

export const getRandomCode = (str: string, length: number = 6): string => {
    const hashedIdentifier = crypto.createHash('sha256').update(str).digest('hex');
    return hashedIdentifier.substr(0, length);
};

export const onlyNumber = (val: any) => {
    return String(val).replace(/[^\d]/g, '');
};

export const writeFileSync = function(p: string, data: any) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

export const walrusUpload = async function(data_path: string) {
    // const config: AxiosRequestConfig<string> = {
    //     method: 'PUT',
    //     url: 'https://publisher-devnet.walrus.space/v1/store?epochs=1',
    //     data: data
    // };

    // const response = await axios(config);

    // return response.data;
    const cmd = 'walrus store ' + data_path;
    console.log(cmd);
    const { stdout, stderr } = await exec(cmd)
    var result = stdout;
    var blob_id = result.match(/Blob ID: (.*?)\n/)
    if (blob_id) {
        blob_id = blob_id[1];
    }
    var sui_object_id = result.match(/Sui object ID: (.*?)\n/)
    if (sui_object_id) {
        sui_object_id = sui_object_id[1];
    }
    return {
        blob_id: blob_id,
        sui_object_id: sui_object_id
    }
}

export const makeRequest = async function (metadata: { requestUrl: string; requestType: string; requestHeaders?: { [key: string]: string }; requestParams?: { [key: string]: string | number } }): Promise<any> {
    try {
        // Build the Axios request configuration
        const config: AxiosRequestConfig = {
            method: metadata.requestType as Method,
            url: metadata.requestUrl,
        };

        // If requestHeaders exist, add them to the configuration
        if (metadata.requestHeaders) {
            config.headers = metadata.requestHeaders;
        }

        // If requestParams exist, add them to the configuration
        if (metadata.requestParams) {
            config.params = metadata.requestParams;
            if (metadata.requestType.toUpperCase() === 'GET' || metadata.requestType.toUpperCase() === 'DELETE') {
                // For GET and DELETE, parameters are typically sent as query strings
                config.params = metadata.requestParams;
            } else if (metadata.requestType.toUpperCase() === 'POST' || metadata.requestType.toUpperCase() === 'PUT' || metadata.requestType.toUpperCase() === 'PATCH') {
                // For POST, PUT, and PATCH, parameters are typically sent in the request body
                config.data = metadata.requestParams;
            }
        }

        // Send the request
        const response = await axios(config);

        // Output the response data
        if (response.request.res.statusCode == 200) {
            return response.data;
        } else {
            return {
                satatusCode: response.request.res.statusCode,
                statusMessage: response.request.res.statusMessage,
            };
        }
    } catch (error: any) {
        if (error.code) {
            // console.log('=============debug: parse error')
            return {
                satatusCode: error.request.res.statusCode,
                statusMessage: error.request.res.statusMessage,
            };
        }
        throw error;
    }
}