import { BaseToolResponse } from "../common/types";

export interface StakeResponse extends BaseToolResponse {
  transaction?: string;
  amount?: number;
}
