const axios = require('axios');
require('dotenv').config();

const getAvailableAgent = async () => {
  try {
    const response = await axios.get("http://154.38.168.35:8080/crm/queue/next", {
      headers: { "x-api-key": "Baladi-Express-CRM_API-keysdf443w>%45<rt4t*1sd1!fd@1s#c23%445" },
    });
    return {
      agentId: response.data.agentId || null,
      agentName: response.data.username || null,
    };
  } catch (error) {
    console.error("Error fetching agent:", error);
    return { agentId: null, agentName: null };
  }
};

module.exports = { getAvailableAgent };