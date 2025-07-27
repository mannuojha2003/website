import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  name: string;
  address: string;
  contact: string;
}

const UnitSchema: Schema = new Schema<IUnit>(
  {
    name: {
      type: String,
      required: [true, 'Unit name is required'],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Contact is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[0-9+\-\s]{6,15}$/.test(v); // basic phone validation
        },
        message: 'Invalid contact number format.',
      },
    },
  },
  {
    timestamps: true,
    collation: { locale: 'en', strength: 2 }, // ✅ case-insensitive uniqueness
  }
);

// Ensure name uniqueness is case-insensitive
UnitSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model<IUnit>('Unit', UnitSchema);
