import * as Const from "../utils/Cons";
import moment from "moment";
import dataJson from "../data/data.json";

export const status_columns = [
    {
        header: "Server Address",
        accessor: "server_address",
    },
    {
        header: "Height",
        accessor: "height",
    },
    {
        header: "Latency",
        accessor: "latency",
    },
    {
        header: "Synced",
        accessor: "synced",
    },
    {
        header: "Score",
        accessor: "score",
    }
];

async function fetchWithTimeout(resource, options, auth) {
    const {timeout = 8000} = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    let response;
    if (auth.length > 1) {
        response = await fetch(resource, {
            ...options,
            signal: controller.signal,
            headers: {
                Authorization: "Bearer " + auth,
            },
        });
    } else {
        response = await fetch(resource, {
            ...options,
            signal: controller.signal,
        });
    }

    clearTimeout(id);
    return response;
}


export const fetchRPCAndAPIBySearch = async (isRpc, domain) => {
    try {
        const url = isRpc ? Const.API_GET_RPCS : Const.API_GET_INDEXERS;
        let data = await fetchWithTimeout(
            url + "?domain=" + domain,
            {
                method: "GET",
                timeout: 10000,
            },
            ""
        );
        data = await data.json();
        return data;
    } catch (e) {
        console.log("error to fetch rpc and api by search " + e);
    }
};

export const fetchRPCAndAPI = async (isRpc) => {
    try {
        const url = isRpc ? Const.API_GET_RPCS : Const.API_GET_INDEXERS;
        console.log(url);
        let data = await fetchWithTimeout(
            url + "?domain=all",
            {
                method: "GET",
                timeout: 10000,
            },
            ""
        );
        data = await data.json();
        return data;
    } catch (e) {
        console.log("error to fetch rpc and api " + e);
    }
};

export const getNetworkStatus = async () => {
    const emptyData = JSON.parse(`[]`);
    try {
        let data = await fetchWithTimeout(
            Const.RPC_STATUS,
            {
                method: "GET",
                timeout: 10000,
            },
            ""
        );
        data = await data.json();
        const networkStatus = {
            network: data.result.node_info.network,
            latestBlockHeight: data.result.sync_info.latest_block_height,
        };
        return networkStatus;
    } catch (e) {
        console.log("error to fetch network status data " + e);
    }
    return emptyData;
};
