import { z } from "zod";

export const createWidgetSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  visibility: z.string().max(50).optional(),
  redirectLink: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryIds: z.number().array().optional(),
});

export const editWidgetSchema = createWidgetSchema.partial();

export const queryParamsSchema = z.object({
  widgetName: z.string().optional(),
  categories: z.string().array().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, "Limit must be <= 100")
    .optional(),
  userId: z.coerce.number().int().positive().optional(),
});

export const registerWidgetSchema = z.object({
  widgetName: z.string(),
  description: z.string(),
  visibility: z.string(),
  userId: z.number().int().positive(),
});

export const createUserSchema = z.object({
  email: z.string().min(1),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
  role: z.string(),
  favWidgetsIds: z.number().array().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const favoriteWidgetSchema = z.object({
  userId: z.coerce.number().int().positive(),
  widgetId: z.coerce.number().int().positive(),
});

export const getTeamSchema = z.object({
  teamId: z.string().uuid(),
});

export const getTeamMemberSchema = z.object({
  teamId: z.string().uuid(),
  memberId: z.coerce.number().int().positive(),
});

export const generateTokenSchema = z.object({
  userId: z.coerce.number().int().positive(),
  publicWidgetId: z.string().uuid(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  hex_code: z.string().optional()
});

export const updateCategorySchema = z.object({
  name: z.string().optional(),
  hex_code: z.string().optional()
});

export const addCategoryToWidgetSchema = z.object({
  categoryId: z.number().int().positive()
});

export const removeCategoryFromWidgetSchema = z.object({
  categoryId: z.number().int().positive(),
  widgetId: z.number().int().positive()
});
