const createMessage = (body, type, options) => {
  return {
    body,
    type,
    source: 'ffc-future-grants-file-store',
    ...options
  }
}

module.exports = createMessage
