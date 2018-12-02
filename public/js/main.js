$(document).ready(function() {
  var users = window.__users__;
  users.forEach(function(user) {
    fetchUserRepos(user.username);
  });
});

function fetchUserRepos(username) {
  $.ajax({
    method: "GET",
    url: "/repos/" + username,
    contentType: "application/json",
    success: function(repos) {
      populateUserRepos(username, repos);
    }
  });
}

function populateUserRepos(username, repos) {
  var reposList = "";
  repos.forEach(function(repo) {
    reposList +=
      "<li>" +
      "<span>" +
      '<a data-toggle="collapse" href="#' +
      username +
      "-repo-" +
      repo.name +
      '"' +
      'aria-expanded="false" aria-controls="' +
      username +
      "-repo-" +
      repo.name +
      '"><i class="collapsed"><i class="fas fa-folder"></i></i>' +
      '<i class="expanded"><i class="far fa-folder-open"></i></i> ' +
      repo.name +
      "</a></span>" +
      "<ul>" +
      '<div id="' +
      username +
      "-repo-" +
      repo.name +
      '" class="collapse"><ul>' +
      '<li><span><i class="fa fa-spinner fa-spin"></i><a href="javascript:void(0)"> Loading ' +
      repo.name +
      " contents</a></span></li>" +
      "</ul></div>" +
      "</ul>" +
      "</li>";
  });
  $("#user-" + username)
    .find("ul")
    .html(reposList);

  fetchRepoContents(username, repos);
}

function fetchRepoContents(username, repos) {
  repos.forEach(function(repo) {
    $.ajax({
      method: "GET",
      url: "/repos/contents/" + repo.full_name,
      contentType: "application/json",
      success: function(contents) {
        const populateSel = username + "-repo-" + repo.name;
        const repoContentHtml = populateRepoContents(populateSel, contents);
        $("#" + populateSel).html("<ul>" + repoContentHtml + "</ul>");
        new ClipboardJS(".btn");
      }
    });
  });
}

function populateRepoContents(populateSel, contents) {
  var repoContentHtml = "";
  for (var i = 0; i < contents.length; i += 1) {
    const content = contents[i];
    if (content.type === "file") {
      const csvApiUrl =
        window.location.origin +
        "/csv-api?path=" +
        content.url.replace("https://raw.githubusercontent.com/", "");
      repoContentHtml += `
      <li>
        <span class="file-wrap">
          <i class="far fa-file"></i>
          <a href="${content.url}" target="_blank" rel="noreferrer">
            ${content.name}
          </a>
          <a class="float-right btn btn-sm btn-secondary copy-link"
          data-placement="top"
          title="Copied"
          data-clipboard-text="${csvApiUrl}"><i class="fa fa-link"></i> Copy API link</a>
        </span>
      </li>`;
    }
    if (content.type === "dir") {
      var newPopSel = populateSel + "-" + content.sha;
      repoContentHtml += `
      <li>
        <span>
          <a data-toggle="collapse" href="#${newPopSel}" aria-expanded="false" aria-controls="${newPopSel}">
          <i class="collapsed">
            <i class="fas fa-folder">
            </i>
          </i>
          <i class="expanded">
            <i class="far fa-folder-open">
            </i>
          </i> 
          ${content.name}
          </a>
        </span>
          ${
            content.child.length === 0
              ? ""
              : `<ul>
                <div id="${newPopSel}" class="collapse">
                  ${populateRepoContents(newPopSel, content.child)}
                </div>
              </ul>`
          }
      </li>`;
    }
  }
  return repoContentHtml;
}

function trimNameAndMakeUrl(name) {
  var tempArr = name.trim().split(" ");
  tempArr = tempArr.filter(function(a) {
    return a.trim() != "";
  });
  return tempArr.join("-");
}

$(document).on("click", ".copy-link", function() {
  var $this = $(this);
  $this.tooltip("show");
  setTimeout(function() {
    $this.tooltip("dispose");
  }, 1000);
});
