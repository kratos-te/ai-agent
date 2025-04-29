import { useTransactionExecution } from "../hooks/useTransactionExecution";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Contract } from "../constants";
import toast from "react-hot-toast";

export function useCreateAiAgent() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            encrypt_url,
            method_type,
            params,
            description,
            price,
            token
        }: {
            name: string;
            encrypt_url: string;
            method_type: string;
            params: string;
            description: string;
            price: number;
            token: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let price_amount = 0;
            let coinType: string = "";
            if (token == "SUI") {
                coinType = Contract.SuiType;
                price_amount = price * 1_000_000_000;
            } else if (token == "BUCK") {
                coinType = Contract.BuckType;
                price_amount = price * 1_000_000_000;
            }

            const txb = new Transaction();
            txb.moveCall({
                target: `${Contract.PackageId}::ai_agent::create_ai_agent`,
                arguments: [
                    txb.object(Contract.ContainerObjectId),
                    txb.pure.string(name),
                    txb.pure.string(encrypt_url),
                    txb.pure.string(method_type),
                    txb.pure.string(params),
                    txb.pure.string(description),
                    txb.pure.u64(price_amount),
                ],
                typeArguments: [coinType],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["GetAIAgents", currentAccount?.address] });
            }, 1_000);
        },
    });
}

export function useDeleteAiAgent() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            token
        }: {
            id: string;
            token: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let coinType: string = "";
            if (token == "SUI") {
                coinType = Contract.SuiType;
            } else if (token == "BUCK") {
                coinType = Contract.BuckType;
            }

            const txb = new Transaction();

            txb.moveCall({
                target: `${Contract.PackageId}::ai_agent::delete_ai_agent`,
                arguments: [
                    txb.object(Contract.ContainerObjectId),
                    txb.pure.id(id),
                ],
                typeArguments: [coinType],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["GetAIAgents", currentAccount?.address] });
            }, 1_000);
        },
    });
}


export function useCallAiAgent() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const client = useSuiClient();

    return useMutation({
        mutationFn: async ({
            id,
            params,
            price,
            token
        }: {
            id: string;
            params: string;
            price: number;
            token: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let coinType: string = "";
            let amount: number = price;
            if (token == "SUI") {
                coinType = Contract.SuiType;
                amount = price;
            } else if (token == "BUCK") {
                coinType = Contract.BuckType;
                amount = price;
            }

            const txb = new Transaction();

            const coins = (
                await client.getCoins({
                    owner: currentAccount.address,
                    coinType: coinType,
                })
            ).data;

            const [primaryCoin, ...mergeCoins] = coins.filter(function(coin) {
                console.log(coin.coinType)
                return coin.coinType == coinType;
            });

            if (primaryCoin === undefined) {
                toast.error(token + " not enough")
                return;
            }

            const [transferCoin] = (() => {
                if (coinType === Contract.SuiType) {
                    return txb.splitCoins(txb.gas, [amount]);
                } else {
                    const primaryCoinInput = txb.object(primaryCoin.coinObjectId);
                    if (mergeCoins.length) {
                        txb.mergeCoins(
                            primaryCoinInput,
                            mergeCoins.map((coin) => txb.object(coin.coinObjectId)),
                        );
                    }
                    return txb.splitCoins(primaryCoinInput, [amount]);
                }
            })();

            txb.setGasBudget(10000000);
            txb.moveCall({
                target: `${Contract.PackageId}::ai_agent::call_ai_agent`,
                arguments: [
                    txb.object(Contract.ContainerObjectId),
                    txb.pure.id(id),
                    txb.pure.string(params),
                    transferCoin,
                ],
                typeArguments: [coinType],
            });

            return executeTransaction(txb);
        },
    });
}

export function useClaim() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            token
        }: {
            id: string;
            token: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let coinType: string = "";
            if (token == "SUI") {
                coinType = Contract.SuiType;
            } else if (token == "BUCK") {
                coinType = Contract.BuckType;
            }

            const txb = new Transaction();

            txb.moveCall({
                target: `${Contract.PackageId}::ai_agent::claim`,
                arguments: [
                    txb.object(Contract.ContainerObjectId),
                    txb.pure.id(id),
                ],
                typeArguments: [coinType],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["GetAIAgents", currentAccount?.address] });
            }, 1_000);
        },
    });
}