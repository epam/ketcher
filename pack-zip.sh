#!/bin/sh

name=$1

if [ -z $name ]; then
  echo "specify name";
  exit;
fi

rm -rf ./$name 

mkdir $name
cp -r LICENSE.GPL LICENSE.GPL base64.js chem/ favicon.ico ketcher.py ketcher.css ketcher.html demo.html ketcher.js loading.gif png/ prototype-min.js raphael-min.js raphael.js rnd/ ui/ util/ reaxys/ $name/

zip -r -9 $name.zip $name

rm -rf ./$name 

