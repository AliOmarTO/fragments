const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    // Fetch the fragment by ID
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) {
      logger.error(`Fragment not found: ${req.params.id}`);
      return res.status(404).json({
        status: 'error',
        message: 'Fragment does not exist for user',
      });
    }

    // return the metadata
    return res.status(200).json({
      status: 'success',
      fragment: fragment,
    });
  } catch (error) {
    logger.error({ error }, 'Error retrieving fragment');
    return res.status(500).json({
      status: 'error',
      message: 'There was an error retrieving the fragment',
    });
  }
};
