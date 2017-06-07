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

  connect() {
    return new Promise((resolve, reject) => {
      pm2.connect(false, error => {
        if (error) return reject(error)
        resolve()
      })
    })
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      pm2.disconnect(error => {
        if (error) return reject(error)
        resolve()
      })
    })
  }

  start() {
    const connectorPath = path.resolve(path.join(this.connectorsPath, this.type))
    return this.connect()
      .then(() => {
        return this.pm2_start({ connectorPath })
      })
      .then(() => {
        return this.disconnect()
      })
  }

  pm2_start({ connectorPath }) {
    return new Promise((resolve, reject) => {
      const cmd = path.join(connectorPath, this.type)
      pm2.start(
        {
          name: `${this.type}-${this.uuid}`,
          script: cmd,
          cwd: connectorPath,
          restart_delay: 5000,
          interpreter: "none",
          force: true,
          max_restarts: Infinity,
          env: {
            MESHBLU_UUID: this.uuid,
            MESHBLU_TOKEN: this.token,
            MESHBLU_DOMAIN: this.domain,
          },
        },
        (error, proc) => {
          if (error) return reject(error)
          this.proc = proc
          resolve(proc)
        }
      )
    })
  }
}

module.exports.MeshbluConnectorDaemon = MeshbluConnectorDaemon
