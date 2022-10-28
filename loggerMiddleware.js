const logger = (req, res, next) => {
  next() // para que vaya al siguiente endpoint
}

module.exports = logger
