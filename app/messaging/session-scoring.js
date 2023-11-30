const processScoring = async (msg) => {
  try {
    const { body, sessionId, applicationProperties } = msg
console.log('body, sessionId, applicationProperties=========>\n',body, sessionId, applicationProperties);
   return { body, sessionId, applicationProperties }
  } catch (err) {
  console.log('ERROR IN session-scoring file====>\n',err)
  }
}

module.exports = processScoring
