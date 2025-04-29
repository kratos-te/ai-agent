import fs from "fs";
import { EventId } from '@mysten/sui/client';
import { writeFileSync } from "../utils/util";

var DATA_DIR = process.cwd() + "/data";
var DATA_PATH = DATA_DIR + "/cursor.json";

export default class DbCursor {
    public static cursor: EventId;

    public static init() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }

        if (!this.cursor && fs.existsSync(DATA_PATH)) {
            var data = fs.readFileSync(DATA_PATH).toString();

            if (data) {
                var eventData: EventId = JSON.parse(data);

                this.cursor = eventData;
            }
        }
    }

    public static getCursor(): EventId {
        return this.cursor
    }

    public static writeCursor(data: EventId) {
        this.cursor = data;
        writeFileSync(DATA_PATH, data);
    }
}