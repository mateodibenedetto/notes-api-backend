require('dotenv').config()
require('./mongo')

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/Note')
const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors')

app.use(cors())
app.use(express.json())

// Sentry
Sentry.init({
  dsn: 'https://46dfbd276a154038ab0391c1dbc2e80d@o4504095186288640.ingest.sentry.io/4504095218663424',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

// Get root
app.get('/', (req, res) => {
  res.send('<h1>Helloou</h1>')
})

// Get all notes
app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

// Get a note by an id
app.get('/api/notes/:id', (req, res, next) => {
  const { id } = req.params
  Note.findById(id).then((note) => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  }).catch(err => next(err))
})

// Update a note
app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then((result) => {
      response.json(result)
    })
})

// Delete a note
app.delete('/api/notes/:id', (req, res, next) => {
  const { id } = req.params
  Note.findByIdAndRemove(id).then(result => {
    result.status(204).end()
  }).catch(err => next(err))

  res.status(204).end()
})

// Create a new note
app.post('/api/notes', (req, res) => {
  const note = req.body

  if (!note || !note.content) {
    return res.status(400).json({
      error: 'Content not found'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important || false
  })

  newNote.save().then(savedNote => {
    res.json(savedNote)
  })
})

// Not found
app.use(notFound)

// Sentry Handle error
app.use(Sentry.Handlers.errorHandler())

// Error
app.use(handleErrors)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})

module.exports = app
