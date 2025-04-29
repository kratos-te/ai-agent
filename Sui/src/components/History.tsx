import { Container, Card, Flex, Box, Text, Link } from "@radix-ui/themes";
import { ApiEndpoint, Contract } from "../constants";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Axios from "axios";

export function History() {
    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;

    const { data, isSuccess } = useQuery({
        queryKey: ["GetCallerResults", address],
        queryFn: async () => {
            const response = await Axios.post(ApiEndpoint + "/get-caller-results", {
                caller: address
            })

            return response.data;
        }
    });

    let resultData: any[] = [];

    if (isSuccess && data && data.data) {
        for (var i = 0; i < data.data.length; i++) {
            let item = data.data[i];
            if (Contract.Network == "mainnet") {
                item.link = "https://suivision.xyz/txblock/" + item.txid;
            } else {
                item.link = "https://" + Contract.Network + ".suivision.xyz/txblock/" + item.txid;
                item.blob_id_link = "https://aggregator-devnet.walrus.space/v1/" + item.blob_id_base64;
            }
            let txid: string = item.txid;
            item.txid_good = txid.substring(0, 8) + "..." + txid.substring(txid.length - 6)
            if (item.code == 500) {
                item.data = "Error: " + item.error;
            }
            resultData.push(item);
        }
    }

    return (
        <>
            <Container size="2">
                {
                    resultData.map((jsonData) => (
                        <Box px="2" py="3" key={jsonData.time}>
                            <Card>
                                <Box>
                                    <Text weight="bold" size="6">{jsonData.name}</Text>
                                    <Text ml="3">{jsonData.description}</Text>
                                </Box>
                                <Box>
                                    <Box pb="2">
                                        <Text weight="bold">Instructions: </Text>
                                    </Box>
                                    <Card>
                                        <Text>{JSON.stringify(jsonData.params)}</Text>
                                    </Card>
                                </Box>
                                <Box>
                                    <Box pb="2">
                                        <Text weight="bold">Output: </Text>
                                    </Box>
                                    <Card>
                                        <Text>{jsonData.data}</Text>
                                    </Card>
                                </Box>
                                <Box pt="3">
                                    <Card>
                                        <Flex position="sticky" justify="between">
                                            <Box>
                                                <Text>Time</Text>
                                            </Box>
                                            <Box>
                                                <Text>{moment(parseInt(jsonData.time)).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                            </Box>
                                        </Flex>
                                        <Flex position="sticky" justify="between">
                                            <Box>
                                                <Text>Call Txid</Text>
                                            </Box>
                                            <Box>
                                                <Link target="_blank" href={jsonData.link}>{jsonData.txid_good}</Link>
                                            </Box>
                                        </Flex>
                                        <Flex position="sticky" justify="between">
                                            <Box>
                                                <Text>Walrus Blob ID</Text>
                                            </Box>
                                            <Box>
                                                <Link target="_blank" href={jsonData.blob_id_link}>{jsonData.blob_id_base64}</Link>
                                            </Box>
                                        </Flex>
                                    </Card>
                                </Box>
                            </Card>
                        </Box>
                    ))
                }
            </Container>
        </>
    )
}