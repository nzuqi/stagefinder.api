import { Router } from 'express';
import { createStageRoute, deleteStageRoute, getAllStageRoutes, getStageRoute, reseedStageRoutes, updateStageRoute } from '../controllers';

export const stageRouteRoutes = () => {
  const router = Router();

  router.post('/v1/stage-routes', createStageRoute);

  router.get('/v1/stage-routes', getAllStageRoutes);

  router.get('/v1/stage-routes/:id', getStageRoute);

  router.put('/v1/stage-routes/:id', updateStageRoute);

  router.delete('/v1/stage-routes/:id', deleteStageRoute);

  router.delete('/v1/stage-routes', deleteStageRoute);

  router.post('/v1/stage-routes/seed', reseedStageRoutes);

  return router;
};
