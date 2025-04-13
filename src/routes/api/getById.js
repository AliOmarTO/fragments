// src/routes/api/get.js
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');

const yaml = require('js-yaml');
const md = new MarkdownIt();
const sharp = require('sharp');

module.exports = async (req, res) => {
  logger.info('Retrieving fragment by id...');

  try {
    const { id, ext } = req.params;
    // fetch the fragment by id
    const fragment = await Fragment.byId(req.user, id);

    // Fragment exists, get its data
    const fragmentBuffer = await fragment.getData();

    if (ext) {
      // handle image conversion
      if (fragment.type.startsWith('image/')) {
        const format = ext.toLowerCase();

        const converted = await convertImage(fragmentBuffer, format);
        return res.type(`image/${format}`).send(converted);
      } else {
        // Handle non-image fragments
        const result = convertFragment(fragment.type, ext, fragmentBuffer);
        return res.type(result.type).send(result.content);
      }
    }

    //Set the Content-Type header
    res.set('content-type', fragment.type);
    res.send(new Buffer.from(fragmentBuffer));
  } catch (error) {
    if (error.message.startsWith('Conversion from')) {
      // Custom conversion error
      return res.status(415).json(
        createErrorResponse(415, {
          message: 'Unsupported conversion requested',
        })
      );
    }
    if (error.message.startsWith('Image conversion')) {
      // Custom conversion error
      return res.status(415).json(
        createErrorResponse(415, {
          message: 'image conversion failed' + error,
        })
      );
    }

    if (error.message === 'Fragment not found') {
      // Fragment does not exist
      logger.error(`Fragment not found: ${req.params.id}`);
      return res.status(404).json(
        createErrorResponse(404, {
          message: 'Fragment does not exist for user',
        })
      );
    }

    if (!res.headersSent) {
      return res.status(500).json(
        createErrorResponse(500, {
          message: 'There was an error retrieving the fragment',
        })
      );
    }
  }
};

async function convertImage(buffer, toFormat) {
  try {
    const convertedBuffer = await sharp(buffer).toFormat(toFormat).toBuffer();
    return convertedBuffer;
  } catch (err) {
    throw new Error(`Image conversion to .${toFormat} failed: ${err.message}`);
  }
}

function convertFragment(fragmentType, ext, buffer) {
  const text = buffer.toString();

  switch (fragmentType) {
    case 'text/plain':
      if (ext === 'txt') return { type: 'text/plain', content: text };
      break;

    case 'text/markdown':
      if (ext === 'md' || ext === 'txt') return { type: 'text/plain', content: text };
      if (ext === 'html') return { type: 'text/html', content: md.render(text) };
      break;

    case 'text/html':
      if (ext === 'html') return { type: 'text/html', content: text };
      if (ext === 'txt') return { type: 'text/plain', content: text };
      break;

    case 'text/csv':
      if (ext === 'csv' || ext === 'txt') return { type: 'text/plain', content: text };
      if (ext === 'json') return { type: 'application/json', content: JSON.stringify(text) };
      break;

    case 'application/json':
      if (ext === 'json') return { type: 'application/json', content: text };
      if (ext === 'txt') return { type: 'text/plain', content: text };
      if (ext === 'yaml' || ext === 'yml')
        return { type: 'application/yaml', content: yaml.dump(JSON.parse(text)) };
      break;

    case 'application/yaml':
      if (ext === 'yaml') return { type: 'application/yaml', content: text };
      if (ext === 'txt') return { type: 'text/plain', content: text };
      break;
  }

  throw new Error(`Conversion from ${fragmentType} to .${ext} is not supported.`);
}
