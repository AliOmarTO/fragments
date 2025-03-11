const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    // Fetch the fragment by ID
    const fragment = await Fragment.byId(req.user, req.params.id);

    // return the metadata
    return res.status(200).json({
      status: 'success',
      fragment: fragment,
    });
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

    logger.error({ error }, 'Error retrieving fragment');
    return res.status(500).json({
      status: 'error',
      message: 'There was an error retrieving the fragment',
    });
  }
};
