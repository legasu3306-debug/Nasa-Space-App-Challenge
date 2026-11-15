import { Router } from 'express';
import { getCurrentWeatherBundleHandler } from '../controllers/weather.controller.js';

export const weatherRouter = Router();

weatherRouter.get('/current', getCurrentWeatherBundleHandler);
