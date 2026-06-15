import axios from 'axios';

const api_url = process.env.API_URL;

async function fetchData() {
    try {
        const result = await axios.get(api_url);
        console.log("Data fetched sucessfully! Data:", result.data);

        if( result.data.Head.Status.Code === 0 ) {
          console.log("Write database entry!");
        }
        else {
          consolte.log("Data Status-Code: " + result.data.Head.Status.Code);  
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}


fetchData();
