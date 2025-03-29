const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

/**
 * Deletes a fragment by ID.
 * If the id is not found, returns an HTTP 404 with an appropriate error message.
 * Once the fragment is deleted, an HTTP 200 is returned, along with the ok status
 */
module.exports = async (req, res) => {
  logger.info('Deleting fragment by id...');

  try {
    const { id } = req.params;
    // Attempt to delete the fragment
    const deleted = await Fragment.delete(req.user, id);

    // If no fragment was deleted, return 404
    if (!deleted) {
      logger.error(`Fragment not found: ${id}`);
      return res
        .status(404)
        .json(createErrorResponse({ code: 404, message: 'Fragment not found' }));
    }

    return res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error({ err }, 'Error deleting fragment');
    return res.status(500).json(
      createErrorResponse({
        code: 500,
        message: 'There was an error deleting the fragment',
      })
    );
  }
};
