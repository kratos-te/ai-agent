import { BaseToolResponse } from "../common/types";

export interface CreateImageResponse extends BaseToolResponse {
  images?: string[];
}

export interface WalletAddressResponse extends BaseToolResponse {
  address?: string;
}
