const path = require("path")
const PM2 = require("pm2-custom")

class MeshbluConnectorDaemon {
  constructor({ type, uuid, token, domain, connectorsPath, pm2Home }) {
    this.type = type
    this.uuid = uuid
    this.token = token
    this.domain = domain
    this.connectorsPath = connectorsPath
    this.pm2Home = pm2Home
    this.pm2 = new PM2({ pm2_home: this.pm2Home })
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.pm2.connect(false, error => {
        if (error) return reject(error)
        return resolve()
      })
    })
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.pm2.disconnect(error => {
        if (error) return reject(error)
        return resolve()
      })
    })
  }

  start() {
    const connectorPath = path.resolve(path.join(this.connectorsPath, this.type))
    return this.connect().then(() => this.pm2_start({ connectorPath })).then(() => this.disconnect())
  }

  pm2_start({ connectorPath }) {
    return new Promise((resolve, reject) => {
      const cmd = path.join(connectorPath, this.type)
      this.pm2.start(
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
            MESHBLU_RESOLVE_SRV: true,
            DEBUG: process.env.DEBUG,
          },
        },
        (error, proc) => {
          if (error) return reject(error)
          this.proc = proc
          return resolve(proc)
        }
      )
    })
  }
}

module.exports.MeshbluConnectorDaemon = MeshbluConnectorDaemon
