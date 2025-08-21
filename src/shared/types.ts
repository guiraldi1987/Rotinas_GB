import z from "zod";

// User roles
export const UserRoleSchema = z.enum([
  'ROLE_DRIVER', 
  'ROLE_FIREFIGHTER', 
  'ROLE_SERGEANT', 
  'ROLE_B3', 
  'ROLE_OFFICER'
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Module types
export const ModuleTypeSchema = z.enum([
  'FUEL', 
  'CHECKLIST', 
  'PASS_ALONG', 
  'DEJEM', 
  'DEA'
]);
export type ModuleType = z.infer<typeof ModuleTypeSchema>;

// Module status
export const ModuleStatusSchema = z.enum([
  'AWAITING_SERGEANT',
  'VALIDATED_SERGEANT', 
  'REVIEWED_B3',
  'PUBLISHED_OFFICERS'
]);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

// Fuel module payload
export const FuelPayloadSchema = z.object({
  km: z.number().min(0),
  litros: z.number().min(0),
  motorista: z.string().min(1),
  viatura: z.string().min(1),
  posto: z.string().min(1),
  data: z.string()
});
export type FuelPayload = z.infer<typeof FuelPayloadSchema>;

// Checklist module payload
export const ChecklistPayloadSchema = z.object({
  viatura: z.string().min(1),
  freios: z.boolean(),
  luzes: z.boolean(),
  pneus: z.boolean(),
  combustivel: z.boolean(),
  oleo: z.boolean(),
  agua: z.boolean(),
  equipamentos: z.boolean(),
  limpeza: z.boolean(),
  observacoes: z.string().optional(),
  data: z.string()
});
export type ChecklistPayload = z.infer<typeof ChecklistPayloadSchema>;

// Pass Along module payload
export const PassAlongPayloadSchema = z.object({
  turnoAnterior: z.string().min(1),
  turnoAtual: z.string().min(1),
  responsavelAnterior: z.string().min(1),
  responsavelAtual: z.string().min(1),
  ocorrencias: z.string(),
  pendencias: z.string(),
  observacoes: z.string(),
  data: z.string()
});
export type PassAlongPayload = z.infer<typeof PassAlongPayloadSchema>;

// User schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  name: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});
export type User = z.infer<typeof UserSchema>;

// Module schema
export const ModuleSchema = z.object({
  id: z.number(),
  type: ModuleTypeSchema,
  status: ModuleStatusSchema,
  payload: z.string(),
  created_by: z.string(),
  validated_by: z.string().nullable(),
  reviewed_by: z.string().nullable(),
  published_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});
export type Module = z.infer<typeof ModuleSchema>;

// API request schemas
export const CreateModuleSchema = z.object({
  type: ModuleTypeSchema,
  payload: z.union([FuelPayloadSchema, ChecklistPayloadSchema, PassAlongPayloadSchema])
});
export type CreateModuleRequest = z.infer<typeof CreateModuleSchema>;

export const UpdateModuleStatusSchema = z.object({
  status: ModuleStatusSchema
});
export type UpdateModuleStatusRequest = z.infer<typeof UpdateModuleStatusSchema>;
