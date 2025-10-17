import mongoose, { Schema, Document } from 'mongoose'

export interface IFile extends Document {
  name: string
  path: string
  project: string
  owner: string
  content: string
  language: string
  size: number
  isDirty: boolean
  createdAt: Date
  updatedAt: Date
}

const fileSchema = new Schema<IFile>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IFile>('File', fileSchema)
