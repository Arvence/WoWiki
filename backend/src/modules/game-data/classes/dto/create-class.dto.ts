import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { CLASS_ROLES, ClassRole } from '../models/class.model'

export class CreateClassDto {
  @IsString() @IsNotEmpty() name!: string
  @IsArray() @ArrayNotEmpty() @IsIn(CLASS_ROLES, { each: true }) roles!: ClassRole[]
  @IsString() @IsNotEmpty() resource!: string
  @IsString() @IsNotEmpty() armor!: string
  @IsString() @IsNotEmpty() description!: string
}
