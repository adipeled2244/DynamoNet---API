const projectService = require('../services/projectService')
const logger= require('../helpers/winston')
const path = require('path');

exports.projectController = {

    async getProject(req, res) {
        logger.info(`[getProject] - ${path.basename(__filename)}`);
        let project;
        const projectIdParam = req.params.projectId;
        try {
            project = await projectService.getProject(projectIdParam);
            if(project){
            return res.status(200).json({project})
            }
            else{
                return res.status(404).json({ error: "Project id not found" });
            }
        } catch (err) {
            res.status(500).send({ error: `Error get project: ${projectIdParam} : ${err}` });
            return;
        }
    },

    async getProjects(req, res) {
        logger.info(`[getProjects] - ${path.basename(__filename)}`);
        let projects;
        try {
            projects = await projectService.getProjects();
            res.status(200).json({projects})
        } catch (err) {
            res.status(500).json({ error: `Error get projects : ${err}` });
            return;
        }
    },

    //TO DO: Change according to noor
    async addProject(req, res) {
        logger.info(`[addProject] - ${path.basename(__filename)}`);
        const projectParams = req.body;
        const userId=projectParams.userId;

        if(!projectParams){
            res.status(400).send({error: 'invalid params'})
        }       
        projectParams.createdDate =  Date.now();
        try {
            const newProject = await projectService.addProject(projectParams);
            const updateUserRes= await userService.updateUser(newProject._id);
s
            
            //ADD PROJECT TO USER
            
            res.status(200).json({project: newProject});
        } catch (err) {
            res.status(400).json({ error: ` ${err}` });
            return;
        }
    },
    async updateProject(req, res) {
        logger.info(`[updateProject] - ${path.basename(__filename)}`);
        const projectIdParam = req.params.projectId;
        const projectParams = req.body;
        let updateResult;

        try {
            updateResult = await projectService.updateProject(projectIdParam,projectParams);
            if (updateResult.matchedCount == 1) {
                return res.status(200).json({ message:"Project updated"});
            } else {
                return res.status(404).json({ error: "Project id not found" });
            }
        } catch (err) {
            res.status(500).json({ error: `Error update project ${projectIdParam} : ${err}` });
            return;
        }

    },
    async deleteProject(req, res) {
        logger.info(`[deleteProject] - ${path.basename(__filename)}`);
        const projectIdParam = req.params.projectId;
        let deleteResult;
        try {
            deleteResult = await projectService.deleteProject(projectIdParam);
            return  res.status(200).json({ message: `Project deleted` });
        } catch (err) {
            res.status(500).json({ error: `Error deleting project ${projectIdParam} : ${err}` });
            return;
        }
    }
};