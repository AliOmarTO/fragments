// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// get Fragment class from model
const { Fragment } = require('../../model/fragment');

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const logger = require('../../logger');

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      logger.debug(type);
      logger.debug(Fragment.isSupportedType(type), "checking if it's supported");
      return Fragment.isSupportedType(type);
    },
  });

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

router.get('/fragments/:id.:ext?', require('./getById'));

router.post('/fragments', rawBody(), require('./post'));

router.get('/fragments/:id/info', require('./getFragmentInfo'));

router.delete('/fragments/:id', require('./deleteById'));

router.put('/fragments/:id', rawBody(), require('./updateById'));

module.exports = router;
