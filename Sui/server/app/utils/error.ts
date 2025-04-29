export const ERRCODE = {
    success: 0,
    fail: 1,
    notfound: 2,
    handled: 3,
    existed: 4,
    invalid: 5,
    process: 6,
    parameter: 7,
    unknown: 9,
    except: 999
};

let ERRMSG: Record<number, string> = {};
export function errmsg(code?: number) {
    if (!code) code = 0;
    if (!Object.keys(ERRMSG).length) {
        ERRMSG = {};
        const _errs: any = ERRCODE;
        for (let k in _errs) {
            ERRMSG[_errs[k]] = k;
        }
    }
    return ERRMSG[code];
}