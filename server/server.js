const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const app = express();
const port = 4003;
const cors = require("cors");

app.use(cors());

const fetchRpcData = (api) => {
  try {
    return new Promise((resolve, reject) => {
      const client = api.startsWith("https") ? https : http;
      const startTime = Date.now();
      const req = client
        .get(`${api}/status`, (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            try {
              const json = JSON.parse(body);
              const height = json.result.sync_info.latest_block_height;
              const latencyInSeconds = (
                (Date.now() - startTime) /
                1000
              ).toFixed(3);
              const score = latencyInSeconds < 0.5 ? "good" : "warning";
              resolve({
                rpc: api,
                latest_block_height: height,
                latency: latencyInSeconds,
                score: score,
                error: "ok",
              });
            } catch (error) {
              console.log(`Error on RPC: ${api} - `, error);
              resolve({
                rpc: api,
                latest_block_height: -1,
                latency: -1,
                score: "bad",
                error: error.message,
              });
            }
          });
        })
        .on("error", (err) => {
          console.log(`Error on RPC 2: ${api} - `, err);
          resolve({
            rpc: api,
            latest_block_height: -1,
            latency: -1,
            score: "bad",
            error: err.message,
          });
        });

      req.setTimeout(2000, function () {
        console.log(`RPC request to ${api} timed out`);
        req.abort();
        resolve({
          rpc: api,
          latest_block_height: -1,
          latency: -1,
          score: "bad",
          error: "Request timed out",
        });
      });
    });
  } catch (error) {
    console.log(`Error on API 3: ${api} - `, error);
    resolve({
      rpc: api,
      latest_block_height: -1,
      latency: -1,
      score: "bad",
      error: error.message,
    });
  }
};

const fetchApiData = (api) => {
  try {
    return new Promise((resolve, reject) => {
      const client = api.startsWith("https") ? https : http;
      const startTime = Date.now();
      const req = client
        .get(`${api}/block/last`, (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            try {
              const json = JSON.parse(body);
              const height = json.header.height;
              const latencyInSeconds = (
                (Date.now() - startTime) /
                1000
              ).toFixed(3);
              const score = latencyInSeconds < 0.5 ? "good" : "warning";
              resolve({
                rpc: api,
                latest_block_height: height,
                latency: latencyInSeconds,
                score: score,
                error: "ok",
              });
            } catch (error) {
              console.log(`Error on indexer: ${api} - `, error);
              resolve({
                rpc: api,
                latest_block_height: -1,
                latency: -1,
                score: "bad",
                error: error.message,
              });
            }
          });
        })
        .on("error", (err) => {
          console.log(`Error on indexer 2: ${api} - `, err);
          resolve({
            rpc: api,
            latest_block_height: -1,
            latency: -1,
            score: "bad",
            error: err.message,
          });
        });

      req.setTimeout(2000, function () {
        console.log(`RPC request to ${api} timed out`);
        req.abort();
        resolve({
          rpc: api,
          latest_block_height: -1,
          latency: -1,
          score: "bad",
          error: "Request timed out",
        });
      });
    });
  } catch (error) {
    console.log(`Error on API 3: ${api} - `, error);
    resolve({
      rpc: api,
      latest_block_height: -1,
      latency: -1,
      score: "bad",
      error: error.message,
    });
  }
};

app.get("/api/statusRpcs", async (req, res) => {
  const domain = req.query.domain;
  if (domain === "all") {
    fs.readFile("./data.json", "utf8", async (err, jsonString) => {
      if (err) {
        console.log("Error reading file from disk:", err);
        return;
      }
      const urls = JSON.parse(jsonString);
      let promises = [];

      for (let i = 0; i < urls.rpcs.length; i++) {
        promises.push(fetchRpcData(urls.rpcs[i]));
      }

      Promise.all(promises)
        .then((data) => res.send(data))
        .catch((err) => console.log(err));
    });
  } else {
    let promises = [];
    promises.push(fetchRpcData(domain));
    Promise.all(promises)
      .then((data) => res.send(data))
      .catch((err) => console.log(err));
  }
});

app.get("/api/statusIndexers", async (req, res) => {
  const domain = req.query.domain;
  if (domain === "all") {
    fs.readFile("./data.json", "utf8", async (err, jsonString) => {
      if (err) {
        console.log("Error reading file from disk:", err);
        return;
      }
      const urls = JSON.parse(jsonString);
      let promises = [];

      for (let i = 0; i < urls.apis.length; i++) {
        promises.push(fetchApiData(urls.apis[i]));
      }

      Promise.all(promises)
        .then((data) => res.send(data))
        .catch((err) => console.log(err));
    });
  } else {
    let promises = [];
    promises.push(fetchApiData(domain));
    Promise.all(promises)
      .then((data) => res.send(data))
      .catch((err) => console.log(err));
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
