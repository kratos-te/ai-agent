export type PageResult = {
    total: number;
    pages: number;
    data: any[];
};

export enum manualPointType {
    award = 'award',
}

export type CursorResult = {
    next: any;
    previous: any;
    data: any[];
    total: number;
};

export interface IBaseService {
    table: string;
    filed_for_create_time: string | undefined;
    filed_for_update_time: string | undefined;

    createIndex(): Promise<Document>;

    indexInformation(): Promise<Document>;

    findOne(where: {}): Promise<any>;

    save(data: any, where?: {}): Promise<any>;

    insertOne(data: any): Promise<any>;

    insertMany(data: any[]): Promise<any>;

    modifyOne(data: any, where?: {}): Promise<any>;

    updateOne(where: any, data: any): Promise<any>;

    delete(where: {}): Promise<any>;

    page(where?: {}, size?: number, page?: number): Promise<PageResult>;

    cursor(where?: {}, limit?: number, cursor?: any, sort?: any): Promise<CursorResult>;
}

export type CreateCellRequest = {
    owner: string; // Wallet address
    name: string; // Name
    description: string; // Description
    requestURL: string; // Request URL
    requestType: string; // Type GET/POST
    requestHeaders?: any; // option { "Content-Type": "application/json", "Accept-Encoding": "gzip, deflate, br" }
    requestParams?: any; // { "paramA": "", "paramB": "", "paramC": "" }
    price: string; // 0.175 USDT => 0.175 * 10**18 USDT
    denom: string; // Token address [BNB_address, USDT_address]
    logoFile: any; // https://gnfd-testnet-sp3.bnbchain.org/view/bucket-name/object-fold-name/object-name
    tokeninfo: string;
};

export type CreateCellResponse = {
    cellId: string;
    tokenURL: string;
    encryptURL: string;
    denom: string;
    price: string;
};

export type UpdateCellRequest = {
    cellId: string;
    tokenId: string;
    cellAddress: string;
    txhash: string;
};

export type UpdateCellResponse = {
    cellId: string;
};

export type CallCellRequest = {
    user: string; // Wallet address
    cellId: string;
    txhash: string;
    params: any;
    onlineStatus: number;
    encryptURL: string;
};

export type CallCellResponse = {
    callId: string;
    output: string;
};

export type CreateAIAgentMessage = {
    id: string;
    price: number;
    name: string;
    url: string;
    encrypt_url: string;
    method_type: string;
    description: string;
    receive_address: string;
    type_name: string;
    balance: number;
}

export type DeleteAIAgentMessage = {
    id: string;
}

export type CallAIMessage = {
    id: string;
    params: string;
    nonce: number;
    caller: string;
    type_name: string;
}

export type CallAIResult = {
    id: string;
    nonce: number;
    blob_id_base64: string;
    blob_id_num: string;
    caller: string;
}

export type UpdateNameMessage = {
    id: string;
    name: string;
    new_name: string;
}

export type UpdateEncryptUrlMessage = {
    id: string;
    encrypt_url: string;
    new_encrypt_url: string;
}

export type UpdateDescriptionMessage = {
    id: string;
    description: string;
    new_description: string;
}

export type UpdateReceiveAddressMessage = {
    id: string;
    receive_address: string;
    new_receive_address: string;
}

export type UpdatePriceMessage = {
    id: string;
    price: number;
    new_price: number;
}