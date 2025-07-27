import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  date: { type: String, required: true },
  text: { type: String, required: true },
});

export default mongoose.model('Schedule', scheduleSchema);
