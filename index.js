const path = require("path")
const forever = require("forever-monitor")

class MeshbluConnectorDaemon {
  constructor({ type, uuid, token, domain }) {
    this.type = type
    this.uuid = uuid
    this.token = token
    this.domain = domain
  }

  create() {
    const connectorPath = path.resolve(path.join("..", this.type))
    const cmd = path.join(connectorPath, this.type)
    const child = new forever.Monitor(cmd, {
      max: 3,
      silent: true,
      env: {
        MESHBLU_UUID: this.uuid,
        MESHBLU_TOKEN: this.token,
        MESHBLU_DOMAIN: this.domain,
      },
      cwd: connectorPath,
    })

    this.child = child
    return child
  }

  start() {
    this.child.start()
  }

  stop() {
    this.child.stop()
  }
}

module.exports.MeshbluConnectorDaemon = MeshbluConnectorDaemon
