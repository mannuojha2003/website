import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  username: string;
  loginTime: Date;
  logoutTime?: Date;
  workingDurationMinutes?: number;
}

const SessionSchema: Schema<ISession> = new Schema(
  {
    username: { type: String, required: true },
    loginTime: { type: Date, required: true },
    logoutTime: { type: Date },
    workingDurationMinutes: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', SessionSchema);
