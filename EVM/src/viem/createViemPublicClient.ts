import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";

/**
 * Creates a new public Viem client connected to the Avalanche Fuji testnet.
 *
 * A public client is a client that is not connected to a specific wallet and
 * therefore cannot perform write operations.
 *
 * @returns A new public Viem client.
 */
export function createViemPublicClient() {
  return createPublicClient({
    /**
     * The chain to connect to.
     *
     * In this case, we're using the Avalanche Fuji testnet.
     */
    chain: avalancheFuji,

    /**
     * The transport to use for HTTP requests.
     *
     * In this case, we're using the built-in HTTP transport.
     */
    transport: http(),
  });
}
