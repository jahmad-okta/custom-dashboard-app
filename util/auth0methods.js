const axios = require("axios");

async function getAccountToken() {
  var options = {
    method: "POST",
    url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/oauth/token`,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      client_id: process.env.AUTH0_API_CLIENT_ID,
      client_secret: process.env.AUTH0_API_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/`,
      grant_type: "client_credentials",
    },
  };
  var results = await axios(options);
  return ({ token_type, access_token, scope } = results.data);
}

exports.createClient = async function (
  access_token,
  client_name,
  client_metadata,
  user_sub
) {
  let config = {
    method: "post",
    url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/clients`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: {
      name: client_name,
      client_metadata,
      grant_types: ["client_credentials"],
      app_type: "non_interactive",
    },
  };

  const { status, data } = await axios(config);
  return { status, data };
};

exports.attachClentGrants = async function (
  access_token,
  client_id,
  audience,
  scope
) {
  let config = {
    method: "post",
    url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/client-grants`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: {
      client_id,
      audience,
      scope,
    },
  };

  const { status, data } = await axios(config);
  return { status, data };
};

exports.updateUser = async function (access_token, clientInfo, userInfo) {
  //add client info to user's metadata
  var listOfClients;
  if (userInfo.listOfClients === null) {
    listOfClients = [
      { name: clientInfo.name, client_id: clientInfo.client_id },
    ];
  } else {
    listOfClients = userInfo.listOfClients;
    listOfClients = [
      ...listOfClients,
      { name: clientInfo.name, client_id: clientInfo.client_id },
    ];
  }
  let app_metadata = {
    listOfClients,
  };
  let config = {
    method: "patch",
    url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/users/${userInfo.sub}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: {
      app_metadata,
    },
  };

  const { status, data } = await axios(config);
  //console.log(data);
  return { status, data };
};

exports.updateListOfClients = async function (
  access_token,
  client_id,
  userInfo
) {
  var listOfClients;
  if (userInfo.listOfClients !== null) {
    listOfClients = userInfo.listOfClients;
    var index = listOfClients.findIndex((d) => d.client_id === client_id);
    listOfClients.splice(index, 1);

    let app_metadata = {
      listOfClients,
    };

    let config = {
      method: "patch",
      url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/users/${userInfo.sub}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + access_token,
      },
      data: {
        app_metadata,
      },
    };

    const { status, data } = await axios(config);
    return { status, data };
  }
};

exports.deleteClient = async function (access_token, client_id) {
  let config = {
    method: "delete",
    url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/clients/${client_id}`,
    headers: {
      Authorization: "Bearer " + access_token,
    },
  };

  const { status, data } = await axios(config);
  return { status, data };
};

exports.updateUserProfile = async function (data, sub) {
  const { token_type, access_token, scope } = await getAccountToken();
  let config = {
    method: "PATCH",
    url: "https://" + process.env.AUTH0_ISSUER_DOMAIN + "/api/v2/users/" + sub,
    headers: { authorization: "Bearer " + access_token },
    data,
  };

  const { status, message } = await axios(config);
  return { status, message };
};

exports.getUserProfile = async function (userInfo) {
  const { token_type, access_token, scope } = await getAccountToken();

  var options = {
    method: "get",
    url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/users/${userInfo.sub}`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };

  var response = await axios(options);
  if (response.status === 200) {
    const profileData = response.data.identities[1].profileData;

    let input = {
      given_name: profileData.given_name,
      family_name: profileData.family_name,
      picture: profileData.picture,
      app_metadata: {
        linked_providers: [`${response.data.identities[1].provider}`],
      },
    };
    return { status: 200, message: input };
  }
};
