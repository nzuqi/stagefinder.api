import { Router } from 'express';
import { createStageRoute, deleteStageRoute, getAllStageRoutes, getStageRoute, reseedStageRoutes, updateStageRoute } from '../controllers';

export const stageRouteRoutes = () => {
  const router = Router();

  router.post('/v1/routes', createStageRoute);

  router.get('/v1/routes', getAllStageRoutes);

  router.get('/v1/routes/:id', getStageRoute);

  router.put('/v1/routes/:id', updateStageRoute);

  router.delete('/v1/routes/:id', deleteStageRoute);

  router.delete('/v1/routes', deleteStageRoute);

  router.post('/v1/routes/seed', reseedStageRoutes);

  return router;
};
