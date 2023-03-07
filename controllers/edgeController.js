const edgeService = require('../services/edgeService')
const logger= require('../helpers/winston')
const path = require('path');

exports.edgeController = {

    async getEdge(req, res) {
        logger.info(`[getEdge] - ${path.basename(__filename)}`);
        let edge;
        const edgeIdParam = req.params.edgeId;
        try {
            edge = await edgeService.getEdge(edgeIdParam);
            if(edge){
            return res.status(200).json({edge})
            }
            else{
                return res.status(404).json({ error: "Cannot get edge: edge not found" });
            }
        } catch (err) {
            res.status(500).send({ error: `Cannot get edge, please try again later` });
            return;
        }
    },

    async getEdges(req, res) {
        logger.info(`[getEdges] - ${path.basename(__filename)}`);
        let edges;
        try {
            edges = await edgeService.getEdges();
            res.status(200).json({edges})
        } catch (err) {
            res.status(500).json({ error: `Cannot get edges, please try again later` });
            return;
        }
    },

    async addEdge(req, res) {
        logger.info(`[addEdge] - ${path.basename(__filename)}`);
        const edgeParams = req.body;
        try {
            const newEdge = await edgeService.addEdge(edgeParams);
            res.status(200).json({edge: newEdge});
        } catch (err) {
            res.status(500).json({ error: `Cannot add new edge, please try again later` });
            return;
        }
    },
    async updateEdge(req, res) {
        logger.info(`[updateEdge] - ${path.basename(__filename)}`);
        const edgeIdParam = req.params.edgeId;
        const edgeParams = req.body;
        let updateResult;

        try {
            updateResult = await edgeService.updateEdge(edgeIdParam,edgeParams);
            if (updateResult.matchedCount == 1) {
                return res.status(200).json({ message:"Edge updated"});
            } else {
                return res.status(404).json({ error: "Cannot update edge: edge not found" });
            }
        } catch (err) {
            res.status(500).json({ error: `Cannot  update edge, please try again later` });
            return;
        }

    },
    async deleteEdge(req, res) {
        logger.info(`[deleteEdge] - ${path.basename(__filename)}`);
        const edgeIdParam = req.params.edgeId;
        let deleteResult;
        try {
            deleteResult = await edgeService.deleteEdge(edgeIdParam);
            return  res.status(200).json({ message: `Edge deleted` });
        } catch (err) {
            res.status(500).json({ error: `Cannot delete edge, please try again later` });
            return;
        }
    }
};