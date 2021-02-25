const { render } = require('ejs')
const express = require('express')
const { route } = require('.')
const router = express.Router()
const Projects = require('../models/projects.js')
const Users = require('../models/users.js')
const ProjectDevs = require('../models/positions.js')
const moment = require('moment')

//testing
router.get('/test', (req, res) => {
    res.render('/projects/test.ejs')
})

/*
 * List all projects
 */
router.get('/allProjects', async (req, res) => {
    var allProjects = await Projects.find({ })
    res.render('projects/allProjects.ejs', {
        projects: allProjects
    })
})

/*
 * List single project details 
 */
router.get('/projectDetails/:project', async (req, res) => {
    var ssn = req.session;
    ssn.projectID = req.params.project;
   
    var selectProject = await Projects.findOne({ projID: req.params.project })
    var assignedPositions = await ProjectDevs.find({ assignedProj: req.params.project})
    const allDevs = await Users.find({ })

    res.render('projects/projectDetails.ejs', {
       project: selectProject,
       devs: assignedPositions,
       users: allDevs
    }) 
})

/*
 * Edit single project details
 */



/*
 * Delete a single project
 */


/*
 * Add and assign positions to projects
 */
router.get('/addPositions', async (req, res) => {
    var ssn = req.session;
        
    const devs = await Users.find({ })
    res.render('projects/addPositions.ejs', {
        devs: devs
    })
})

router.post('/addPositions', async (req, res) => {
    //get session data
    var ssn = req.session
    var projID = ssn.projectID
    
    //get data from form body
    var data = req.body
    var devs = []

    //load body data into devs[]
    var keyID = ""
    var keyValue = ""

    for (const [key, value] of Object.entries(data)) {
        if (keyID === "") {
            keyID = value
        } else {
            keyValue = value
            //push to array then reset value for next pair
            devs.push([keyID, keyValue])
            keyID = ""
        }
    } 

    // //debugging
    // devs.forEach(keyPair =>{
    //     console.log(keyPair)
    // })

    for (let x=0; x < devs.length; x++) {
        //save data to db
        try {
            const positions = new ProjectDevs ({
                projDevID: moment().format("YYYYMMDDHHMMSS"),
                developer: devs[x][0],
                assignedProj: projID,  
                role: devs[x][1]
            })

            positions.save(err => {
                if (err) return console.error(err)
            })

            console.log("Successful")
        } catch (error) {
            console.log("Not successful")
            console.log(error)
        }
    }

    res.redirect('/projects/projectDetails/'+projID)
})

//create a new project
router.get('/createProject', (req, res) => {
    res.render('projects/createProject.ejs', {
        projID: moment().format("YYYYMMDDHHMMSS"),
        email: req.session.email,
        startDate: moment().format("MM/DD/YYYY")
    })
})

router.post('/', async (req, res) => {
    try {
        const project = new Projects({
            projID: req.body.projectID,
            title: req.body.title,
            description: "test data", //req.body.description.value, //need body parser
            status: req.body.status,
            startDate: req.body.start,
            creator: req.body.creator
        })

        project.save(function(err) {
            if (err) return console.error(err);
        });

        res.redirect('projects/allProjects')
    } catch (error) {
        console.log(error)
        res.redirect('projects/createProject')
    }
})

module.exports = router