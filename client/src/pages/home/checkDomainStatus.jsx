import React, { useState, useEffect } from "react";
import * as Data from "../data";
import RpcStatusTable from "../../components/table/rpcStatus";
import styles from "./styles.module.css";
import * as Const from "../../utils/Cons";
import ApiTable from "../../components/table/apiStatus";

const CheckDomainStatus = () => {
  const [pageRpcData, setPageRpcData] = useState({
    rowData: [],
    isLoading: false,
    pageNumber: 1,
    totalPassengers: 0,
  });

  const [pageApiData, setPageApiData] = useState({
    rowData: [],
    isLoading: false,
    pageNumber: 1,
    totalPassengers: 0,
  });

  const [network, setNetwork] = useState({
    network: "",
    latestBlockHeight: 0,
  });

  const [domain, setDomain] = useState();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const domain = query.get("checkDomain");
    setDomain(domain);

    setPageRpcData((prevState) => ({
      ...prevState,
      rowData: [],
      isLoading: true,
    }));

    setPageApiData((prevState) => ({
      ...prevState,
      rowData: [],
      isLoading: true,
    }));

    loadRpcData(domain);
    const intervalCall = setInterval(() => {
      loadRpcData(domain);
    }, Const.TIME_RELOAD);

    loadApi(domain);
    const intervalCallApi = setInterval(() => {
      loadApi(domain);
    }, Const.TIME_RELOAD);

    return () => {
      clearInterval(intervalCall);
      clearInterval(intervalCallApi);
    };
  }, []);

  useEffect(() => {
    setPageRpcData((prevState) => ({
      ...prevState,
      rowData: [],
      isLoading: true,
    }));

    Data.getNetworkStatus().then((info) => {
      setNetwork(info);
    });

    const intervalCall = setInterval(() => {
      Data.getNetworkStatus().then((info) => {
        setNetwork(info);
      });
    }, Const.TIME_RELOAD);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  function loadRpcData(domain) {
    Data.fetchRPCAndAPIBySearch(true, domain).then((info) => {
      console.log("info: " + info);
      setPageRpcData({
        isLoading: false,
        rowData: info,
        totalPassengers: 1,
      });
    });
  }

  function loadApi(domain) {
    Data.fetchRPCAndAPIBySearch(false, domain).then((info) => {
      console.log(info);
      setPageApiData({
        isLoading: false,
        rowData: info,
        totalPassengers: 1,
      });
    });
  }

  return (
    <div>
      <div className={styles.operator_detail_header}>
        <div className={styles.operator_detail_header_address}>
          <h3>Namada RPC status</h3>
          <span>
            Available {pageRpcData.totalPassengers} Rpc can fetch data.
          </span>
        </div>
        <div className={styles.operator_detail_header_value}>
          <div className={styles.operator_detail_header_value_item}>
            <div className={styles.operator_detail_header_value_item_lable}>
              Network name
            </div>
            <div>
              <div>{network.network}</div>
            </div>
          </div>
          <div className={styles.operator_detail_header_value_item}>
            <div className={styles.operator_detail_header_value_item_lable}>
              Latest block height
            </div>
            <div>
              <div>{network.latestBlockHeight}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.table_content}>
        <RpcStatusTable
          columns={Data.status_columns}
          data={pageRpcData.rowData}
          isLoading={pageRpcData.isLoading}
          network={network}
          isPagging={false}
        />
      </div>
      <div className={styles.indexer_detail_header_address}>
        <h3>Namada Indexer status</h3>
        <span>Available {pageRpcData.totalPassengers} Rpc can fetch data.</span>
      </div>

      <div className={styles.table_content}>
        <ApiTable
          columns={Data.status_columns}
          data={pageApiData.rowData}
          isLoading={pageApiData.isLoading}
          network={network}
          isPagging={false}
        />
      </div>
    </div>
  );
};

export default CheckDomainStatus;
