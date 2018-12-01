require("dotenv").config();
const axios = require("axios");

const apiUrlSuffix = "https://api.github.com";
const githubAuthObj = {
  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET
};

const fetchUserInfo = async username => {
  return axios.get(`${apiUrlSuffix}/users/${username}`, {
    params: { ...githubAuthObj }
  });
};

const fetchUserRepos = async username => {
  return axios.get(`${apiUrlSuffix}/users/${username}/repos`, {
    params: { ...githubAuthObj }
  });
};

const fetchRepoRootContents = async (repofullname, extraParam) => {
  const extraUrl = extraParam ? extraParam : "";
  return axios.get(
    `${apiUrlSuffix}/repos/${repofullname}/contents/` + extraUrl,
    {
      params: { ...githubAuthObj }
    }
  );
};

module.exports = {
  fetchUserInfo,
  fetchUserRepos,
  fetchRepoRootContents
};
