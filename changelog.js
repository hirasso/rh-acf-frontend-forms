const fs = require('fs');
const simpleGit = require('simple-git/promise')('.');
const argv = require('minimist')(process.argv.slice(2));

const blacklist = ['Merge branch '];

/**
 * Adds the current commit message to the current plugin version
 * @param {Object} changelog 
 */
function addCurrentCommitToChangelog(changelog) {
  return new Promise((resolve, reject) => {
    const pluginFile = fs.readFileSync('./rh-acf-frontend-forms.php', 'utf-8');
    let message = fs.readFileSync('./.git/COMMIT_EDITMSG', 'utf-8');
    message = message.replace(/\r?\n|\r/g, "");
    changelog = addCommitMessageToChangelog( getPluginVersion( pluginFile ), message, changelog );
    resolve(changelog);
  })
}

/**
 * Get the plugin version from a file
 * @param {String} pluginFile 
 */
function getPluginVersion( pluginFile ) {
  return String(pluginFile).match(/^ \* Version: ([0-9|.].*)/m)[1]
}

/**
 * Add a commit message to the changelog
 * 
 * @param {string} pluginVersion 
 * @param {string} message 
 * @param {object} changelog 
 */
function addCommitMessageToChangelog( pluginVersion, message, changelog = {}, date = null ) {
  if( isMessageBlacklisted(message) ) return changelog;
  if( !changelog[pluginVersion] ) changelog[pluginVersion] = {
    date: date,
    messages: []
  };
  changelog[pluginVersion].messages.push( message );
  return changelog;
}

/**
 * Check if a message is in the blacklist
 * @param {string} message 
 */
function isMessageBlacklisted(message) {
  for( const substring of blacklist ) {
    if( message.indexOf(substring) !== -1 ) return true;
  }
  return false;
}

/**
 * Generate the changelog
 */
async function generateChangelog() {
  const gitLog = await simpleGit.log();
  
  let changelog = {};

  // Deactivated this, would only make sense in git hook 'prepare-commit-message', 
  // but message is generated after commit
  // changelog = await addCurrentCommitToChangelog(changelog);

  for( const commit of Object.values(gitLog.all) ) {
    // continue;
    let pluginFile = false;
    try { pluginFile = await simpleGit.show(`${commit.hash}:rh-acf-frontend-forms.php`) } catch(e) {
      try { pluginFile = await simpleGit.show(`${commit.hash}:rah-acf-frontend-forms.php`) } catch(e) {}
    }
    if( !pluginFile ) continue;
    let date = commit.date.substr(0, commit.date.indexOf('T'));
    let shortHash = commit.hash.substr(0,7);
    let message = `${commit.message} (#${shortHash})`;
    changelog = addCommitMessageToChangelog( getPluginVersion( pluginFile ), message, changelog, date )
  }
  return changelog;
}

/**
 * Write the changelog
 * @param {object} changelog 
 */
async function writeChangelog( changelog ) {
  let file = '';
  for( const [version, versionInfo] of Object.entries(changelog) ) {
    file += `#### ${version} – ${versionInfo.date}\n\n`;
    for( const change of versionInfo.messages ) {
      file += `- ${change}\n`;
    }
    file += `\n`;
  }
  fs.writeFileSync('./changelog.md', file);
  await simpleGit.add('./changelog.md');
}
generateChangelog().then(changelog => writeChangelog(changelog));