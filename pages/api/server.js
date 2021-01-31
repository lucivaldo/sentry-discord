// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require('axios')

const COLORS = {
  debug: parseInt('fbe14f', 16),
  info: parseInt('2788ce', 16),
  warning: parseInt('f18500', 16),
  error: parseInt('e03e2f', 16),
  fatal: parseInt('d20f2a', 16),
}

export default (req, res) => {
  const {
    project_name: title,
    message: description,
    url,
    event,
    level,
  } = req.body

  const payload = {
    username: 'Sentry',
    embeds: [
      {
        title,
        type: 'rich',
        description,
        url,
        timestamp: new Date(event.received * 1000).toISOString(),
        color: COLORS[level] || COLORS.error,
        footer: {
          icon_url: 'https://github.com/fluidicon.png',
          text: 'lucivaldo/sentry-discord'  
        },
        fields: []
      }
    ]
  }

  if (event.user) {
    payload.embeds[0].fields.push({
      name: '**User**',
      value: event.user.username
    })
  }

  if (event.tags) {
    event.tags.forEach(([key, value]) => {
      payload.embeds[0].fields.push({
        name: key,
        value,
        inline: true
      })
    })
  }

  const projectSlug = req.body.project
  const webhookURL = webhooksList[projectSlug.toUpperCase().replace(/-/g, '_')] || webhooksList['default']

  axios.post(webhookURL, payload)
  .then(() => {
    res.statusCode = 200
    res.json({
      status: 'ok'
    })
  })
  .catch(() => {
    res.statusCode = 400
    res.json({
      status: 'error'
    })
  })
}
