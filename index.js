const { Client } = require('pg')
const { exec } = require('child_process');
const fs = require('fs')

const kind = process.argv[2]
const path = process.argv[3]
const host = process.argv[4]
const port = process.argv[5]
const database = process.argv[6]
const user = process.argv[7]
const password = process.argv[8]

const handler = {
  api: {
    get: function (client, ready) {
      client.query("SELECT name FROM public.migrations WHERE name like '%api/%' order by run_on desc limit 1", (err, res) => {
        if (err || res.rows.length !== 1) {
          console.error(`error fetching migrations`)
          process.exit(1)
        }
        const version = res.rows[0].name.replace(/api\//gi, '')
        const schema = 'api'
        const name = 'Racopub API'
        const desc = `Racopub API v${version}`
        const filename = `spec-api-${version}.json`;
        ready(version, schema, name, desc, filename)
      })
    }
  },
  esi: {
    get: function (client, ready) {
      const schema = process.env.ESI_CACHE_SCHEMA
      if (!schema) {
        log.error ('esi schema required as env variable ESI_CACHE_SCHEMA')
        process.exit(-1)
      }
      client.query(`SELECT version, description FROM ${schema}.swagger_mapping`, (err, res) => {
        if (err || res.rows.length !== 1) {
          console.error(`error fetching swagger_mapping`)
          process.exit(1)
        }
        const version = res.rows[0].version
        const name = `Racopub ESI API aligned with EVE v${version}`
        const desc = `Racopub ESI API based on ${res.rows[0].description} v${version}`
        const filename = `spec-esi-${schema}.json`;
        ready(version, schema, name, desc, filename)
      })
    }
  },
  sde: {
    get: function (client, ready) {
      const schema = 'evesde'

      client.query(`SELECT md5 FROM public.evesde_upgrade_history order by upgraded limit 1`, (err, res) => {
        if (err || res.rows.length !== 1) {
          console.error(`error fetching migrations: ${err}`)
          process.exit(1)
        }
        const version = res.rows[0].md5.replace(/\s.*$/gi, '')
        const name = `Racopub EVESDE API aligned with EVE v${version}`
        const desc = `Racopub EVESDE API based on ${res.rows[0].md5}`
        const filename = `spec-sde-${version}.json`;
        ready(version, schema, name, desc, filename)
      })
    }
  }

}

const cmd = (command) => {
  const proc = exec(command)

  proc.stdout.on('data', (data) => {
    console.log(data)
  })

  proc.stderr.on('data', (data) => {
    console.log(data)
  })

  proc.on('exit', (code) => {
    process.exit(code)
  })
}

const client = new Client({
  host: host,
  port: port,
  database: database,
  user: user,
  password: password,
  application_name: `job-apispec:${kind}`
})

client.connect()
console.log(`running api spec refresh for: ${kind}`)

handler[kind].get(client, function (version, schema, name, desc, filename) {
  const file = `${path}/${filename}`
  if (fs.existsSync(file)) {
    console.log(`${kind} already has latest spec version ${version}, skipping refresh.`)
    process.exit(0)
  } else {
    const args = `--db-user=${user} --db-passwd=${password} --db-host=${host} --db-port=${port} --db-name=${database} --db-schema=${schema} --pub-role=api --auth-role=authenticated --output=${file} --api-name="${name}" --api-desc="${desc}" --api-version=${version}`
    const command = `node node_modules/restormjs/bin/pg2api.js ${args}`
    cmd(command)
  }
})
