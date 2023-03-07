const networkService = require("../services/networkService");
const logger = require("../helpers/winston");
const path = require("path");
var bodyParser = require("body-parser");
const { JSONStreamStringify } = require("json-stream-stringify");
const jsonParser = bodyParser.json();

exports.networkController = {
  async getNetwork(req, res) {
    logger.info(`[getNetwork] - ${path.basename(__filename)}`);
    let network;
    const networkIdParam = req.params.networkId;
    try {
      network = await networkService.getNetwork(networkIdParam);
      if (network) {
        // const JSONStream = require("JSONStream");
        // const largeJsonObject = network;
        // const jsonStream = JSONStream.stringify();
        // jsonStream.write(largeJsonObject);
        // jsonStream.pipe(res);
        // return res.end();
        // res.type("application/json");
        // const networkString = JSON.stringify(network);
        // res.write(networkString);
        // res.status(200);
        // res.end();
        return res.status(200).json({ network });
      } else {
        return res.status(404).json({ error: "Network id not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Error get Network: ${networkIdParam} : ${err}` });
      return;
    }
  },

<<<<<<< HEAD
    async getNetwork(req, res) {
        logger.info(`[getNetwork] - ${path.basename(__filename)}`);
        let network;
        const networkIdParam = req.params.networkId;
        try {
            network = await networkService.getNetwork(networkIdParam);
            if(network){
                const JSONStream = require('JSONStream');
                const largeJsonObject = network;
                const jsonStream = JSONStream.stringify();
                jsonStream.write(largeJsonObject);
                jsonStream.pipe(res);
                return;
            //return res.status(200).json({network})
            }
            else{
                return res.status(404).json({ error: "Cannot get network : network not found" });
            }
        } catch (err) {
            res.status(500).send({ error: `Cannot get network, please try again later` });
            return;
        }
    },

    async getNetworks(req, res) {
        logger.info(`[getNetworks] - ${path.basename(__filename)}`);
        let networks;
        try {
            networks = await networkService.getNetworks();
            res.status(200).json({networks})
        } catch (err) {
            res.status(500).json({ error: `Cannot get networks, please try again later` });
            return;
        }
    },

    //TO DO: Change according to noor
    async addNetwork(req, res) {
        logger.info(`[addNetwork] - ${path.basename(__filename)}`);
        const networkParams = req.body;
        try {
            const newNetwork = await networkService.addNetwork(networkParams);                        
            res.status(200).json({network: newNetwork});
        } catch (err) {
            res.status(500).json({ error: `Cannot add new network, please try again later` });
            return;
        }
    },
=======
  async getNetworks(req, res) {
    logger.info(`[getNetworks] - ${path.basename(__filename)}`);
    let networks;
    try {
      networks = await networkService.getNetworks();
      res.status(200).json({ networks });
    } catch (err) {
      res.status(500).json({ error: `Error get networks : ${err}` });
      return;
    }
  },

  //TO DO: Change according to noor
  async addNetwork(req, res) {
    logger.info(`[addNetwork] - ${path.basename(__filename)}`);
    const networkParams = req.body;
    try {
      const newNetwork = await networkService.addNetwork(networkParams);
      res.status(200).json({ network: newNetwork });
    } catch (err) {
      res.status(400).json({ error: ` ${err}` });
      return;
    }
  },
>>>>>>> 44dc92513dc9a0458c46cc3aa05d988637f8a1c7

  async updateNetwork(req, res) {
    logger.info(`[updateNetwork] - ${path.basename(__filename)}`);
    const networkIdParam = req.params.networkId;
    const networkParams = req.body;
    let updateResult;

<<<<<<< HEAD
        try {
            updateResult = await networkService.updateNetwork(networkIdParam,networkParams);
            if (updateResult.matchedCount == 1) {
                return res.status(200).json({ message:"Network updated"});
            } else {
                return res.status(404).json({ error: "Cannot update network: network not found" });
            }
        } catch (err) {
            res.status(500).json({ error: `Cannot update network, please try again later` });
            return;
        }

    },
    async deleteNetwork(req, res) {
        logger.info(`[deleteNetwork] - ${path.basename(__filename)}`);
        const networkIdParam = req.params.networkId;
        let deleteResult;
        try {
            deleteResult = await networkService.deleteNetwork(networkIdParam);
            return  res.status(200).json({ message: `Network deleted` });
        } catch (err) {
            res.status(500).json({ error: `Cannot delete network, please try again later` });
            return;
        }
    },
    
=======
    try {
      updateResult = await networkService.updateNetwork(
        networkIdParam,
        networkParams
      );
      if (updateResult.matchedCount == 1) {
        return res.status(200).json({ message: "Network updated" });
      } else {
        return res.status(404).json({ error: "Network id not found" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error update network ${networkIdParam} : ${err}` });
      return;
    }
  },
  async deleteNetwork(req, res) {
    logger.info(`[deleteNetwork] - ${path.basename(__filename)}`);
    const networkIdParam = req.params.networkId;
    let deleteResult;
    try {
      deleteResult = await networkService.deleteNetwork(networkIdParam);
      return res.status(200).json({ message: `Network deleted` });
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error deleting Network ${networkIdParam} : ${err}` });
      return;
    }
  },

>>>>>>> 44dc92513dc9a0458c46cc3aa05d988637f8a1c7
  async getNetworkEdgesByType(req, res) {
    logger.info(`[getNetworkEdgesByType] - ${path.basename(__filename)}`);
    const networkIdParam = req.params.networkId;
    const edgeType = req.query.type;
    let network;
    network = await networkService.getNetwork(networkIdParam);
<<<<<<< HEAD
    if(!network){
        return res.status(404).json({ error: `Cannot get network's edges` });
=======
    if (!network) {
      return res.status(404).json({ error: "Network id not found" });
>>>>>>> 44dc92513dc9a0458c46cc3aa05d988637f8a1c7
    }
    networkEdges = network.edges;
    try {
      const filterEdges = networkEdges.filter((edge) => {
        return edge.edgeType === edgeType;
      });
      res.status(200).json({ filterEdges });
    } catch (err) {
<<<<<<< HEAD
        res.status(500).json({ error: `Cannot get network's edges, please try again later` });
        return;
=======
      res.status(500).json({
        error: `Error get edges from type ${type} for projectId ${projectIdParam} : ${err}`,
      });
      return;
>>>>>>> 44dc92513dc9a0458c46cc3aa05d988637f8a1c7
    }
  },
};
