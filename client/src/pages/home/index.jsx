import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { browserHistory } from "react-router";
import styles from "./styles.module.css";
import { ReactComponent as Logo } from "../../logo.svg";
import RpcStatus from "./rpcStatus";
import ApiStatus from "./apiStatus";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import * as Utils from "../../utils/utils";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CheckDomainStatus from "./checkDomainStatus";

const HomePage = () => {
  const [tab, setTab] = React.useState("1");
  const [searchInput, setSearchInput] = React.useState("");
  const [isSearch, setIsSearch] = React.useState(false);

  const [alert, setAlert] = useState({
    open: false,
    alertType: "",
    message: "",
    vertical: "top",
    horizontal: "center",
  });
  const { vertical, horizontal } = alert;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.has("checkDomain")) {
      setTab("checkDomain");
    }else {
      const pathName = window.location.pathname;
      if (pathName.startsWith("/rpcs/")) {
        setTab("rpcs");
      } else if (pathName.startsWith("/apis")) {
        setTab("apis");
      } else {
        setTab("rpcs");
      }
    }
  }, []);

  function rpcs() {
    return (
      <div>
        <RpcStatus/>
      </div>
    );
  }

  function apis() {
    return (
      <div>
        <ApiStatus/>
      </div>
    );
  }


  function checkDomain() {
    return (
        <div>
          <CheckDomainStatus/>
        </div>
    );
  }

  function alertMsg(alertType, message) {
    setAlert({
      ...alert,
      open: true,
      alertType: alertType,
      message: message,
    });
  }

  function tabs() {
    const handleChange = (event, newValue) => {
      setTab(newValue);
      switch (newValue) {
        case "rpcs":
          return browserHistory.push("/rpcs");
        case "apis":
          return browserHistory.push("/apis");
        default:
          return browserHistory.push("/");
      }
    };

    const handleChangeSearchInput = (event) => {
      setSearchInput(event.target.value);
      if (event.target.value.trim().length == 0) {
        setIsSearch(false);
      }
    };

    function isValidDomain(domain) {
      const domainRegex = /^(http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?$/;
      return domainRegex.test(domain);
    }


    const submitSearch = () => {
      if (searchInput.length > 0 && isValidDomain(searchInput)) {
        setIsSearch(true);
        let url = Utils.getDomain();
        url += "/?checkDomain=" + searchInput;
        window.location.href = url;
      }else {
        alertMsg(
            "error",
            "Your input is invalid for domain"
        );
      }
    };

    function handleCloseAlert() {
      setAlert({
        ...alert,
        open: false,
        alertType: "",
        message: "",
      });
    }

    return (
      <Box sx={{ width: "100%", typography: "body" }}>
        <TabContext value={tab}>
          <Box
            sx={{
              mb: 0,
              borderBottom: 1,
              borderColor: "divider",
              textAlign: "left",
              marginLeft: "20px",
              paddingTop: "20px",
              display: "flex",
              flexDirection: "row",
              overflowX: "scroll",
              overflowY: "hidden",
              height: "90px",
            }}
          >
            <div className={styles.logo_header}>
              <a href="/">
                <div>
                  <i>
                    <Logo height={60} />
                  </i>
                </div>
              </a>
            </div>
            <TabList
              onChange={handleChange}
              aria-label=""
              sx={{ display: "flex", paddingLeft: "20px", minWidth: "500px" }}
            >
              <Tab
                sx={{ padding: 0, width: "120px" }}
                label="RPCs"
                value="rpcs"
              />
              <Tab
                sx={{ padding: 0, width: "120px" }}
                label="Indexer"
                value="apis"
              />
            </TabList>
            <div style={{ flex: "1 1 0%" }}></div>
            <div className={styles.search}>
              <TextField
                label="Checking your rpc / indexer"
                variant="outlined"
                fullWidth
                value={searchInput}
                onChange={handleChangeSearchInput}
                onKeyUp={(event) => {
                  if (event.key == "Enter") submitSearch();
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton>
                      <SearchIcon onClick={() => submitSearch()} />
                    </IconButton>
                  ),
                }}
              />
            </div>
          </Box>
          <TabPanel value="rpcs">{rpcs()}</TabPanel>
          <TabPanel value="apis">{apis()}</TabPanel>
          <TabPanel value="checkDomain">{checkDomain()}</TabPanel>

        </TabContext>
        <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={alert.open}
            onClose={handleCloseAlert}
            key={vertical + horizontal}
            autoHideDuration={5000}
        >
          <Alert
              onClose={handleCloseAlert}
              severity={alert.alertType}
              sx={{ width: "100%" }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return <div className={styles.content_body}>{tabs()}</div>;
};

export default HomePage;
