const express = require('express');
const router = express.Router();
const accountController = require('../controller/accountController')


router.post('/api/accounts',accountController.openAccount)
router.put('/api/accounts/:id/kyc',accountController.updateKyc)
router.put('/account/:acId/deposit',accountController.depositMoney)
router.put('/account/:acId/withdraw',accountController.withdrawMoney)
router.post('/account/:fromAcId/transfer/:toAcId',accountController.transferMoney)
router.post('/account/:toAcId/receive',accountController.receiveMoney)
router.get('/account/:acId/print-statement',accountController.printStatement)
router.delete('/account/:acId',accountController.closeAccount)

module.exports = router