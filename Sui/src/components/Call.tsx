import { Card, Flex, Box, Heading, Text, TextArea, Button, Container, Dialog, TextField } from "@radix-ui/themes";
import { ClockIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useCallAiAgent } from "../mutations/agents";
import { ApiEndpoint, Contract } from "../constants";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from 'react';
import Axios from "axios";
import { Loading } from "./Loading";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { CallAIMessage } from "../typing";

export function Call() {
    const initSelectItem = {
        id: "",
        name: "Please Select Agent first",
        price: 0,
        token: "",
        type_name: "",
        type: "",
        small_price: 0,
        description: "",
        params: "",
    }
    const [selectItem, setSelectItem] = useState(initSelectItem);

    const [searchParams, setSearchParams] = useState("");
    const [params, setParams] = useState("");
    const [open, setOpen] = useState(false);
    const [openLoading, setOpenLoading] = useState(false);
    const [isCallingAIDone, setCallingAI] = useState(false);
    const [aiOutput, setAIOutput] = useState({
        name: "",
        description: "",
        data: "",
        params: "",
    });

    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;

    let resultData: any[] = [];

    const { data, isSuccess } = useQuery({
        queryKey: ["GetAIAgents"],
        queryFn: async () => {
            const response = await Axios.post(ApiEndpoint + "/get-all-agents", {})
            return response.data;
        }
    });

    if (isSuccess) {
        for (var i = 0; i < data.data.length; i++) {
            let item = data.data[i];
            let type_name = item.type_name;
            if (searchParams && item.name.indexOf(searchParams) == -1) {
                continue;
            }

            if (type_name && type_name.name == Contract.SuiFullType) {
                item.type = "SUI";
                item.small_price = item.price / 1_000_000_000.0;
            } else if (type_name && type_name.name == Contract.BuckFullType) {
                item.type = "BUCK";
                item.small_price = item.price / 1_000_000_000.0;
            }

            if (item.name) {
                resultData.push(item);
            }
        }
    }

    const { data: callResult, mutate: callAiAgent, isSuccess: isCallSuccess, isPending: isCallPending } = useCallAiAgent();

    if (isCallSuccess) {
        let callData: SuiTransactionBlockResponse = callResult as SuiTransactionBlockResponse;
        if (callData) {
            let events = callData.events;
            if (events && events.length > 0) {
                let event = events[0];
                let message = event.parsedJson as CallAIMessage
                let nonce = message.nonce;

                checkingCallAgent(selectItem.id, address, nonce, function () {

                })
            }
        }
    }

    return (
        <>
            <Container size="2" mt="5" pt="2" px="4">
                <Card>
                    <Flex position="sticky" px="4" py="2" justify="between">
                        <Box>
                            <Heading>
                                Call Agent
                            </Heading>
                        </Box>

                        <Box>
                            <ClockIcon width="30" height="30" />
                        </Box>
                    </Flex>

                    <Box px="4">
                        <Text>Please select an API agent and enter an instruction to call it.</Text>
                    </Box>

                    <Box px="4" pt="3">
                        <Text size="5">Select Interface</Text>
                    </Box>

                    <Box px="4" my="3">
                        <Dialog.Root open={open} onOpenChange={setOpen}>
                            <Dialog.Trigger>
                                <Button radius="large" variant="soft" style={{ width: "100%", height: 80 }}>
                                    <Flex position="sticky" justify="between" style={{ width: "100%" }}>
                                        <Box>
                                            <Text size="5" style={{ height: 30 }}>
                                                {selectItem.name}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <ChevronDownIcon width="30" height="30" />
                                        </Box>
                                    </Flex>
                                </Button>
                            </Dialog.Trigger>

                            <Dialog.Content maxWidth="450px" height="800px">
                                <Dialog.Title>Select Agent</Dialog.Title>
                                <Dialog.Description></Dialog.Description>
                                <Flex direction="column" gap="3">
                                    <TextField.Root placeholder="Search name or paste address" onChange={(e) => setSearchParams(e.target.value)}>
                                        <TextField.Slot>
                                            <MagnifyingGlassIcon height="16" width="16" />
                                        </TextField.Slot>
                                    </TextField.Root>

                                    {
                                        resultData.map((jsonData) => (
                                            <Button key={jsonData.id} style={{ height: "50px" }} color="blue" onClick={() => { onSelect(jsonData); }}>
                                                <Flex position="sticky" justify="between" style={{ width: "100%" }}>
                                                    <Text mr="2">{jsonData.name}</Text>
                                                    <Text>{jsonData.small_price} {jsonData.type}/Call</Text>
                                                </Flex>
                                            </Button>
                                        ))
                                    }
                                </Flex>
                            </Dialog.Content>
                        </Dialog.Root>
                    </Box>

                    {selectItem.type ? (
                        <Flex justify="between" px="4" align="baseline">
                            <Text size="4">{selectItem.description}</Text>
                            <Box px="4">
                                <Text>{selectItem.small_price} {selectItem.type}/Call</Text>
                            </Box>
                        </Flex>
                    ) : null}

                    <Box px="4" mt="2">
                        <Flex justify="between">
                            <Text size="5">Params</Text>
                            <Text>{selectItem.params}</Text>
                        </Flex>
                    </Box>

                    <Box px="4" py="3">
                        <TextArea size="3" value={params} onChange={(e) => setParams(e.target.value)} />
                    </Box>

                    <Box px="4" pt="3">
                        <Button radius="large" variant="soft" style={{ width: "100%", height: 80 }} onClick={() => onApproveAndCall()}>
                            <Text size="5">
                                Approve and Call
                            </Text>
                        </Button>
                    </Box>
                </Card>

                <Dialog.Root open={openLoading} onOpenChange={setOpenLoading}>
                    <Dialog.Trigger>
                        <Box></Box>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px" onInteractOutside={(e) => { e.preventDefault(); }}>
                        <Dialog.Title>Approve and Call</Dialog.Title>
                        <Dialog.Description></Dialog.Description>

                        {
                            isCallingAIDone ? (
                                <Box>
                                    <Text>Output</Text>
                                    <Card>
                                        <Box>
                                            <Text weight="bold" size="6">{aiOutput.name}</Text>
                                            <Text ml="3">{aiOutput.description}</Text>
                                        </Box>
                                        <Box>
                                            <Box pb="2">
                                                <Text weight="bold">Instructions: </Text>
                                            </Box>
                                            <Card>
                                                <Text>{JSON.stringify(aiOutput.params)}</Text>
                                            </Card>
                                        </Box>
                                        <Box>
                                            <Box pb="2">
                                                <Text weight="bold">Output: </Text>
                                            </Box>
                                            <Card>
                                                <Text>{aiOutput.data}</Text>
                                            </Card>
                                        </Box>
                                    </Card>
                                </Box>
                            ) : (
                                <Box>
                                    <Loading />
                                    <Flex justify="center">
                                        {isCallPending ? (
                                            <Text>Approving the transaction...</Text>
                                        ) : (
                                            <Text>Calling agent...</Text>
                                        )}
                                    </Flex>

                                    <Box py="5">
                                        <Card>
                                            <Text>Please do not leave this page until the transaction is successful</Text>
                                        </Card>
                                    </Box>
                                </Box>
                            )
                        }

                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                    Close
                                </Button>
                            </Dialog.Close>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Root>
            </Container>
        </>
    );

    function checkingCallAgent(id, caller, nonce, cb) {
        Axios.post(ApiEndpoint + "/get-call-result", {
            id,
            caller,
            nonce,
        }).then(response => {
            let data = response.data;
            if (data.code == 0) {
                let result = data.data;
                if (result) {
                    setParams("");
                    setSelectItem(initSelectItem);
                    setAIOutput(JSON.parse(result));
                    setCallingAI(true);
                    cb();
                } else {
                    setTimeout(function () {
                        checkingCallAgent(id, caller, nonce, cb)
                    }, 1000);
                }
            }
        })
    }

    function onSelect(jsonData: any) {
        setSelectItem(jsonData)
        setOpen(false)
    }

    function onApproveAndCall() {
        if (!params) {
            toast.error(`params is null`);
            return;
        }

        try {
            JSON.parse(params);

            let callArgs = {
                params,
                id: selectItem.id,
                price: selectItem.price,
                token: selectItem.type
            };

            callAiAgent(callArgs);
            setOpenLoading(true);
        } catch (e) {
            toast.error(`params invalid`);
        }
    }
}