const projectService = require('../services/projectService')
const logger= require('../helpers/winston')
const path = require('path');
const { spawn } = require('child_process');
const { isErrored } = require('stream');
const timeRangeService = require("../services/timeRangeService");

exports.timeRangeController = {

    async getTimeRange(req, res) {
        logger.info(`[getTimeRange] - ${path.basename(__filename)}`);
        let timeRange;
        const timeRangeIdParam = req.params.timeRangeId;
        try {
            timeRange = await timeRangeService.getTimeRange(timeRangeIdParam);
            if(timeRange){
            return res.status(200).json({timeRange})
            }
            else{
                return res.status(404).json({ error: "TimeRange id not found" });
            }
        } catch (err) {
            res.status(500).send({ error: `Error get timeRange: ${timeRangeIdParam} : ${err}` });
            return;
        }
    },

    async getTimeRanges(req, res) {
        logger.info(`[getTimeRange] - ${path.basename(__filename)}`);
        let timeRanges;
        try {
            timeRanges = await timeRangeService.getTimeRanges();
            res.status(200).json({timeRanges})
        } catch (err) {
            res.status(500).json({ error: `Error get timeRanges : ${err}` });
            return;
        }
    },

    //TO DO: Change according to noor
    async addTimeRanges(req, res) {
        logger.info(`[addTimeRange] - ${path.basename(__filename)}`);
        const timeRangeParams = req.body;
        const projectId=timeRangeParams.projectId;

        if(!timeRangeParams){
            res.status(400).send({error: 'invalid params'})
        }       
        try {
            const arrayChange= timeRangeParams.datesArray.join(" ");
            const pythonProcess = spawn('python', ['./python/createMultipleTimeRanges.py',`--project_id=${projectId}`,`--datesArray=${arrayChange}`]);
            pythonProcess.stdout.on('data', (data) => {
                console.log(`data in TR`);
                console.log(`${data}`);
              });
              pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
              });
               pythonProcess.on('close', (data) => {
                try{
                console.log(`close: ${data}`);
                }catch(err){
                  console.error(`close: ${err}`);
              
                }
              });            
            res.status(200).json({message: "Data processing "});
        } catch (err) {
            res.status(400).json({ error: ` ${err}` });
            return;
        }
    },
    
    async deleteTimeRange(req, res) {
        logger.info(`[deleteTimeRange] - ${path.basename(__filename)}`);
        //noy sent it in url params
        const timeRangeIdParam = req.params.timeRangeId;
        const projectIdParam = req.params.projectId;
        
        let deleteResult;
        try {
            deleteResult = await timeRangeService.deleteTimeRange(timeRangeIdParam,projectIdParam);
            return  res.status(200).json({ message: `Time Range deleted` });
        } catch (err) {
            res.status(500).json({ error: `Error deleting time range ${timeRangeIdParam} for project ${projectIdParam} : ${err}` });
            return;
        }
    }
};