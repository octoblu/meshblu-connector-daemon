const path = require("path")
const pm2 = require("pm2")

class MeshbluConnectorDaemon {
  constructor({ type, uuid, token, domain, connectorsPath }) {
    this.type = type
    this.uuid = uuid
    this.token = token
    this.domain = domain
    this.connectorsPath = connectorsPath
  }

  start(callback) {
    const connectorPath = path.resolve(path.join(this.connectorsPath, this.type))
    const cmd = path.join(connectorPath, this.type)
    pm2.connect(false, error => {
      if (error) return callback(error)
      pm2.start(
        {
          name: `${this.type}-${this.uuid}`,
          script: cmd,
          cwd: connectorPath,
          restartDelay: 5000,
          interpreter: "none",
          force: true,
          env: {
            MESHBLU_UUID: this.uuid,
            MESHBLU_TOKEN: this.token,
            MESHBLU_DOMAIN: this.domain,
          },
        },
        callback
      )
    })
  }
}

module.exports.MeshbluConnectorDaemon = MeshbluConnectorDaemon
