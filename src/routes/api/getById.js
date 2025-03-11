// src/routes/api/get.js
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  logger.info('Retrieving fragment by id...');

  try {
    // fetch the fragment by id
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Fragment exists, get its data
    const fragmentBuffer = await fragment.getData();
    logger.debug(fragmentBuffer, 'Fragment exists for user');

    // Set the Content-Type header
    res.set('content-type', 'text/plain');
    res.send(new Buffer.from(fragmentBuffer));
  } catch (error) {
    if (error.message === 'Fragment not found') {
      // Fragment does not exist
      logger.error(`Fragment not found: ${req.params.id}`);
      return res.status(404).json(
        createErrorResponse(404, {
          message: 'Fragment does not exist for user',
        })
      );
    }
    logger.error({ error }, 'Error retrieveing fragment');

    if (!res.headersSent) {
      return res.status(500).json(
        createErrorResponse(500, {
          message: 'There was an error retrieving the fragment',
        })
      );
    }
  }
};
