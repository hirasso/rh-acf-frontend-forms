const fs = require('fs');
const child = require('child_process');
const argv = require('minimist')(process.argv.slice(2));

const blacklist = ['Merge branch ', 'prepare-commit-msg', 'pre-commit-msg'];

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

function getCommitsArray() {
  const delimiter = "----DELIMITER----";
  // https://git-scm.com/docs/pretty-formats
  const output = child.execSync(`git log --pretty=format:'%B%H\n%ad${delimiter}'`).toString('utf-8');
  
  const commitsArray = output.split(`${delimiter}\n`).map(commit => {
    const [message, hash, date] = commit.split('\n');
    return { hash, message, date };
  }).filter(commit => Boolean(commit.hash));
  return commitsArray;
}

/**
 * 
 * @param {string} file 
 * @param {string} commit 
 */
function fileExistsInCommit(file, hash) {
  try { child.execSync(`git cat-file -e ${hash}:${file} > /dev/null 2>&1`); return true; } catch(e) { return false; }
}

/**
 * Get the main plugin file from a certain commit
 * 
 * @param {string} hash 
 */
function getPluginFileInCommit(hash) {
  let pluginFiles = ['rh-acf-frontend-forms.php', 'rah-acf-frontend-forms.php'];
  for( const file of pluginFiles ) {
    if( fileExistsInCommit(file, hash) ) {
      return child.execSync(`git show ${hash}:${file}`);
    }
  }
  return false;
}

/**
 * Generate the changelog
 */
async function generateChangelog() {
  
  let changelog = {};
  const commitsArray = getCommitsArray();
  // Deactivated this, would only make sense in git hook 'prepare-commit-message', 
  // but message is generated after commit
  // changelog = await addCurrentCommitToChangelog(changelog);
  let lastCommit = null;
  for( const commit of Object.values(commitsArray) ) {
    // continue;
    let pluginFile = getPluginFileInCommit(commit.hash);
    if( !pluginFile ) continue;
    pluginFile = pluginFile.toString('utf-8');
    if( lastCommit && lastCommit.message === commit.message ) continue;
    lastCommit = commit;
    let date = new Date(commit.date).toISOString().split('T')[0];
    let shortHash = commit.hash.substr(0,7);
    let message = `${commit.message} (#${shortHash})`;
    changelog = addCommitMessageToChangelog( getPluginVersion( pluginFile ), message, changelog, date );
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
    file += `#### ${version} (${versionInfo.date})\n\n`;
    for( const change of versionInfo.messages ) {
      file += `- ${change}\n`;
    }
    file += `\n`;
  }
  fs.writeFileSync('./changelog.md', file);
  child.execSync('git add ./changelog.md');
}

generateChangelog().then(changelog => writeChangelog(changelog));
