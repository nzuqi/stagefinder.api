import { Router } from 'express';
import { stageRouteRoutes } from './stageroute.route';

const router = Router();

router.use('/', stageRouteRoutes());

export default router;
