export interface BaseToolResponse {
  status: "success" | "error";
  message: string;
  code?: string;
}
