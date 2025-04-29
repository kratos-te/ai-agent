export type CreateAIAgentMessage = {
    id: string;
    price: number;
    name: string;
    encrypt_url: string;
    description: string;
    receive_address: string;
    type_name: string;
    balance: number;
}

export type SelectParam = {
    key: string;
    value: any;
}

export type CallAIMessage = {
    id: string;
    params: string;
    nonce: number;
    caller: string;
}