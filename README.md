# pv-data-collector
raspberry Pi  project (node.js) to collect and send local fronius pv data to an online database for post processing

# .env file settings
API_URL=<fronius inverter local ip adress>/solar_api/v1/GetPowerFlowRealtimeData.fcgi
SUPABASE_URL=<your supabase url>
SUPABASE_KEY=<your supbase public key>
SUPABASE_USER=<your database login name>
SUPABASE_PW=<your database password>
INTERVAL_MS=<data fetching inteval in ms>
