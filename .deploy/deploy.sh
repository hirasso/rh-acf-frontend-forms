# parameter $1: remote SSH path

name=${PWD##*/}
green='\e[38;5;49m'
gold='\e[38;5;220m'
nocolor='\e[0m'
# - creates subfolder with all the files of CWD
echo -e "${green}creating tmp dir...";
rsync -q -av --progress --exclude-from=.deploy/exclude.lst . $name;
# - zips the subfolder
echo -e "creating zip from tmp dir..."; 
zip -r -q $name.zip $name;
# - uploads it to the path provided
echo -e "uploading to server...${nocolor}"; 
scp -r $name.zip $1;
# - deletes the subfolder and the .zip
echo -e "${green}deleting .zip and tmp dir..."; 
rm -rf $name.zip $name;
# - echoes success message
echo -e "👏  successfully deployed to ${gold}$1";
