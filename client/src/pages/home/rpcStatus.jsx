import React, { useState, useEffect } from "react";
import * as Data from "../data";
import RpcStatusTable from "../../components/table/rpcStatus";
import styles from "./styles.module.css";
import * as Const from "../../utils/Cons";

const RpcStatus = () => {
  const [pageData, setPageData] = useState({
    rowData: [],
    isLoading: false,
    pageNumber: 1,
    totalPassengers: 0,
  });

  const [network, setNetwork] = useState({
    network: "",
    latestBlockHeight: 0,
  });

  useEffect(() => {
    setPageData((prevState) => ({
      ...prevState,
      rowData: [],
      isLoading: true,
    }));

    loadRpcData();
    const intervalCall = setInterval(() => {
      loadRpcData();
    }, Const.TIME_RELOAD);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  useEffect(() => {
    setPageData((prevState) => ({
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

  function loadRpcData() {
    Data.fetchRPCAndAPI(true).then((info) => {
      const totalPassengers = info.length;
      setPageData({
        isLoading: false,
        rowData: info,
        totalPassengers: totalPassengers,
      });
    });
  }

  return (
    <div>
      <div className={styles.operator_detail_header}>
        <div className={styles.operator_detail_header_address}>
          <h3>Namada RPCs status</h3>
          <span>Available {pageData.totalPassengers} Rpc can fetch data.</span>
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
          data={pageData.rowData}
          isLoading={pageData.isLoading}
          network={network}
          isPagging={true}
        />
      </div>
    </div>
  );
};

export default RpcStatus;
