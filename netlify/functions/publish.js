const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN;
  const owner = "tenoneten";
  const repo = "phrf-race-results";
  const path = "results.json";
  const branch = "main";

  if (!token) {
    return {
      statusCode: 500,
      body: "Missing GitHub token",
    };
  }

  const octokit = new Octokit({ auth: token });

  let content;
  try {
    content = JSON.stringify(JSON.parse(event.body), null, 2);
  } catch (err) {
    return {
      statusCode: 400,
      body: "Invalid input JSON",
    };
  }

  try {
    const { data: { sha } } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Publish race results",
      content: Buffer.from(content).toString("base64"),
      sha,
      branch,
    });

    return {
      statusCode: 200,
      body: "Results published",
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `GitHub error: ${err.message}`,
    };
  }
};
