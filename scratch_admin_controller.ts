import { Request, Response, NextFunction } from 'express';
import { listDriverApplicationsQuerySchema, updateDriverStatusSchema, updateDocumentStatusSchema } from '../dtos/admin-applicationDriver.dto.js';
import { proposeMeetingSchema, finalizeMeetingSchema } from '../dtos/admin-meeting.dto.js';
import { ListRidesQueryDto } from '../dtos/admin-rides.dto.js';
import { MetricasQuerySchema } from '../dtos/admin-dashboard.dto.js';
import { AdminService } from '../services/admin.service.js';
import { ApiError } from '../../../shared/http/api-error.js';


export class AdminController {
  public static list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = listDriverApplicationsQuerySchema.parse(req.query);

      const result = await AdminService.listApplications(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static getDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const detail = await AdminService.getApplicationDetail(id);
      res.status(200).json(detail);
    } catch (error) {
      next(error);
    }
  };

  public static updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateDriverStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.issues);
      }

      const adminId = req.auth?.userId as string;
      const driverId = req.params.id as string;
      const result = await AdminService.updateApprovalStatus(driverId, adminId, parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static updateDocumentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateDocumentStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.issues);
      }

      const adminId = req.auth?.userId as string;
      const documentId = req.params.id as string;
      const result = await AdminService.updateDocumentStatus(documentId, adminId, parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Reuniones
  public static proposeMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const driverId = req.params.id as string;
      const adminId = req.auth?.userId as string;
      const proposeData = proposeMeetingSchema.parse(req.body);
      const meeting = await AdminService.proposeMeeting(driverId, adminId, proposeData);
      res.status(201).json(meeting);
    } catch (error) {
      next(error);
    }
  };

  public static finalizeMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const meetingId = req.params.id as string;
      const finalizeData = finalizeMeetingSchema.parse(req.body);
      const meeting = await AdminService.finalizeMeeting(meetingId, finalizeData);
      res.status(200).json(meeting);
    } catch (error) {
      next(error);
    }
  };

  public static listRides = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = ListRidesQueryDto.parse(req.query);
      const result = await AdminService.listRides(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public static getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = MetricasQuerySchema.parse(req.query);
      const stats = await AdminService.getDashboardStats(query);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };


}
