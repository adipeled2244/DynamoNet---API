const serviceProject = require('../dbCalls/db_projects')
const logger= require('../helpers/winston')

exports.userController = {
    async getProjectByProjectId(req, res) {
        let project;
        const projectIdParam = req.params.projectId;
        try {
            project = await serviceProject.getProjectByProjectId(projectIdParam);
            res.status(200).json({project})
        } catch (err) {
            res.status(500).send({ error: `Error get project: ${projectIdParam} : ${err}` });
            return;
        }
    },
    async addProject(req, res) {
        const projectParams = req.body;
        if(!projectParams){
            res.status(400).send({error: 'invalid params'})
        }       
        projectParams.createdDate =  Date.now();
        try {
            const newProject = await serviceProject.addProject(projectParams);
            res.status(200).json({project: newProject});
        } catch (err) {
            res.status(400).json({ error: ` ${err}` });
            return;
        }
    },
    async updateFlight(req, res) {

        let updateResult;

        if (!req.body.flightDate || !req.body.origin || !req.body.destination) {
            res.status(400).json({ error: `Parameters for update  are missing` });
            return;
        }

        try {
            updateResult = await Flight.updateOne({ flightId: req.params.flightId }, { flightDate: req.body.flightDate, origin: req.body.origin, destination: req.body.destination });
        } catch (err) {
            res.status(500).json({ error: `Error update flight ${req.params.flightId} : ${err}` });
            return;
        }

        if (updateResult.matchedCount == 1) {
            res.status(200).json({ message: "The flight updated" });
        } else {
            res.status(404).json({ error: "Flight id not found" });
        }

    },
    async getFlights(req, res) {
        let flights;
        try {
            if(req.query.destination){
                flights = await Flight.find({"destination":"london"});
            }else{
                flights = await Flight.find({});
            }
            
        } catch (err) {
            res.status(500).json({ error: `Error get all flights : ${err}` });
            return;
        }
        if (flights[0]){
            res.status(200).json(flights);
        }
        else{
            res.status(200).json({ message: "There are not any flights" });
        }

    },
    async deleteFlight(req, res) {
        let deleteResult;
        try {
            deleteResult = await Flight.deleteOne({ flightId: req.params.flightId }, );
        } catch (err) {
            res.status(500).json({ error: `Error deleting flight ${req.params.flightId} : ${err}` });
            return;
        }

        if (deleteResult.deletedCount == 1) {
            res.status(200).json({ message: `Flight number: ${req.params.flightId} deleted  ` });
        } else {
            res.status(404).json({ error: `Flight number: ${req.params.flightId} not found` });
        }

    }
};