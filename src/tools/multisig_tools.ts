import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
} from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
  createTransferInstruction,
} from "@solana/spl-token";
import { SolanaAgentKit } from "../agent";

const { Multisig } = multisig.accounts;

/**
 * Creates a new Squads multisig account.
 *
 * @param agent - The SolanaAgentKit instance containing the connection and wallet information.
 * @param creator - The public key of the creator who will be a member of the multisig.
 * @returns A promise that resolves to the transaction ID of the multisig creation transaction.
 *
 * @throws Will throw an error if the transaction fails.
 */
export async function create_squads_multisig(
  agent: SolanaAgentKit,
  creator: PublicKey,
): Promise<string> {
  const connection = agent.connection;
  const createKey = agent.wallet; // can be any keypair, using the agent wallet as only one multisig is required

  const [multisigPda] = multisig.getMultisigPda({
    createKey: createKey.publicKey,
  });

  const programConfigPda = multisig.getProgramConfigPda({})[0];

  const programConfig =
    await multisig.accounts.ProgramConfig.fromAccountAddress(
      connection,
      programConfigPda,
    );

  const configTreasury = programConfig.treasury;
  const tx = multisig.transactions.multisigCreateV2({
    blockhash: (await connection.getLatestBlockhash()).blockhash,
    treasury: configTreasury,
    createKey: createKey.publicKey,
    creator: agent.wallet.publicKey,
    multisigPda,
    configAuthority: null,
    timeLock: 0,
    threshold: 2,
    rentCollector: null,
    members: [
      {
        key: agent.wallet.publicKey,
        permissions: multisig.types.Permissions.all(),
      },
      {
        key: creator,
        permissions: multisig.types.Permissions.all(),
      },
    ],
  });

  tx.sign([agent.wallet, createKey]);

  const txId = connection.sendRawTransaction(tx.serialize());

  return txId;
}

/**
 * Creates a proposal for a multisig transaction.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance.
 * @param {number | bigint} [transactionIndex] - Optional transaction index. If not provided, the current transaction index will be used.
 * @returns {Promise<string>} - The transaction ID of the created proposal.
 * @throws {Error} - Throws an error if the proposal creation fails.
 */
export async function multisig_create_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
): Promise<string> {
  try {
    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    if (!transactionIndex) {
      transactionIndex = BigInt(currentTransactionIndex);
    } else if (typeof transactionIndex !== "bigint") {
      transactionIndex = BigInt(transactionIndex);
    }
    const multisigTx = multisig.transactions.proposalCreate({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet_address,
      multisigPda,
      transactionIndex,
      creator: agent.wallet_address,
    });

    multisigTx.sign([agent.wallet]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Create proposal failed: ${error}`);
  }
}

/**
 * Transfer SOL or SPL tokens to a multisig treasury vault.
 * @param agent SolanaAgentKit instance
 * @param amount Amount to transfer
 * @param vaultIndex Optional vault index, default is 0
 * @param mint Optional mint address for SPL tokens
 * @returns Transaction signature
 */
export async function multisig_deposit_to_treasury(
  agent: SolanaAgentKit,
  amount: number,
  vaultIndex?: number,
  mint?: PublicKey,
): Promise<string> {
  try {
    let tx: string;
    if (!vaultIndex) {
      vaultIndex = 0;
    }
    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const [vaultPda] = multisig.getVaultPda({
      multisigPda,
      index: vaultIndex,
    });
    const to = vaultPda;
    if (!mint) {
      // Transfer native SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: agent.wallet_address,
          toPubkey: to,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );

      tx = await agent.connection.sendTransaction(transaction, [agent.wallet]);
    } else {
      // Transfer SPL token
      const fromAta = await getAssociatedTokenAddress(
        mint,
        agent.wallet_address,
      );
      const transaction = new Transaction();
      const toAta = await getAssociatedTokenAddress(mint, to, true);
      const toTokenAccountInfo = await agent.connection.getAccountInfo(toAta);
      // Create associated token account if it doesn't exist
      if (!toTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            agent.wallet_address,
            toAta,
            to,
            mint,
          ),
        );
      }
      // Get mint info to determine decimals
      const mintInfo = await getMint(agent.connection, mint);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          agent.wallet_address,
          adjustedAmount,
        ),
      );

      tx = await agent.connection.sendTransaction(transaction, [agent.wallet]);
    }

    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}

/**
 * Approves a proposal in a Solana multisig wallet.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance.
 * @param {number | bigint} [transactionIndex] - The index of the transaction to approve. If not provided, the current transaction index will be used.
 * @returns {Promise<string>} - A promise that resolves to the transaction ID of the approved proposal.
 * @throws {Error} - Throws an error if the approval process fails.
 */
export async function multisig_approve_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
): Promise<string> {
  try {
    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    if (!transactionIndex) {
      transactionIndex = BigInt(currentTransactionIndex);
    } else if (typeof transactionIndex !== "bigint") {
      transactionIndex = BigInt(transactionIndex);
    }

    // const [proposalPda, proposalBump] = multisig.getProposalPda({
    //   multisigPda,
    //   transactionIndex,
    // });

    const multisigTx = multisig.transactions.proposalApprove({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet.publicKey,
      multisigPda,
      transactionIndex: transactionIndex,
      member: agent.wallet.publicKey,
    });

    multisigTx.sign([agent.wallet]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Approve proposal failed: ${error}`);
  }
}

