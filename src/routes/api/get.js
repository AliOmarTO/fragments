// src/routes/api/get.js
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.info('Retrieving all fragments for the current user...');
  logger.debug(req.user, 'Authenticated user');

  const { expand } = req.query;
  try {
    const fragmentsReturned = await Fragment.byUser(req.user, expand ? true : false);
    res.status(200).json(
      createSuccessResponse({
        fragments: fragmentsReturned,
      })
    );
  } catch (error) {
    logger.error('Error retrieving fragments', error);
    res.status(500).json(
      createErrorResponse({
        message: 'There was an error retrieving the fragments:',
        error,
      })
    );
  }
};
