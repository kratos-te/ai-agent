import { Container, Card, Flex, Box, Text, Select, TextArea, Button, Grid, TextField, AlertDialog, Dialog } from "@radix-ui/themes";
import { useCreateAiAgent, useClaim, useDeleteAiAgent } from "../mutations/agents";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { ApiEndpoint, Contract } from "../constants";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { Address } from '@ant-design/web3';
import toast from "react-hot-toast";
import { useState } from 'react';
import Axios from "axios";
import { Loading } from "./Loading";

export function Agents() {
    const [needCreate, setNeedCreate] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("POST");
    const [url, setURL] = useState("");
    const [params, setParams] = useState("");
    const [description, setDescription] = useState("");
    const [token, setToken] = useState("SUI");
    const [price, setPrice] = useState(0);
    const [open, setOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState({
        id: "",
        type: ""
    });

    const [openLoading, setOpenLoading] = useState(false);

    const { mutate: createAiAgent, isPending, isSuccess: isCreateSuccess } = useCreateAiAgent();
    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;

    if (isCreateSuccess) {
        setTimeout(function () {
            setOpenLoading(false);
            setNeedCreate(false);
        }, 1000)
    }

    const { mutate: deleteAiAgent } = useDeleteAiAgent();
    const { mutate: claimAiAgent } = useClaim();

    const { data, isSuccess } = useQuery({
        queryKey: ["GetAIAgents", address],
        queryFn: async () => {
            const response = await Axios.post(ApiEndpoint + "/get-agents", {
                address: address
            })

            return response.data;
        }
    });

    let resultData: any[] = [];

    if (isSuccess && data && data.data) {
        for (var i = 0; i < data.data.length; i++) {
            let item = data.data[i];
            let type_name = item.type_name;

            if (type_name && type_name.name == Contract.SuiFullType) {
                item.type = "SUI";
                item.small_balance = item.balance / 1_000_000_000.0;
            } else if (type_name && type_name.name == Contract.BuckFullType) {
                item.type = "BUCK";
                item.small_balance = item.balance / 1_000_000_000.0;
            } else {
                item.type = "";
            }

            if (item.name) {
                resultData.push(item);
            }
        }
    }

    return (
        <>
            <Container size="3" mt="5" pt="5" px="4">
                {needCreate ? (
                    <Card>
                        <Flex position="sticky" px="4" py="2" justify="between">
                            <Box>
                                <Button onClick={() => setNeedCreate(false)}>
                                    <ArrowLeftIcon></ArrowLeftIcon>
                                </Button>
                            </Box>
                            <Box>
                                <Text size="6" weight="bold">Create New AI Agent</Text>
                            </Box>
                            <Box></Box>
                        </Flex>

                        <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="2">
                            <Box>
                                <Text size="3">Name</Text>
                            </Box>
                            <Box>
                                <Text size="3">Type</Text>
                            </Box>
                        </Grid>

                        <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="3">
                            <Box pr="4">
                                <TextField.Root size="3" style={{ height: 50 }} value={name} onChange={(e) => setName(e.target.value)} />
                            </Box>

                            <Box>
                                <Select.Root size="3" value={type} onValueChange={setType}>
                                    <Select.Trigger placeholder="Select Type" variant="soft" style={{ width: "100%", height: 50 }} />
                                    <Select.Content position="popper" sideOffset={5} className="SelectContent">
                                        <Select.Group>
                                            <Select.Item value="POST">POST</Select.Item>
                                            <Select.Item value="GET">GET</Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                            </Box>
                        </Grid>

                        <Box px="4" pt="3">
                            <Text size="3">URL</Text>
                        </Box>

                        <Box px="4" pt="2">
                            <TextField.Root size="3" style={{ height: 50 }} type="url" value={url} onChange={(e) => setURL(e.target.value)} />
                        </Box>

                        <Box px="4" pt="3">
                            <Text size="3">Params (JSON)</Text>
                        </Box>

                        <Box px="4" pt="2">
                            <TextArea size="3" style={{ height: 100 }} value={params} onChange={(e) => setParams(e.target.value)} />
                        </Box>

                        <Box px="4" pt="3">
                            <Text size="3">Description</Text>
                        </Box>

                        <Box px="4" pt="2">
                            <TextArea size="3" style={{ height: 100 }} value={description} onChange={(e) => setDescription(e.target.value)} />
                        </Box>

                        <Box px="4" pt="3">
                            <Text size="3">Fee Setting</Text>
                        </Box>

                        <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="2">
                            <Box>
                                <Text size="3">Token</Text>
                            </Box>
                            <Box>
                                <Text size="3">Price</Text>
                            </Box>
                        </Grid>

                        <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="3">
                            <Box>
                                <Select.Root size="3" value={token} onValueChange={setToken}>
                                    <Select.Trigger placeholder="Select Token" variant="soft" style={{ width: "100%", height: 50 }} />
                                    <Select.Content position="popper" sideOffset={5} className="SelectContent">
                                        <Select.Group>
                                            <Select.Item value="SUI">SUI</Select.Item>
                                            <Select.Item value="BUCK">BUCK</Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                            </Box>

                            <Box>
                                <TextField.Root size="3" style={{ height: 50 }} type="number" value={price} onChange={(e) => setPrice(e.target.valueAsNumber)} />
                            </Box>
                        </Grid>

                        <Box px="4" pt="5">
                            <Button radius="large" variant="soft" style={{ width: "100%", height: 80 }} onClick={() => onSumbit()} disabled={isPending}>
                                <Text size="5">
                                    Submit
                                </Text>
                            </Button>
                        </Box>
                    </Card>
                ) : (
                    <>
                        <Flex position="sticky" px="4" py="2" mb="2" justify="between">
                            <Box>
                                <Text weight="bold" size="6">Your Agents <Text size="3">({resultData.length})</Text></Text>
                            </Box>
                            <Box>
                                <Button style={{ width: "100px" }} onClick={() => setNeedCreate(true)}>Create</Button>
                            </Box>
                        </Flex>

                        {resultData.map((jsonData) => (
                            <Card key={jsonData.id}>
                                <Flex position="sticky" px="2" pt="2" mb="3" justify="between">
                                    <Box>
                                        <Flex gap="3" align="baseline">
                                            <Text weight="bold" size="6">{jsonData.name}</Text>
                                            <Address
                                                ellipsis={{
                                                    headClip: 8,
                                                    tailClip: 6,
                                                }}
                                                copyable
                                                address={jsonData.receive_address}
                                            />
                                        </Flex>
                                    </Box>
                                    <Box>
                                        <Flex gap="2" align="baseline">
                                            <Text weight="bold" mr="2">{jsonData.small_balance} {jsonData.type}</Text>
                                            <Button onClick={() => onClaim(jsonData)}>Claim</Button>
                                            <Button color="red" onClick={() => onDelete(jsonData)}>Delete</Button>
                                        </Flex>
                                    </Box>
                                </Flex>

                                <Card>
                                    <Box py="1">
                                        <Flex position="sticky" justify="between">
                                            <Box>
                                                <Text>Url</Text>
                                            </Box>
                                            <Box>
                                                <Text>{jsonData.url}</Text>
                                            </Box>
                                        </Flex>
                                    </Box>

                                    <Box py="1">
                                        <Flex position="sticky" justify="between">
                                            <Box>
                                                <Text>Params</Text>
                                            </Box>
                                            <Box>
                                                <Text>{jsonData.params}</Text>
                                            </Box>
                                        </Flex>
                                    </Box>

                                    <Box py="1">
                                        <Flex position="sticky" justify="between">
                                            <Box>
                                                <Text>Description</Text>
                                            </Box>
                                            <Box>
                                                <Text>{jsonData.description}</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                </Card>

                                <Box px="2" py="0">
                                </Box>
                            </Card>
                        ))}

                        <AlertDialog.Root open={open} onOpenChange={setOpen}>
                            <AlertDialog.Content maxWidth="450px">
                                <AlertDialog.Title>Delete Agent</AlertDialog.Title>
                                <AlertDialog.Description size="2">
                                    Are you sure? This AI Agent will no longer be accessible after deleted
                                </AlertDialog.Description>

                                <Flex gap="3" mt="4" justify="end">
                                    <AlertDialog.Cancel>
                                        <Button variant="soft" color="gray">
                                            Cancel
                                        </Button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action>
                                        <Button variant="solid" color="red" onClick={() => onConfirmDelete()}>
                                            Confirm
                                        </Button>
                                    </AlertDialog.Action>
                                </Flex>
                            </AlertDialog.Content>
                        </AlertDialog.Root>
                    </>
                )}

                <Dialog.Root open={openLoading} onOpenChange={setOpenLoading}>
                    <Dialog.Trigger>
                        <Box></Box>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px" onInteractOutside={(e) => { e.preventDefault(); }}>
                        <Dialog.Title>Submit</Dialog.Title>
                        <Dialog.Description></Dialog.Description>

                        <Box>
                            {isPending && <Loading />}
                            <Flex justify="center">
                                {isPending ? (
                                    <Text>Submiting the transaction...</Text>
                                ) : (
                                    <Text>Successful</Text>
                                )}
                            </Flex>

                            <Box py="5">
                                <Card>
                                    <Text>Please do not leave this page until the transaction is successful</Text>
                                </Card>
                            </Box>
                        </Box>

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

    function onConfirmDelete() {
        let callArgs = {
            id: deleteItem.id,
            token: deleteItem.type
        };

        deleteAiAgent(callArgs);
    }

    function onDelete(data: any) {
        setOpen(true);
        setDeleteItem(data);
    }

    function onClaim(data: any) {
        let callArgs = {
            id: data.id,
            token: data.type
        };

        claimAiAgent(callArgs);
    }

    function onSumbit() {
        if (price <= 0) {
            toast.error(`price invalid`);
            return;
        }

        Axios.post(ApiEndpoint + "/get-encrypt", {
            url: url
        }).then(response => {
            let data = response.data;
            if (data.code == 0) {
                let encrypt_url = data.data;

                createAiAgent({
                    name,
                    encrypt_url,
                    method_type: type,
                    params,
                    description,
                    price,
                    token
                });
                setOpenLoading(true);
            }
        })
    }
}