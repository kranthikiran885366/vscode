import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  name: string
  description: string
  owner: string
  collaborators: string[]
  files: string[]
  isPublic: boolean
  language: string
  createdAt: Date
  updatedAt: Date
  lastModified: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
      ],
      default: 'javascript',
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IProject>('Project', projectSchema)
