import { IsOptional, IsPositive } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
    @IsPositive()
    // @Type(() => Number) enableImplicitConversion: true in main.ts
    limit: number;

    // @Type(() => Number)
    @IsOptional()
    @IsPositive()
    offset: number;
}
