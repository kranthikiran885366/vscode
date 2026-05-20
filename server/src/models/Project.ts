import mongoose, { Schema, Document } from 'mongoose'

export interface Collaborator {
  userId: string
  role: 'owner' | 'contributor' | 'viewer'
  addedAt: Date
}

export interface IProject extends Document {
  name: string
  description: string
  owner: string
  collaborators: Collaborator[]
  files: string[]
  isPublic: boolean
  language: string
  tags: string[]
  visibility: 'private' | 'shared' | 'public'
  settings: {
    allowComments: boolean
    allowForking: boolean
    autoSave: boolean
    autoFormat: boolean
  }
  stats: {
    totalFiles: number
    totalLines: number
    totalCommits: number
    lastActivity: Date
  }
  createdAt: Date
  updatedAt: Date
  lastModified: Date
  isArchived: boolean
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'contributor', 'viewer'],
          default: 'contributor',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    language: {
      type: String,
      enum: [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'go',
        'rust',
        'html',
        'css',
        'sql',
        'markdown',
        'json',
      ],
      default: 'javascript',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    visibility: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private',
      index: true,
    },
    settings: {
      allowComments: {
        type: Boolean,
        default: true,
      },
      allowForking: {
        type: Boolean,
        default: false,
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
      autoFormat: {
        type: Boolean,
        default: false,
      },
    },
    stats: {
      totalFiles: {
        type: Number,
        default: 0,
      },
      totalLines: {
        type: Number,
        default: 0,
      },
      totalCommits: {
        type: Number,
        default: 0,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
    },
    lastModified: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for finding user's projects efficiently
projectSchema.index({ owner: 1, isArchived: 1 })

export default mongoose.model<IProject>('Project', projectSchema)
