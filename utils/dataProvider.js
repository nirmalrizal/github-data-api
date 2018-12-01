const fetchUserRepos = require("../utils/api").fetchUserRepos;
const fetchUserInfo = require("../utils/api").fetchUserInfo;
const fetchRepoRootContents = require("../utils/api").fetchRepoRootContents;

const users = [
  {
    username: "opennepal",
    name: "Open Nepal"
  }
];

const provideAllUsersInfos = async () => {
  const finalData = {};
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    const username = user.username;

    try {
      const fetchResp = await fetchUserInfo(username);
      if (fetchResp.status === 200) {
        const userReposData = fetchResp.data;
        finalData[username] = {
          ...user,
          public_repos: userReposData.public_repos
        };
      }
    } catch (err) {
      console.log(err);
      console.log(`Error on fetching info of user : ${username}`);
    }
  }
  const userRepoArr = Object.entries(finalData).reduce((a, b) => {
    a.push(b[1]);
    return a;
  }, []);
  return userRepoArr;
};

const provideUserRepos = async username => {
  let finalData = [];
  try {
    const fetchResp = await fetchUserRepos(username);
    if (fetchResp.status === 200) {
      finalData = fetchResp.data.map(repo => {
        return { name: repo.name, full_name: repo.full_name };
      });
    }
  } catch (err) {
    // console.log(err);
    console.log(`Error on fetching contens of user : ${username}`);
  }
  return finalData;
};

const provideReposContents = async (fullName, extraParam) => {
  let finalData = [];
  try {
    const contentResp = await fetchRepoRootContents(fullName, extraParam);
    if (
      (contentResp.status === 200 || contentResp.status === 304) &&
      contentResp.data
    ) {
      for (let i = 0; i < contentResp.data.length; i += 1) {
        const content = contentResp.data[i];
        if (content.type === "file") {
          const fileNameArr = content.name.split(".");
          if (fileNameArr[fileNameArr.length - 1] === "csv") {
            finalData.push({
              name: content.name,
              path: content.path,
              type: "file",
              url: content.download_url,
              sha: content.sha
            });
          }
        }
        if (content.type === "dir") {
          const child = await provideReposContents(fullName, content.name);
          finalData.push({
            name: content.name,
            path: content.path,
            type: "dir",
            child: child,
            sha: content.sha
          });
        }
      }
    }
  } catch (err) {
    // console.log(err);
    console.log(
      `Error on fetching contents of repo : ${fullName}  <--->  ${extraParam}`
    );
  }
  return finalData;
};

module.exports = {
  provideAllUsersInfos,
  provideUserRepos,
  provideReposContents
};
