#!/usr/bin/osascript

# parameter $1: path to deploy to


name=${PWD##*/}
# - creates subfolder with all the files of CWD
echo -e "\e[38;5;49mcreating tmp dir...";
rsync -q -av --progress --exclude-from=.deploy/exclude.lst . ./tmp;
# - zips the subfolder
echo -e "\e[38;5;49mcreating zip from tmp dir..."; 
zip -r -q $name.zip ./tmp;
# - uploads it to the path provided
echo -e "\e[38;5;49muploading to server..."; 
scp -r $name.zip $1;
# - deletes the subfolder and the .zip
echo -e "\e[38;5;49mdeleting .zip and tmp dir..."; 
rm -rf $name.zip ./tmp;
# - echoes success message
echo -e "👏  \e[38;5;49msuccessfully deployed to \e[38;5;169m$1\e[0m";
