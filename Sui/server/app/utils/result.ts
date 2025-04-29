export default class Result {
    static success(data: any = null) {
        return { code: 0, msg: 'success', data };
    }

    static success_extra(data: any) {
        return { code: 0, msg: 'success', ...data };
    }

    static fail(error = 'fail', data: any = null) {
        return { code: 1, error, data };
    }

    static err(code = 500, error = 'error', data: any = null) {
        return { code, error, data };
    }

    static unauthorized(data: any = null) {
        return { code: 401, msg: 'unauthorized', data };
    }

    static forbidden(data: any = null) {
        return { code: 402, msg: 'forbidden', data };
    }
}
