import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User extends Document {
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

  // ✅ Método para validar contraseña
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// ✅ Creamos el schema
export const UserSchema = SchemaFactory.createForClass(User);

// ✅ Hashear antes de guardar
UserSchema.pre<User>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
