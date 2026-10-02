import { Op } from 'sequelize';

import { ApiError } from '../../../shared/http/api-error.js';
import { ProfileModel } from '../../user/models/profile.model.js'; // ajustá el path real
import { DriverApplicationDetailDto, driverApplicationDetailSchema, ListDriverApplicationsQueryDto, ListDriverApplicationsResponseDto, listDriverApplicationsResponseSchema, UpdateDriverStatusDto, UpdateDocumentStatusDto } from '../dtos/admin-applicationDriver.dto.js';
import { DriverProfileModel } from '../../driver/models/driver.model.js';
import { DriverMeetingModel } from '../../driver/models/driver-metting.model.js';
import { VehicleModel } from '../../driver/models/vehicle.model.js';
import { DriverDocumentModel } from '../../driver/models/driver-documents.model.js';
import { VehicleDocumentModel } from '../../driver/models/vehicle-documents.js';
import { DOMAIN_EVENTS, eventBus } from '../../../shared/events/event-bus.js';
import { FinalizeMeetingDto, ProposeMeetingDto } from '../dtos/admin-meeting.dto.js';
import { UserModel } from '../../user/models/user.model.js';
import { TripModel } from '../../trips/models/trip.model.js';
import { ServiceTypeModel } from '../../pricing/models/service-type.model.js';
import { ListRidesQueryDto, ListRidesResponseDto } from '../dtos/admin-rides.dto.js';
import { MetricasQueryDto, MetricasResponseDto, MetricasResponseSchema } from '../dtos/admin-dashboard.dto.js';
import { WalletTransactionModel } from '../../wallet/models/wallet-transaction.model.js';


export class AdminService {


