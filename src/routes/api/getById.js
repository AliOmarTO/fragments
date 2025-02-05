// src/routes/api/get.js
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

module.exports = async (req, res) => {
  logger.info('Retrieving fragment by id...');

  try {
    // checks if fragment exists for the user
    const userFragments = await Fragment.byUser(req.user);
    logger.debug({ userFragments }, 'User fragments');
    if (!userFragments.includes(req.params.id)) {
      logger.error('Fragment does not exist for user');

      res.status(404).json(
        createErrorResponse(404, {
          message: 'Fragment does not exist for user',
        })
      );
    } else {
      logger.debug('Fragment exists for user');
      const fragment = await Fragment.byId(req.user, req.params.id);
      const fragmentBuffer = await fragment.getData();
      logger.debug(fragmentBuffer, 'Fragment exists for user');
      res.send(fragmentBuffer);
    }
  } catch (error) {
    logger.error({ error }, 'Error retrieveing fragment');
    res.status(500).json(
      createErrorResponse(500, {
        message: 'There was an error retrieving the fragment',
      })
    );
  }
};
