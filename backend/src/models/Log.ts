// models/Log.ts
import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  action: String,
  performedBy: String,
  timestamp: String,
});

export default mongoose.model('Log', LogSchema);
