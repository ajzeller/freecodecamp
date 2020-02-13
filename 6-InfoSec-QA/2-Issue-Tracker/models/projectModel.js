const mongoose = require('mongoose')

// destructure Schema from mongoose
const { Schema } = mongoose

const projectSchema = new Schema({
  name: String
})

const Project = mongoose.model("Project", projectSchema, 'ProjectsDB')

module.exports = Project