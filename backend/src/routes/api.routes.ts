import { Router } from 'express';
import * as airtimeController from '../controllers/airtime.controller';
import * as authController from '../controllers/auth.controller';
import * as geoController from '../controllers/geo.controller';
import * as logController from '../controllers/log.controller';
import * as ordersController from '../controllers/orders.controller';
import * as pricesController from '../controllers/prices.controller';

const router = Router();

router.get('/prices', (req, res, next) => {
  void pricesController.getPrices(req, res).catch(next);
});

router.post('/orders', (req, res, next) => {
  void ordersController.createOrder(req, res).catch(next);
});

router.get('/orders/:orderRef', (req, res, next) => {
  void ordersController.getOrder(req, res).catch(next);
});

router.post('/orders/verify-token', (req, res, next) => {
  void ordersController.verifyToken(req, res).catch(next);
});

router.get('/geo', (req, res) => {
  geoController.getGeo(req, res);
});

router.post('/log', (req, res, next) => {
  void logController.postLog(req, res).catch(next);
});

router.get('/auth', (req, res, next) => {
  void authController.getAuth(req, res).catch(next);
});

router.post('/airtime/send', (req, res, next) => {
  void airtimeController.postSend(req, res).catch(next);
});

router.post('/airtime/validate', (req, res, next) => {
  void airtimeController.postValidate(req, res).catch(next);
});

router.post('/airtime/status', (req, res, next) => {
  void airtimeController.postStatus(req, res).catch(next);
});

export default router;
