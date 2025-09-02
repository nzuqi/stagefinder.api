import { Request, Response } from 'express';
import { StageRoute, StageRouteInput, StopData } from '../models';
import { asyncHandler, buildQueryOptions, deleteHandler, ErrorCodes, HttpError, responseHandler } from '../utils';
import path from 'path';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateStop = (stop: any, field: string): StopData => {
  if (!stop || typeof stop !== 'object') {
    throw new HttpError(422, `${field} must be an object with name, lat, and lng.`, ErrorCodes.VALIDATION);
  }
  const { lat, lng, name } = stop;

  if (typeof name !== 'string' || !name.trim()) {
    throw new HttpError(422, `${field}.name must be a valid non-empty string.`, ErrorCodes.VALIDATION);
  }
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new HttpError(422, `${field}.lat and ${field}.lng must be valid numbers.`, ErrorCodes.VALIDATION);
  }
  return { name: name.trim(), lat, lng };
};

export const createStageRoute = asyncHandler(async (req: Request, res: Response) => {
  const { name, sacco, source, stops, terminus } = req.body || {};

  if (typeof name !== 'string' || !name.trim()) {
    throw new HttpError(422, 'Name is required and must be valid.', ErrorCodes.VALIDATION);
  }

  const validatedSource = validateStop(source, 'source');
  const validatedTerminus = validateStop(terminus, 'terminus');

  if (!Array.isArray(stops) || stops.length === 0) {
    throw new HttpError(422, 'At least one stop is required.', ErrorCodes.VALIDATION);
  }

  const validatedStops: StopData[] = stops.map((stop, index) => validateStop(stop, `stops[${index}]`));

  const applicationInput: StageRouteInput = {
    name: name.trim(),
    source: validatedSource,
    terminus: validatedTerminus,
    stops: validatedStops,
    sacco,
  };

  const applicationCreated = await StageRoute.create(applicationInput);

  return responseHandler(res.status(201), { data: applicationCreated, message: 'StageRoute created successfully' }, [
    'name',
    'source',
    'terminus',
    'stops',
    'sacco',
    'createdAt',
    'updatedAt',
  ]);
});

export const getAllStageRoutes = asyncHandler(async (req: Request, res: Response) => {
  const { filter, pagination, sort } = buildQueryOptions(req, ['name', 'source', 'terminus', 'stops', 'sacco', 'createdAt', 'updatedAt']);

  if (!req.query?.limit) {
    const data = await StageRoute.find(filter).sort(sort).exec();

    return responseHandler(
      res.status(200),
      {
        data,
        message: 'Successful',
      },
      ['name', 'source', 'terminus', 'stops', 'sacco', 'createdAt', 'updatedAt'],
    );
  }

  const [data, total] = await Promise.all([
    StageRoute.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).exec(),
    StageRoute.countDocuments(filter),
  ]);

  return responseHandler(
    res.status(200),
    {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      data,
      message: 'Successful',
    },
    ['name', 'source', 'terminus', 'stops', 'sacco', 'createdAt', 'updatedAt'],
  );
});

export const getStageRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const application = await StageRoute.findOne({ _id: id });

  if (!application) {
    throw new HttpError(404, `StageRoute with id '${id}' not found.`, ErrorCodes.NOT_FOUND);
  }

  return responseHandler(res.status(200), { data: application }, ['name', 'source', 'terminus', 'stops', 'sacco', 'createdAt', 'updatedAt']);
});

export const updateStageRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sacco, source, stops, terminus } = req.body || {};

  if (!id) {
    throw new HttpError(400, 'StageRoute ID is required.', ErrorCodes.VALIDATION);
  }

  const stageRoute = await StageRoute.findById(id);

  if (!stageRoute) {
    throw new HttpError(404, 'StageRoute not found.', ErrorCodes.NOT_FOUND);
  }

  const updateData: Partial<StageRouteInput> = {};

  if (typeof name === 'string' && name.trim()) {
    updateData.name = name.trim();
  }

  if (source) {
    updateData.source = validateStop(source, 'source');
  }

  if (terminus) {
    updateData.terminus = validateStop(terminus, 'terminus');
  }

  if (Array.isArray(stops)) {
    if (stops.length === 0) {
      throw new HttpError(422, 'At least one stop is required if updating stops.', ErrorCodes.VALIDATION);
    }
    updateData.stops = stops.map((stop, index) => validateStop(stop, `stops[${index}]`));
  }

  if (typeof sacco === 'string') {
    updateData.sacco = sacco.trim();
  }

  const updatedStageRoute = await StageRoute.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();

  return responseHandler(res.status(200), { data: updatedStageRoute, message: 'StageRoute updated successfully' }, [
    'name',
    'source',
    'terminus',
    'stops',
    'sacco',
    'createdAt',
    'updatedAt',
  ]);
});

export const deleteStageRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // single delete
  const { ids } = req.body || {}; // bulk delete

  const result = await deleteHandler({
    model: StageRoute,
    id,
    ids,
    resourceName: 'StageRoute',
    returnDeletedDocs: true,
  });

  return responseHandler(res.status(200), result, ['name', 'source', 'terminus', 'stops', 'sacco', 'createdAt', 'updatedAt']);
});

export const reseedStageRoutes = asyncHandler(async (req: Request, res: Response) => {
  const filePath = path.join(__dirname, '../data/stageroutes.json');

  if (!fs.existsSync(filePath)) {
    throw new HttpError(500, 'Seed file not found.', ErrorCodes.INTERNAL);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = fs.readFileSync(filePath, 'utf-8');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let routes: any[];

  try {
    routes = JSON.parse(rawData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new HttpError(500, 'Invalid JSON format in seed file.', ErrorCodes.INTERNAL);
  }

  if (!Array.isArray(routes) || routes.length === 0) {
    throw new HttpError(422, 'Seed file must contain a non-empty array.', ErrorCodes.VALIDATION);
  }

  await StageRoute.deleteMany({});

  const expandedRoutes = routes.flatMap((route) => {
    const { saccos = [], ...rest } = route;

    if (Array.isArray(saccos) && saccos.length > 0) {
      return saccos.map((sacco) => ({
        ...rest,
        sacco,
      }));
    }

    return [
      {
        ...rest,
        sacco: null,
      },
    ];
  });

  const createdRoutes = await StageRoute.insertMany(expandedRoutes);

  return responseHandler(
    res.status(201),
    {
      message: 'StageRoutes reseeded successfully.',
      total: createdRoutes.length,
      data: createdRoutes,
    },
    ['name', 'source', 'terminus', 'stops', 'sacco', 'createdAt', 'updatedAt'],
  );
});
