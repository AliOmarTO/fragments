const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

/**
 * updates a fragment by ID and returns 200 and the metadata.
 * If the id is not found, returns an HTTP 404 with an appropriate error message.
 * If the Content-Type of the request does not match the existing fragment's type, returns an HTTP 400 with an appropriate error message.
 * A fragment's type can not be changed after it is created.
 * The entire request body is used to update the fragment's data, replacing the original value.
 */

module.exports = async (req, res) => {
  logger.info('Updating fragment by id...');

  try {
    const { id } = req.params;
    const contentType = req.headers['content-type'];

    // get the fragment to be updated
    const fragment = await Fragment.byId(req.user, id);
    // If fragment doesnt exist, return 404
    if (!fragment) {
      logger.error(`Fragment not found: ${id}`);
      return res
        .status(404)
        .json(createErrorResponse({ code: 404, message: 'Fragment not found' }));
    }

    // If the content type of the request does not match the existing fragment's type, return 400
    if (fragment.type !== contentType) {
      logger.error(`Content-Type mismatch: ${contentType}`);
      return res
        .status(400)
        .json(createErrorResponse({ code: 400, message: 'Content-Type mismatch' }));
    }

    // Attempt to update the fragment
    const data = Buffer.from(req.body);
    await fragment.setData(data);

    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (error) {
    logger.error(error, 'Error creating fragment');
    res.status(500).json(
      createErrorResponse({
        message: 'There was an error creating the fragment',
        error: error.message,
      })
    );
  }
};
