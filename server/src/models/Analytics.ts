import mongoose, { Schema, Document } from 'mongoose'

export interface IAnalytics extends Document {
  userId: string
  action: string
  resource: string
  resourceId: string
  metadata?: Record<string, any>
  timestamp: Date
}

const analyticsSchema = new Schema<IAnalytics>({
  userId: { type: String, required: true, index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true },
  resourceId: { type: String, index: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
})

export default mongoose.model<IAnalytics>('Analytics', analyticsSchema)
