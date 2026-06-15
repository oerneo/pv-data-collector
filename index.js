import axios from 'axios';
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const api_url = process.env.API_URL;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  db: { schema: 'home'},
  realtime: {
    transport: ws,
  },
});

let { dataUser, errorUser } = await supabase.auth.signInWithPassword({
  email: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PW
});

let g_last_timestamp = 0;
let g_last_e_total = 0;
let g_last_p_grid = 0;
let g_last_p_load = 0;
let g_last_p_pv = 0;

async function fetchInsertData() {
    try {
        const result = await axios.get(api_url);
        let actual_delta = 0;

        if( result.data.Head.Status.Code === 0 ) {
          
          if(g_last_timestamp != 0 ) {
	    actual_delta = new Date(result.data.Head.Timestamp) - new Date(g_last_timestamp);
            actual_delta = actual_delta/3600000;
          }          

          const { db_error } = await supabase
          .from('pv-data')
          .insert({ timestamp: result.data.Head.Timestamp,
                    e_total: result.data.Body.Data.Site.E_Total,
                    p_grid: result.data.Body.Data.Site.P_Grid,
                    p_load: result.data.Body.Data.Site.P_Load,
                    p_pv: result.data.Body.Data.Site.P_PV,
                    rel_autom: result.data.Body.Data.Site.rel_Autonomy,
                    rel_selfcon: result.data.Body.Data.Site.rel_SelfConsumption,
                    delta: actual_delta,
                    e_delta: g_last_e_total - result.data.Body.Data.Site.E_Total,
                    p_grid_delta: g_last_p_grid * actual_delta,
                    p_load_delta: g_last_p_load * actual_delta,
                    p_pv_delta: g_last_p_pv * actual_delta
                  });

          g_last_timestamp = result.data.Head.Timestamp;
          g_last_e_total = result.data.Body.Data.Site.E_Total;
          g_last_p_grid = result.data.Body.Data.Site.P_Grid;
          g_last_p_load = result.data.Body.Data.Site.P_Load;
          g_last_p_pv = result.data.Body.Data.Site.P_PV;


          if( db_error ) {
            throw new Error("Database Insert Error: " + db_error.message);
          }
        }
        else {
          console.log("PV Status-Code: " + result.data.Head.Status.Code);  
        }
    } catch (error) {
       console.error("Error: ", error.message);
       throw error;  
    }
}

function myIntervalFunction() {
    const timestamp = new Date().toISOString();
    let errorIsActive = false;

    try {
      fetchInsertData();
    } catch (error) {
        console.error(`Error encountered: ${error.message}`);
        errorIsActive = true;
    } finally {
        if( !errorIsActive ) {
          setTimeout(myIntervalFunction, process.env.INTERVAL_MS);
        }
        else {
          console.log("Finished recursive loop script because of errors");
        }
    }
}

console.log("Starting recursive interval(" + process.env.INTERVAL_MS + " ms) loop script...");
myIntervalFunction();

