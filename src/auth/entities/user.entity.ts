import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: ['USER'] })
  roles: string[];

  @Prop({ type: Number, default: 1 }) // 👈 1 = activo, 2 = inactivo
  status: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