  public static async listApplications(
    query: ListDriverApplicationsQueryDto
  ): Promise<ListDriverApplicationsResponseDto> {
    const limit = query.limit;
    const offset = (query.page - 1) * limit;

    const whereClause: any = query.status ? { approvalStatus: query.status } : {};

    if (query.search) {
      const searchTerms = `%${query.search}%`;
      const profiles = await ProfileModel.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: searchTerms } },
            { lastName: { [Op.iLike]: searchTerms } },
            { phoneE164: { [Op.iLike]: searchTerms } },
          ],
        },
        attributes: ['id'],
      });
      const users = await UserModel.findAll({
        where: { email: { [Op.iLike]: searchTerms } },
        attributes: ['id'],
      });

      const matchedIds = Array.from(new Set([
        ...profiles.map(p => p.id),
        ...users.map(u => u.id),
      ]));

      whereClause.id = { [Op.in]: matchedIds };
    }

    const { rows: driverProfiles, count: totalCount } = await DriverProfileModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', query.order.toUpperCase()]],
    });

    const pendingCount = await DriverProfileModel.count({ where: { approvalStatus: 'pending' } });

    if (driverProfiles.length === 0) {
      return listDriverApplicationsResponseSchema.parse({
        data: [],
        pendingCount,
        pagination: { page: query.page, pageSize: limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
      });
    }

    const driverIds = driverProfiles.map((dp) => dp.id);

    // Nombres, emails: batch, no una query por fila (evita N+1)
    const profiles = await ProfileModel.findAll({ where: { id: { [Op.in]: driverIds } } });
    const profileById = new Map(profiles.map((p) => [p.id, p]));

    const usersList = await UserModel.findAll({ where: { id: { [Op.in]: driverIds } } });
    const userById = new Map(usersList.map((u) => [u.id, u]));

    // Última reunión de cada conductor: traemos todas y nos quedamos con la más reciente por driverId.
    const meetings = await DriverMeetingModel.findAll({
      where: { driverId: { [Op.in]: driverIds } },
      order: [['createdAt', 'DESC']],
    });
    const latestMeetingByDriverId = new Map<string, DriverMeetingModel>();
    for (const meeting of meetings) {
      if (!latestMeetingByDriverId.has(meeting.driverId)) {
        latestMeetingByDriverId.set(meeting.driverId, meeting);
      }
    }

    const data = driverProfiles.map((dp) => {
      const profile = profileById.get(dp.id);
      const user = userById.get(dp.id);
      const latestMeeting = latestMeetingByDriverId.get(dp.id);
      return {
        id: dp.id,
        fullName: profile ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() : '',
        email: user?.email ?? null,
        phone: profile?.phoneE164 ?? null,
        approvalStatus: dp.approvalStatus,
        meetingStatus: latestMeeting?.status ?? null,
        createdAt: dp.createdAt.toISOString(),
      };
    });

    return listDriverApplicationsResponseSchema.parse({
      data,
      pendingCount,
      pagination: {
        page: query.page,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  }

  public static async getApplicationDetail(driverId: string): Promise<DriverApplicationDetailDto> {
    const driverProfile = await DriverProfileModel.findByPk(driverId);
    if (!driverProfile) {
      throw new ApiError(404, 'DRIVER_NOT_FOUND', 'La solicitud no existe');
    }

    const profile = await ProfileModel.findByPk(driverId);
    const vehicles = await VehicleModel.findAll({ where: { driverId } });
    const vehicleIds = vehicles.map((v) => v.id);

    const driverDocuments = await DriverDocumentModel.findAll({ where: { driverId } });
    const vehicleDocuments =
      vehicleIds.length > 0 ? await VehicleDocumentModel.findAll({ where: { vehicleId: { [Op.in]: vehicleIds } } }) : [];

    const latestMeeting = await DriverMeetingModel.findOne({
      where: { driverId },
      order: [['createdAt', 'DESC']],
    });

    return driverApplicationDetailSchema.parse({
      driverProfile: {
        id: driverProfile.id,
        approvalStatus: driverProfile.approvalStatus,
        availabilityStatus: driverProfile.availabilityStatus,
        rejectionReason: driverProfile.rejectionReason,
        approvedAt: driverProfile.approvedAt?.toISOString() ?? null,
        approvedBy: driverProfile.approvedBy,
        ratingAverage: Number(driverProfile.ratingAverage),
        ratingCount: driverProfile.ratingCount,
        createdAt: driverProfile.createdAt.toISOString(),
      },
      personalData: {
        fullName: profile ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() : '',
        phoneE164: profile?.phoneE164 ?? null,
        birthDate: profile?.birthDate ?? null,
        documentType: profile?.documentType ?? null,
        documentNumber: profile?.documentNumber ?? null,
        addressText: profile?.addressText ?? null,
      },
      vehicles: vehicles.map((v) => ({
        id: v.id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        year: v.year,
        status: v.status,
      })),
      driverDocuments: driverDocuments.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        filePath: d.filePath,
        status: d.status,
        issuedAt: d.issuedAt ? d.issuedAt.toISOString() : null,
        expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
      })),
      vehicleDocuments: vehicleDocuments.map((d) => ({
        id: d.id,
        vehicleId: d.vehicleId,
        documentType: d.documentType,
        filePath: d.filePath,
        status: d.status,
        issuedAt: d.issuedAt ? d.issuedAt.toISOString() : null,
        expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
      })),
      latestMeeting: latestMeeting
        ? {
          id: latestMeeting.id,
          status: latestMeeting.status,
          scheduledAt: latestMeeting.scheduledAt.toISOString(),
          location: latestMeeting.location,
        }
        : null,
    });
  }



  public static async updateApprovalStatus(driverId: string, adminId: string, dto: UpdateDriverStatusDto) {
    const driverProfile = await DriverProfileModel.findByPk(driverId);
    if (!driverProfile) {
      throw new ApiError(404, 'DRIVER_NOT_FOUND', 'La solicitud no existe');
    }

    if (dto.status === 'approved') {
      const latestMeeting = await DriverMeetingModel.findOne({
        where: { driverId },
        order: [['createdAt', 'DESC']],
      });
      if (!latestMeeting || latestMeeting.status !== 'completed') {
        throw new ApiError(400, 'MEETING_NOT_COMPLETED', 'No se puede aprobar sin la reunión en persona completada');
      }
    }

    await driverProfile.update({
      approvalStatus: dto.status,
      approvedAt: dto.status === 'approved' ? new Date() : null,
      approvedBy: dto.status === 'approved' ? adminId : null,
      rejectionReason: dto.status === 'rejected' ? (dto.rejectionReason ?? null) : null,
    });

    // Se emite DESPUÉS del update exitoso — si el listener falla, la
    // aprobación ya quedó guardada (mismo principio que el .parse() fuera
    // de la transacción: el efecto secundario no debe poder deshacer la
    // persistencia).
    if (dto.status === 'approved') {
      await VehicleModel.update(
        {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId,
        },
        { where: { driverId } }
      );

      eventBus.emit(DOMAIN_EVENTS.DRIVER_APPROVED, {
        driverId,
        approvedBy: adminId,
        approvedAt: driverProfile.approvedAt!.toISOString(),
      });
    } else {
      await VehicleModel.update(
        {
          status: dto.status,
        },
        { where: { driverId } }
      );
    }

    return driverProfile;
  }

  public static async updateDocumentStatus(documentId: string, adminId: string, dto: UpdateDocumentStatusDto) {
    const driverDoc = await DriverDocumentModel.findByPk(documentId);
    
    if (driverDoc) {
      await driverDoc.update({
        status: dto.status,
        rejectionReason: dto.status === 'rejected' ? (dto.rejectionReason ?? null) : null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      });
      return driverDoc;
    }

    const vehicleDoc = await VehicleDocumentModel.findByPk(documentId);
    
    if (vehicleDoc) {
      await vehicleDoc.update({
        status: dto.status,
        rejectionReason: dto.status === 'rejected' ? (dto.rejectionReason ?? null) : null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      });
      return vehicleDoc;
    }

    throw new ApiError(404, 'DOCUMENT_NOT_FOUND', 'El documento no existe');
  }


  // REUNIONES
  public static async proposeMeeting(
    driverId: string,
    adminId: string,
    payload: ProposeMeetingDto
  ) {
    const driverProfile = await DriverProfileModel.findByPk(driverId);
    if (!driverProfile) {
      throw new ApiError(404, 'DRIVER_NOT_FOUND', 'El conductor no existe');
    }

    // No tiene sentido agendar una nueva si ya hay una activa (proposed / confirmed / reschedule_requested)
    const activeMeeting = await DriverMeetingModel.findOne({
      where: { driverId, status: ['proposed', 'confirmed', 'reschedule_requested'] },
    });
    if (activeMeeting) {
      throw new ApiError(400, 'MEETING_ALREADY_ACTIVE', 'Ya existe una reunión activa para este conductor');
    }

    return DriverMeetingModel.create({
      driverId,
      proposedBy: adminId,
      scheduledAt: new Date(payload.scheduledAt),
      location: payload.location ?? null,
      status: 'proposed',
    });
  }

  public static async finalizeMeeting(
    meetingId: string,
    payload: FinalizeMeetingDto
  ) {
    const meeting = await DriverMeetingModel.findByPk(meetingId);
    if (!meeting) {
      throw new ApiError(404, 'MEETING_NOT_FOUND', 'La reunión no existe');
    }

    const finalStatuses = ['completed', 'no_show', 'cancelled'];
    if (finalStatuses.includes(meeting.status)) {
      throw new ApiError(400, 'MEETING_ALREADY_FINALIZED', 'La reunión ya ha sido finalizada previamente');
    }

    const completedAt = payload.status === 'completed' ? new Date() : null;
    const adminNotes = payload.adminNotes ?? meeting.adminNotes;

    await meeting.update({
      status: payload.status,
      completedAt,
      adminNotes,
    });

    return meeting;
  }


  // [Listado de Viajes] Endpoint GET /api/v1/admin/rides con filtros por fecha, estado del viaje y buscador por pasajero/chofer.
  public static async listRides(
    query: ListRidesQueryDto
  ): Promise<ListRidesResponseDto> {
    const { dateFrom, dateTo, status, driverId, passengerId, search, page, limit, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    if (status && status.length > 0) {
      where.status = { [Op.in]: status };
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (passengerId) {
      where[Op.or] = [{ passengerUserId: passengerId }, { requestedByUserId: passengerId }];
    }

    if (search) {
      where.publicCode = { [Op.iLike]: `%${search}%` };
    }

    const sortColumn = sortBy === 'dateFrom' ? 'createdAt' : sortBy;
    const order: [string, string][] = [[sortColumn, sortOrder.toUpperCase()]];

    const { rows: trips, count: total } = await TripModel.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    if (trips.length === 0) {
      return ListRidesResponseDto.parse({
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: [],
      });
    }

    // En un viaje para un tercero no hay pasajero con cuenta: los datos de
    // contacto que se muestran son los del solicitante.
    const passengerUserIds = trips.map((t) => t.passengerUserId ?? t.requestedByUserId);
    const driverIds = trips.map((t) => t.driverId).filter((id): id is string => Boolean(id));
    const vehicleIds = trips.map((t) => t.vehicleId).filter((id): id is string => Boolean(id));
    const serviceTypeIds = trips.map((t) => t.serviceTypeId).filter((id): id is string => Boolean(id));

    const allUserIds = Array.from(new Set([...passengerUserIds, ...driverIds]));

    const [users, profiles, vehicles, serviceTypes] = await Promise.all([
      UserModel.findAll({ where: { id: { [Op.in]: allUserIds } } }),
      ProfileModel.findAll({ where: { id: { [Op.in]: allUserIds } } }),
      vehicleIds.length > 0
        ? VehicleModel.findAll({ where: { id: { [Op.in]: vehicleIds } } })
        : Promise.resolve([]),
      serviceTypeIds.length > 0
        ? ServiceTypeModel.findAll({ where: { id: { [Op.in]: serviceTypeIds } } })
        : Promise.resolve([]),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
    const serviceTypeMap = new Map(serviceTypes.map((st) => [st.id, st]));

    const data = trips.map((t) => {
      const accountUserId = t.passengerUserId ?? t.requestedByUserId;
      const passengerUser = userMap.get(accountUserId);
      const passengerProfile = profileMap.get(accountUserId);

      const driverUser = t.driverId ? userMap.get(t.driverId) : null;
      const driverProfile = t.driverId ? profileMap.get(t.driverId) : null;

      const vehicle = t.vehicleId ? vehicleMap.get(t.vehicleId) : null;
      const serviceType = t.serviceTypeId ? serviceTypeMap.get(t.serviceTypeId) : null;

      return {
        id: t.id,
        publicCode: t.publicCode,
        status: t.status,
        bookingType: t.bookingType,
        estimatedFare: t.estimatedFare ?? null,
        finalFare: t.finalFare ?? null,
        estimatedDistanceM: t.estimatedDistanceM,
        estimatedDurationS: t.estimatedDurationS,
        routeProvider: t.routeProvider,
        currency: t.currency,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),

        thirdParty:
          t.thirdPartyName && t.thirdPartyPhone
            ? {
              name: t.thirdPartyName,
              phone: t.thirdPartyPhone,
              email: t.thirdPartyEmail ?? null,
            }
            : null,

        passenger: {
          id: accountUserId,
          email: passengerUser?.email ?? '',
          firstName: passengerProfile?.firstName ?? '',
          lastName: passengerProfile?.lastName ?? '',
          phone: passengerProfile?.phoneE164 ?? null,
        },

        driver: t.driverId && driverUser ? {
          id: t.driverId,
          email: driverUser.email,
          firstName: driverProfile?.firstName ?? '',
          lastName: driverProfile?.lastName ?? '',
          phone: driverProfile?.phoneE164 ?? null,
        } : null,

        vehicle: vehicle ? {
          id: vehicle.id,
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
          color: vehicle.color,
        } : null,

        serviceType: serviceType ? {
          id: serviceType.id,
          name: serviceType.name,
          description: serviceType.description ?? null,
          basePrice: serviceType.baseFare,
          pricePerKm: serviceType.pricePerKm,
          pricePerMin: serviceType.pricePerMinute,
          currency: serviceType.currency,
        } : null,
      };
    });

    return ListRidesResponseDto.parse({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    });
  }

  // [Métricas clave] Retorna: Total de viajes, Facturación bruta, Comisión neta y Ratio de cancelaciones por período.
  public static async getDashboardStats(
    query: MetricasQueryDto
  ): Promise<MetricasResponseDto> {
    const { periodo, fecha } = query;
    const baseDate = fecha ? new Date(fecha) : new Date();

    let startDate: Date;
    let endDate: Date;

    const year = baseDate.getUTCFullYear();
    const month = baseDate.getUTCMonth();

    if (periodo === 'day') {
      const date = baseDate.getUTCDate();
      startDate = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));
    } else if (periodo === 'month') {
      startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    } else {
      // year
      startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    }

    const dateWhere = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    // 1. Total de viajes en el período
    const totalViajes = await TripModel.count({
      where: dateWhere,
    });

    // 2. Viajes cancelados en el período para el ratio de cancelaciones
    const totalCancelados = await TripModel.count({
      where: {
        ...dateWhere,
        status: 'cancelled',
      },
    });

    const ratioCancelacionesRaw = totalViajes > 0 ? totalCancelados / totalViajes : 0;
    const ratioCancelaciones = Number(ratioCancelacionesRaw.toFixed(4));

    // 3. Viajes completados para facturación bruta
    const completedTrips = await TripModel.findAll({
      where: {
        ...dateWhere,
        status: 'completed',
      },
    });

    let facturacionBrutaSum = 0;
    for (const trip of completedTrips) {
      facturacionBrutaSum += Number(trip.finalFare ?? trip.estimatedFare ?? 0);
    }
    const facturacionBruta = Number(facturacionBrutaSum.toFixed(2));

    // 4. Comisión neta calculada desde la verdad contable (Ledger)
    // Al usar la cuenta 'platform' del libro inmutable, se respeta la trazabilidad total:
    // La comisión bruta original queda intacta en su asiento de earning, y la neta es el
    // resultado de sumar refunds, chargebacks y ajustes manuales en el período.
    //
    // TODO: Negocio - Dejar comentado para más adelante preguntar al cliente si en caso de
    // reembolso o contracargo se le quita la ganancia al conductor (por ahora se hace cargo la empresa).
    // TODO: Negocio - Definir si las multas y costos extra de las pasarelas por contracargos
    // se incluyen en la cuenta platform para reflejar la pérdida real, o en otra cuenta separada.
    const comisionNetaRaw = await WalletTransactionModel.sum('amount', {
      where: {
        accountType: 'platform',
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    });
    const comisionNeta = Number(Number(comisionNetaRaw || 0).toFixed(2));

    return MetricasResponseSchema.parse({
      totalViajes,
      facturacionBruta,
      comisionNeta,
      ratioCancelaciones,
    });
  }
}