/**
 * Executes a transaction on the Solana blockchain using the provided agent.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance containing the wallet and connection.
 * @param {number | bigint} [transactionIndex] - Optional transaction index to execute. If not provided, the current transaction index from the multisig account will be used.
 * @returns {Promise<string>} - A promise that resolves to the transaction signature string.
 * @throws {Error} - Throws an error if the transaction execution fails.
 */
export async function multisig_execute_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
): Promise<string> {
  try {
    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    if (!transactionIndex) {
      transactionIndex = BigInt(currentTransactionIndex);
    } else if (typeof transactionIndex !== "bigint") {
      transactionIndex = BigInt(transactionIndex);
    }
    const multisigTx = await multisig.transactions.vaultTransactionExecute({
      connection: agent.connection,
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet.publicKey,
      multisigPda,
      transactionIndex,
      member: agent.wallet.publicKey,
    });

    multisigTx.sign([agent.wallet]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Execute proposal failed: ${error}`);
  }
}

/**
 * Rejects a proposal in a Solana multisig setup.
 *
 * @param agent - The SolanaAgentKit instance containing the wallet and connection.
 * @param transactionIndex - Optional. The index of the transaction to reject. If not provided, the current transaction index will be used.
 * @returns A promise that resolves to the transaction ID of the rejection transaction.
 * @throws Will throw an error if the transaction fails.
 */
export async function multisig_reject_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
): Promise<string> {
  try {
    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    if (!transactionIndex) {
      transactionIndex = BigInt(currentTransactionIndex);
    } else if (typeof transactionIndex !== "bigint") {
      transactionIndex = BigInt(transactionIndex);
    }

    const multisigTx = multisig.transactions.proposalReject({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet.publicKey,
      multisigPda,
      transactionIndex: transactionIndex,
      member: agent.wallet.publicKey,
    });

    multisigTx.sign([agent.wallet]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Reject proposal failed: ${error}`);
  }
}

/**
 * Transfer SOL or SPL tokens from a multisig treasury vault to a recipient.
 * @param agent - SolanaAgentKit instance.
 * @param amount - Amount to transfer.
 * @param to - Recipient's public key.
 * @param vaultIndex - Optional vault index, default is 0.
 * @param mint - Optional mint address for SPL tokens.
 * @returns Transaction signature.
 */
export async function multisig_transfer_from_treasury(
  agent: SolanaAgentKit,
  amount: number,
  to: PublicKey,
  vaultIndex: number = 0,
  mint?: PublicKey,
): Promise<string> {
  try {
    let transferInstruction: TransactionInstruction;

    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    const transactionIndex = BigInt(currentTransactionIndex + 1);
    const [vaultPda] = multisig.getVaultPda({
      multisigPda,
      index: vaultIndex,
    });

    if (!mint) {
      // Transfer native SOL
      transferInstruction = SystemProgram.transfer({
        fromPubkey: agent.wallet_address,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      });
    } else {
      // Transfer SPL token
      const fromAta = await getAssociatedTokenAddress(mint, vaultPda, true);
      const toAta = await getAssociatedTokenAddress(mint, to, true);
      const mintInfo = await getMint(agent.connection, mint);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      transferInstruction = createTransferInstruction(
        fromAta,
        toAta,
        agent.wallet_address,
        adjustedAmount,
      );
    }

    const transferMessage = new TransactionMessage({
      payerKey: vaultPda,
      recentBlockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      instructions: [transferInstruction],
    });

    const multisigTx = multisig.transactions.vaultTransactionCreate({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet_address,
      multisigPda,
      transactionIndex,
      creator: agent.wallet_address,
      vaultIndex: 0,
      ephemeralSigners: 0,
      transactionMessage: transferMessage,
    });

    multisigTx.sign([agent.wallet]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
