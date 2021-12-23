# Job-apispec
[![doks-staging](https://github.com/horizon-eve/job-apispec/actions/workflows/doks-staging.yml/badge.svg?branch=main)](https://github.com/horizon-eve/job-apispec/actions/workflows/doks-staging.yml)

API Spec refresh job based on restormjs: https://www.npmjs.com/package/restormjs

Generates restormjs api spec from postgres database objects. 
## Usage
`npx restorm-pg-spec [args]`
```
Arguments:
--db-user=     - pg login user
--db-passwd=   - pg login password
--db-host=     - pg server host
--db-port=     - pg server port (default 5432)
--db-conn=     - pg connection string format: postgres://user:password@host:5432/database
--db-name=     - pg database name
--db-schema=   - pg database schema (default public)
--output=      - Output file name. If empty, prints in stdout
--db-tables=   - Coma separated list of tables to include in spec. When empty, looks for all tables in the schema
--api-name=    - Name of API specification
--api-desc=    - Description for API specification
--api-version= - Version of api specification
--pub-role=    - Role that identifies publicly available database objects. If empty, uses db-user as a default
--auth-role=   - Role that identifies protected database objects. If a table granted to auth role, an autnentication will be required to access it
--help         - Prints usage
```
## Example
```
npx restorm-pg-spec --db-conn=postgres://restormjs:restormjs@localhost:5432/restormjs > api-spec.json
```
