import { TaskPriority, TaskState } from "@prisma/client";
import { IsString, IsOptional, IsEnum, IsNumber, IsDate } from "class-validator";
import { Type } from "class-transformer";

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskState)
  @IsOptional()
  state?: TaskState;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  // ✅ CHANGED — now accepts any string (UUID, cuid, etc.)
  @IsOptional()
  @IsString({ message: "assigneeId must be a string (UUID or cuid)" })
  assigneeId?: string;

  @Type(() => Number)
  @IsOptional()
  estimateHours?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dueDate?: Date;
}
