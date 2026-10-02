import { z } from 'zod';

export const proposeMeetingSchema = z.object({
  scheduledAt: z
    .string()
    .trim()
    .datetime({ message: 'La fecha de la reunión debe ser una cadena ISO 8601 válida' })
    .refine((val) => new Date(val) > new Date(), {
      message: 'La fecha de la reunión debe ser en el futuro',
    }),
  location: z.string().trim().max(255, 'La ubicación no puede superar los 255 caracteres').nullable().optional(),
});

export type ProposeMeetingDto = z.infer<typeof proposeMeetingSchema>;

export const finalizeMeetingSchema = z.object({
  status: z.enum(['completed', 'no_show', 'cancelled'], {
    message: 'El estado finalizador debe ser completed, no_show o cancelled',
  }),
  adminNotes: z.string().trim().max(1000, 'Las notas del administrador no pueden superar los 1000 caracteres').optional(),
});

export type FinalizeMeetingDto = z.infer<typeof finalizeMeetingSchema>;
