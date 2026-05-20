import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditLog extends Document {
  userId: string
  action: string
  resource: string
  resourceId: string
  changes?: {
    before?: any
    after?: any
  }
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
  errorMessage?: string
  metadata?: Record<string, any>
  createdAt: Date
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'SHARE',
        'EXECUTE',
        'COLLABORATE',
        'EXPORT',
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: ['USER', 'PROJECT', 'FILE', 'TEAM', 'ORGANIZATION', 'SETTING'],
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    changes: {
      before: {
        type: Schema.Types.Mixed,
        default: null,
      },
      after: {
        type: Schema.Types.Mixed,
        default: null,
      },
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Create compound index for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 })

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
