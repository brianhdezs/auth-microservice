import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class UserV2 extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  // Nuevo campo status
  @Prop({ type: Number, default: 1 }) // 1 = activo, 2 = inactivo
  status: number;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export const UserSchemaV2 = SchemaFactory.createForClass(UserV2);

UserSchemaV2.pre<UserV2>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
