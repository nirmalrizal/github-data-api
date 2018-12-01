var express = require("express");
var axios = require("axios");
const csv = require("csvtojson");
var router = express.Router();

const provideAllUsersInfos = require("../utils/dataProvider")
  .provideAllUsersInfos;
const provideUserRepos = require("../utils/dataProvider").provideUserRepos;
const provideReposContents = require("../utils/dataProvider")
  .provideReposContents;

/* GET home page. */
router.get("/", async (req, res, next) => {
  const allUsersData = await provideAllUsersInfos();
  res.render("index", {
    allUsersData,
    usersData: JSON.stringify(allUsersData)
  });
});

router.get("/repos", async (req, res, next) => {
  const allUsersData = await provideAllUsersInfos();
  res.json(allUsersData);
});

router.get("/repos/:username", async (req, res, next) => {
  const userReposData = await provideUserRepos(req.params.username);
  res.json(userReposData);
});

router.get("/repos/contents/:username/:reponame*", async (req, res, next) => {
  const { username, reponame } = req.params;
  const fullName = username + "/" + reponame;
  const reposContents = await provideReposContents(fullName);
  res.json(reposContents);
  // res.json(req.params);
});

router.get("/csv-api", async (req, res, next) => {
  const filePath = "https://raw.githubusercontent.com/" + req.query.path;
  const csvText = await axios.get(filePath);
  const jsonArray = await csv().fromString(csvText.data);
  res.json(jsonArray);
});

module.exports = router;
