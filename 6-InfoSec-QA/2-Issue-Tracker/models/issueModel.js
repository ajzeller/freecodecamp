const mongoose = require('mongoose')

// destructure Schema from mongoose
const { Schema } = mongoose

const issueSchema = new Schema({
  _id: String,
  issueTitle: String,
  issueText: String,
  createdBy: String,
  assignedTo: String,
  statusText: String,
  projectId: String,
  createdOn: Date,
  updatedOn: Date,
  open: Boolean
})

const Issue = mongoose.model("Issue", issueSchema, 'IssuesDB')

module.exports = Issue