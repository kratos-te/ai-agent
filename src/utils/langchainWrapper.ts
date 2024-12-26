import { Tool } from "langchain/tools";
import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";

/**
 * Convert a LangChain tool to our Action interface
 */
export function wrapLangChainTool(tool: Tool, agent: SolanaAgentKit): Action {
  // Parse the description to extract input parameters
  const inputParams = parseToolDescription(tool.description);
  
  return {
    name: tool.name,
    similes: [], // LangChain tools don't have similes
    description: tool.description,
    examples: [], // LangChain tools don't have examples
    schema: createZodSchema(inputParams),
    handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
      const result = await tool.call(JSON.stringify(input));
      try {
        return JSON.parse(result);
      } catch {
        return { result };
      }
    }
  };
}

/**
 * Parse tool description to extract input parameters
 */
function parseToolDescription(description: string): Array<{name: string, type: string, required: boolean}> {
  const lines = description.split('\n');
  const params: Array<{name: string, type: string, required: boolean}> = [];
  
  let inInputsSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'Inputs:' || trimmed === 'Inputs (input is a JSON string):') {
      inInputsSection = true;
      continue;
    }
    
    if (inInputsSection && trimmed) {
      // Match patterns like: name: string, eg "value" (required)
      const match = trimmed.match(/(\w+):\s*([\w\[\]]+)(?:,\s*eg[:\s]+"[^"]+")?(?:\s*\((required|optional)\))?/);
      if (match) {
        params.push({
          name: match[1],
          type: match[2],
          required: match[3] === 'required'
        });
      }
    }
  }
  
  return params;
}

/**
 * Create a Zod schema from parsed parameters
 */
function createZodSchema(params: Array<{name: string, type: string, required: boolean}>): z.ZodType<any> {
  const schemaObj: Record<string, z.ZodType<any>> = {};
  
  for (const param of params) {
    let schema: z.ZodType<any>;
    
    switch (param.type.toLowerCase()) {
      case 'string':
        schema = z.string();
        break;
      case 'number':
        schema = z.number();
        break;
      case 'boolean':
        schema = z.boolean();
        break;
      case 'string[]':
        schema = z.array(z.string());
        break;
      default:
        schema = z.any();
    }
    
    if (!param.required) {
      schema = schema.optional();
    }
    
    schemaObj[param.name] = schema;
  }
  
  return z.object(schemaObj);
} 