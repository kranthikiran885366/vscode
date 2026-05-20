import mongoose, { Schema, Document } from 'mongoose'

export interface FileVersion {
  versionNumber: number
  content: string
  author: string
  message: string
  createdAt: Date
}

export interface IFile extends Document {
  name: string
  path: string
  project: string
  owner: string
  content: string
  language: string
  size: number
  isDirty: boolean
  versions: FileVersion[]
  currentVersion: number
  lastModifiedBy: string
  lineCount: number
  encoding: string
  isDeleted: boolean
  deletedAt?: Date
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const fileSchema = new Schema<IFile>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
      index: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: '',
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
        'xml',
        'yaml',
        'plaintext',
      ],
      default: 'plaintext',
    },
    size: {
      type: Number,
      default: 0,
    },
    isDirty: {
      type: Boolean,
      default: false,
      index: true,
    },
    versions: [
      {
        versionNumber: {
          type: Number,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        message: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentVersion: {
      type: Number,
      default: 1,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lineCount: {
      type: Number,
      default: 0,
    },
    encoding: {
      type: String,
      default: 'utf-8',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index for efficient file lookups
fileSchema.index({ project: 1, isDeleted: 1 })

export default mongoose.model<IFile>('File', fileSchema)
