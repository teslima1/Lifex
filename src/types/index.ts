import {
  User,
  ServiceType,
  Appointment,
  SpecialRequest,
  HealthTip,
  ClinicSettings,
  Role,
  AppointmentStatus,
  SpecialRequestType,
  SpecialRequestStatus,
} from "@prisma/client";

export type {
  User,
  ServiceType,
  Appointment,
  SpecialRequest,
  HealthTip,
  ClinicSettings,
  Role,
  AppointmentStatus,
  SpecialRequestType,
  SpecialRequestStatus,
};

export type AppointmentWithService = Appointment & {
  serviceType: Pick<ServiceType, "id" | "name" | "price" | "durationMin">;
};
