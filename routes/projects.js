const { render } = require('ejs')
const express = require('express')
const { route } = require('.')
const router = express.Router()
const Projects = require('../models/projects.js')
const Users = require('../models/users.js')
const ProjectDevs = require('../models/positions.js')
const moment = require('moment')
const { PromiseProvider } = require('mongoose')


 /*
 * Rooot, List all projects
 */
router.get('/', async (req, res) => {
    var allProjects = await Projects.find({ })
    res.render('projects/allProjects.ejs', {
        projects: allProjects
    })
})

 /*
 * Create new project
 */
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

        res.redirect('projects/')
    } catch (error) {
        console.log(error)
        res.redirect('projects/createProject')
    }
})

 /*
 * Display project details
 */
router.get('/:id/view', async (req, res) => {
    var selectProject = await Projects.findOne({ projID: req.params.id })
    var assignedPositions = await ProjectDevs.find({ assignedProj: req.params.id})
    const allDevs = await Users.find({ })

    res.render('projects/projectDetails.ejs', {
       project: selectProject,
       devs: assignedPositions,
       users: allDevs
    }) 
})

 /*
 * Edit project details
 */
router.get('/:id/edit', async (req, res) => {
    var selectProject = await Projects.findOne({ projID: req.params.id })

    res.render('projects/editProject.ejs', {
        project: selectProject
    })
})

 /*
 * Update project details edits
 */
router.put('/:id', async (req, res) => {
    let project
    try {
        project = await Projects.findOne({ projID: req.params.id })
        //project ID, startDate, and creator cannot be changed
        project.title = req.body.title
        project.description = "Updated description" //req.body.description.value, //need body parser
        project.status = req.body.status
        project.compDate = req.body.comp
        await project.save()
        res.redirect(`/projects/${project.projID}/view`)
    } catch (error) {
        // if (project == null) {
        //     res.redirect('/')
        // }
        res.redirect(`/projects/${project.projID}/edit`)
    }
})

 /*
 * Delete project
 */
router.delete('/:id/', async (req, res) => {
    try {
        Projects.findOneAndDelete({ 
            projID: req.params.id,
        }, function (err) {
            if (err) console.log(err);
            console.log("Succesful deletion");
        });
    } catch (error) {
        console.log(error)
    }
    res.redirect('/projects/')
})


  /*
 * Edit existing project team assignments
 */
router.get('/:id/editPos', async (req, res) => {
    const devs = await Users.find({ })
    const project = await Projects.findOne({ projID: req.params.id })
    const assignedRoles = await ProjectDevs.find({ assignedProj: req.params.id })

    res.render('projects/editPositions.ejs', {
        devs: devs,
        projTitle: project.title,
        projID: project.projID,
        roles: assignedRoles
    })
})


  /*
 * Delete team assignments
 */
router.delete('/:id/delPos/:posID', async (req, res) => {
    try {
        console.log("position ID: "+req.params.posID)
        console.log("project ID: "+req.params.id)

        ProjectDevs.findOneAndDelete({ 
            assignedProj: req.params.id,
            projDevID: req.params.posID 
        }, function (err) {
            if (err) console.log(err);
            console.log("Succesful deletion");
        });
    } catch (error) {
        console.log(error)
    }
    res.redirect('/projects/'+req.params.id+'/view')
})

  /*
 * Save project team assignments
 */
router.post('/:id/addPos', async (req, res) => {
    console.log("Entered addPos")

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

    // // debugging
    // devs.forEach(keyPair =>{
    //     console.log(keyPair)
    // })

    
    for (let x=0; x < devs.length; x++) {


        let roleAssignment;

        //save data to db
        try {

            //look for existing record
            roleAssignment = ProjectDevs.findOne({ 
                assignedProj: req.params.id,
                role: devs[x][1]
            })

            if (roleAssignment.projDevID) {
                //if record exists then update user and role
                roleAssignment.role = devs[x][0]
                roleAssignment.developer = devs[x][1]
            } else {
                rnd = Math.floor(Math.random() * Math.floor(1000));
                //create new position assignment
                roleAssignment = new ProjectDevs ({
                    projDevID: moment().format("YYYYMMDDHHMMSS")+rnd,
                    role: devs[x][0],
                    developer: devs[x][1],
                    assignedProj: req.params.id
                })
            }

            console.log("try to save...")
            roleAssignment.save(err => {
                if (err) return console.error(err)
            })

            console.log("Successful")
        } catch (error) {
            console.log("Not successful")
            console.log(error)
        }
    }

    res.redirect('/projects/'+req.params.id+'/view')
})





module.exports = router