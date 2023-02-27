const networkService = require('../services/networkService')
const logger= require('../helpers/winston')
const path = require('path');

exports.networkController = {

    async getNetwork(req, res) {
        logger.info(`[getNetwork] - ${path.basename(__filename)}`);
        let network;
        const networkIdParam = req.params.networkId;
        try {
            network = await networkService.getNetwork(networkIdParam);
            if(network){
            return res.status(200).json({network})
            }
            else{
                return res.status(404).json({ error: "Network id not found" });
            }
        } catch (err) {
            res.status(500).send({ error: `Error get Network: ${networkIdParam} : ${err}` });
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
            res.status(200).json({network: newNetwork});
        } catch (err) {
            res.status(400).json({ error: ` ${err}` });
            return;
        }
    },

    async updateNetwork(req, res) {
        logger.info(`[updateNetwork] - ${path.basename(__filename)}`);
        const networkIdParam = req.params.networkId;
        const networkParams = req.body;
        let updateResult;

        try {
            updateResult = await networkService.updateNetwork(networkIdParam,networkParams);
            if (updateResult.matchedCount == 1) {
                return res.status(200).json({ message:"Network updated"});
            } else {
                return res.status(404).json({ error: "Network id not found" });
            }
        } catch (err) {
            res.status(500).json({ error: `Error update network ${networkIdParam} : ${err}` });
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
            res.status(500).json({ error: `Error deleting Network ${networkIdParam} : ${err}` });
            return;
        }
    },
    
  async getNetworkEdgesByType(req, res) {
    logger.info(`[getNetworkEdgesByType] - ${path.basename(__filename)}`);
    const networkIdParam = req.params.networkId;
    const edgeType = req.query.type;
    let network;
    network = await networkService.getNetwork(networkIdParam);
    if(!network){
        return res.status(404).json({ error: "Network id not found" });
    }
    networkEdges=network.edges;
    try {
      const filterEdges= networkEdges.filter((edge)=>{
        return edge.edgeType===edgeType;
      })
      res.status(200).json({filterEdges})
    } catch (err) {
        res.status(500).json({ error: `Error get edges from type ${type} for projectId ${projectIdParam} : ${err}` });
        return;
    }
},
};