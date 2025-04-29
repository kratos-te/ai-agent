import fs from "fs-extra";
import { writeFileSync } from "../utils/util";

var DATA_DIR = process.cwd() + "/data/results";

export default class DbResults {
    public static init() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirpSync(DATA_DIR);
        }
    }

    static getDataPath(caller: string, id: string, nonce: number): string {
        let p = DATA_DIR + "/" + caller + "/" + id;

        if (!fs.existsSync(p)) {
            fs.mkdirpSync(p);
        }

        return p + "/" + nonce + ".json";
    }

    public static WriteAIResult(caller: string, id: string, nonce: number, blob_id_base64: string, blob_id_num: string) {
        var data_path = this.getDataPath(caller, id, nonce);

        if (fs.existsSync(data_path)) {
            let result = fs.readFileSync(data_path).toString();
            let data_result = JSON.parse(result);

            data_result.blob_id_base64 = blob_id_base64;
            data_result.blob_id_num = blob_id_num;
            writeFileSync(data_path, data_result);
        }
    }

    public static WriteResult(caller: string, id: string, nonce: number, result: any): string {
        var data_path = this.getDataPath(caller, id, nonce);

        writeFileSync(data_path, result);

        return data_path;
    }

    public static GetResult(caller: string, id: string, nonce: number): string {
        var data_path = this.getDataPath(caller, id, nonce);

        if (!fs.existsSync(data_path)) {
            return "";
        }

        let result = fs.readFileSync(data_path).toString();
        return result;
    }

    public static GetCallerHistorys(caller: string): any[] {
        let results: string[] = [];
        var caller_path = DATA_DIR + "/" + caller;

        if (fs.existsSync(caller_path)) {
            var dirs = fs.readdirSync(caller_path);

            for (var i = 0; i < dirs.length; i++) {
                var caller_id_path = caller_path + "/" + dirs[i];
                var nonces = fs.readdirSync(caller_id_path);
                for (var j = 0; j < nonces.length; j++) {
                    var data_path = caller_id_path + "/" + nonces[j];
                    let result = fs.readFileSync(data_path).toString();
                    if (result) {
                        let result_data = JSON.parse(result);
                        results.push(result_data);
                    }
                }
            }
        }

        results = results.sort(function (a: any, b: any) {
            let aTime = a.time;
            let bTime = b.time;
            if (aTime > bTime) return -1;
            if (aTime < bTime) return 1;
            return 0;
        });
        return results;
    }
}