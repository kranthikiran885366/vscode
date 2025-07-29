
const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  template: {
    type: String,
    enum: ["blank", "react", "node", "python", "java", "cpp", "go"],
    default: "blank",
  },
  language: {
    type: String,
    enum: ["javascript", "typescript", "python", "java", "cpp", "go", "rust", "php"],
    default: "javascript",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  settings: {
    public: {
      type: Boolean,
      default: false,
    },
    autoSave: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },
    tabSize: {
      type: Number,
      default: 2,
    },
    wordWrap: {
      type: Boolean,
      default: true,
    },
  },
  deployments: [{
    id: String,
    url: String,
    status: String,
    createdAt: Date,
  }],
  lastModified: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

projectSchema.index({ owner: 1 })
projectSchema.index({ collaborators: 1 })
projectSchema.index({ "settings.public": 1 })

module.exports = mongoose.model("Project", projectSchema)
