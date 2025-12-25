import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum FeedbackType {
    GENERAL = 'GENERAL',
    PRODUCT_REPORT = 'PRODUCT_REPORT',
}

export class CreateFeedbackDto {
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsEnum(FeedbackType)
    type: FeedbackType;

    @IsOptional()
    @IsString() // Using IsString instead of IsUUID to match current looseness, or should I be strict? The controller used simple string. Let's start with IsString or IsUUID if I'm sure it's a UUID. The Prisma schema likely uses UUID or Int?
    // Looking at controller: createInput.product = { connect: { id: data.productId } };
    // Usually IDs are UUIDs in this stack, but let's stick to IsString + IsNotEmpty if defined to be safe, or just IsString.
    productId?: string;
}
