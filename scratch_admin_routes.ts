import { Router } from "express";
import { AdminController } from "../controller/adminController.js";
import { authenticateJWT } from "../../auth/middlewares/authenticate-jwt.middleware.js";
import { authorizeRoles } from "../../auth/middlewares/authorize-roles.middleware.js";

import { validateBody } from "../../../shared/http/validate-body.middleware.js";
import { proposeMeetingSchema, finalizeMeetingSchema } from "../dtos/admin-meeting.dto.js";
import adminTelemetryRouter from './admin-telemetry.routes.js';

const adminRouter = Router();

// GET /api/v1/admin/applications?page=1&status=pending | approved | rejected | suspended
adminRouter.get(
  '/applications',
  authenticateJWT,
  authorizeRoles('admin'),
  AdminController.list
);

// GET /api/v1/admin/applications/:id
adminRouter.get(
  '/applications/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  AdminController.getDetail
);

// PATCH /api/v1/admin/applications/:id/status  ['approved', 'rejected', 'suspended']
adminRouter.patch(
  '/applications/:id/status',
  authenticateJWT,
  authorizeRoles('admin'),
  AdminController.updateStatus
);

// PATCH /api/v1/admin/documents/:id/status
adminRouter.patch(
  '/documents/:id/status',
  authenticateJWT,
  authorizeRoles('admin'),
  AdminController.updateDocumentStatus
);

// POST /api/v1/admin/applications/:id/meeting ['proposed'] 
// Solo se puede crear una reunión si el conductor no tiene una reunión activa ('proposed', 'confirmed', 'reschedule_requested')
adminRouter.post(
  '/applications/:id/meeting',
  authenticateJWT,
  authorizeRoles('admin'),
  validateBody(proposeMeetingSchema),
  AdminController.proposeMeeting
);

// PATCH /api/v1/admin/meetings/:id/finalize ['cancelled', 'no_show', 'completed']
adminRouter.patch(
  '/meetings/:id/finalize',
  authenticateJWT,
  authorizeRoles('admin'),
  validateBody(finalizeMeetingSchema),
  AdminController.finalizeMeeting
);

// GET /api/v1/admin/rides
adminRouter.get(
  '/rides',
  authenticateJWT,
  authorizeRoles('admin'),
  AdminController.listRides
);

//GET /api/v1/admin/dashboard/stats
adminRouter.get(
  '/dashboard/stats',
  authenticateJWT,
  authorizeRoles('admin'),
  AdminController.getDashboardStats
);

// GET /api/v1/admin/telemetry/*
adminRouter.use('/telemetry', adminTelemetryRouter);

export default adminRouter;