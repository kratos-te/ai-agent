import fs from "fs";
import { CreateAIAgentMessage, DeleteAIAgentMessage, UpdateDescriptionMessage, UpdateEncryptUrlMessage, UpdateNameMessage, UpdatePriceMessage, UpdateReceiveAddressMessage } from "../typing";
import { writeFileSync } from "../utils/util";

var DATA_DIR = process.cwd() + "/data/events";

export default class DbEvents {
    public static init() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }
    }

    static getDataPath(id: string): string {
        return DATA_DIR + "/" + id + ".json";
    }

    public static GetAIAgent(id: string): CreateAIAgentMessage|null {
        let data_path = this.getDataPath(id);

        let raw = fs.readFileSync(data_path).toString();
        if (raw) {
            let data: CreateAIAgentMessage = JSON.parse(raw);
            return data;
        } else {
            return null;
        }
    }

    public static GetAIAgents(address: string): CreateAIAgentMessage[] {
        let results: CreateAIAgentMessage[] = [];

        let files = fs.readdirSync(DATA_DIR);

        for (var i = 0; i < files.length; i++) {
            var data_path = DATA_DIR + "/" + files[i];
            let raw = fs.readFileSync(data_path).toString();
            if (raw) {
                let data: CreateAIAgentMessage = JSON.parse(raw);
                if (address) {
                    if (data.receive_address == address) {
                        results.push(data);
                    }
                } else {
                    results.push(data);
                }
            }
        }
        return results;
    }

    public static CreateAIAgent(message: CreateAIAgentMessage) {
        let data_path = this.getDataPath(message.id);

        writeFileSync(data_path, message);
    }

    public static DeleteAIAgent(message: DeleteAIAgentMessage) {
        let data_path = this.getDataPath(message.id);

        fs.rmSync(data_path);
    }

    public static UpdateName(message: UpdateNameMessage) {
        let data_path = this.getDataPath(message.id);

        if (fs.existsSync(data_path)) {
            let raw = fs.readFileSync(data_path).toString();
            if (raw) {
                let data: CreateAIAgentMessage = JSON.parse(raw);
                if (message.new_name != data.name) {
                    data.name = message.new_name;

                    writeFileSync(data_path, data);
                }
            }
        }
    }

    public static UpdateEncryptUrl(message: UpdateEncryptUrlMessage) {
        let data_path = this.getDataPath(message.id);

        if (fs.existsSync(data_path)) {
            let raw = fs.readFileSync(data_path).toString();
            if (raw) {
                let data: CreateAIAgentMessage = JSON.parse(raw);
                if (message.new_encrypt_url != data.encrypt_url) {
                    data.encrypt_url = message.new_encrypt_url;

                    writeFileSync(data_path, data);
                }
            }
        }
    }

    public static UpdateDescription(message: UpdateDescriptionMessage) {
        let data_path = this.getDataPath(message.id);

        if (fs.existsSync(data_path)) {
            let raw = fs.readFileSync(data_path).toString();
            if (raw) {
                let data: CreateAIAgentMessage = JSON.parse(raw);
                if (message.new_description != data.description) {
                    data.description = message.new_description;

                    writeFileSync(data_path, data);
                }
            }
        }
    }

    public static UpdateReceiveAddress(message: UpdateReceiveAddressMessage) {
        let data_path = this.getDataPath(message.id);

        if (fs.existsSync(data_path)) {
            let raw = fs.readFileSync(data_path).toString();
            if (raw) {
                let data: CreateAIAgentMessage = JSON.parse(raw);
                if (message.new_receive_address != data.receive_address) {
                    data.receive_address = message.new_receive_address;

                    writeFileSync(data_path, data);
                }
            }
        }
    }

    public static UpdatePrice(message: UpdatePriceMessage) {
        let data_path = this.getDataPath(message.id);

        if (fs.existsSync(data_path)) {
            let raw = fs.readFileSync(data_path).toString();
            if (raw) {
                let data: CreateAIAgentMessage = JSON.parse(raw);
                if (message.new_price != data.price) {
                    data.price = message.new_price;

                    writeFileSync(data_path, data);
                }
            }
        }
    }
}