import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Services (Admin) ──────────────────────────────────────────────────────────

export const serviceTypeSchema = z.object({
  name:        z.string().min(2),
  description: z.string().optional(),
  price:       z.number().int().nonnegative().optional().nullable(), // kobo; null = price on request
  durationMin: z.number().int().positive().default(30),
  isActive:    z.boolean().default(true),
});

// ── Special Requests ──────────────────────────────────────────────────────────

export const homeVisitSchema = z.object({
  address:       z.string().min(5, "Please provide your full address"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().optional(),
  reason:        z.string().min(5, "Please describe the reason"),
});

export const hospitalAssistSchema = z.object({
  hospitalName:    z.string().min(2, "Please provide the hospital name"),
  hospitalAddress: z.string().optional(),
  reason:          z.string().min(5, "Please describe what assistance you need"),
  scheduledDate:   z.string().optional(),
});

export const medTourismSchema = z.object({
  destination:    z.string().min(2, "Please provide the destination"),
  procedure:      z.string().min(5, "Please describe the procedure needed"),
  travelDates:    z.string().optional(),
  additionalInfo: z.string().optional(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoginInput        = z.infer<typeof loginSchema>;
export type ServiceTypeInput  = z.infer<typeof serviceTypeSchema>;
export type HomeVisitInput    = z.infer<typeof homeVisitSchema>;
export type HospitalAssistInput = z.infer<typeof hospitalAssistSchema>;
export type MedTourismInput   = z.infer<typeof medTourismSchema>;
