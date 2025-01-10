import { BaseToolResponse } from "../common/types";

export interface RegisterDomainInput {
  name: string;
  spaceKB?: number;
}

export interface ResolveDomainInput {
  domain: string;
}

export interface GetDomainInput {
  account: string;
}

export interface OwnedDomainsInput {
  owner: string;
}

export interface TldDomainsInput {
  tld: string;
}

export interface RegisterDomainResponse extends BaseToolResponse {
  transaction?: string;
  domain?: string;
  spaceKB?: number;
}

export interface ResolveDomainResponse extends BaseToolResponse {
  publicKey?: string;
  owner?: string;
}

export interface DomainResponse extends BaseToolResponse {
  domain?: string | null;
}

export interface DomainsListResponse extends BaseToolResponse {
  domains?: string[];
}

export interface TldsResponse extends BaseToolResponse {
  tlds?: string[];
}
