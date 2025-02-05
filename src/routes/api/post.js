const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

module.exports = async (req, res) => {
  logger.info('Creating a new fragment');

  // check if API_URL is set
  const apiUrl = process.env.API_URL || req.headers.host;

  if (Buffer.isBuffer(req.body)) {
    try {
      // We have a buffer, so we can create a new fragment
      const fragment = new Fragment({
        ownerId: req.user,
        type: contentType.parse(req).type,
      });
      await fragment.save();
      const data = Buffer.from(req.body);
      await fragment.setData(data);

      res.location(`${apiUrl}/v1/fragments/${fragment.id}`);
      res.status(201).json(
        createSuccessResponse({
          fragment: fragment,
        })
      );
    } catch {
      logger.error('Error creating fragment');
      res.status(500).json(
        createErrorResponse({
          message: 'There was an error creating the fragment',
        })
      );
    }
  } else {
    // We don't have a buffer, so we can't create a new fragment
    logger.error('Unsupported media type');
    res.status(415).json(
      createErrorResponse({
        message: 'This is an unsupported media type',
      })
    );
  }
};
