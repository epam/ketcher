#!/bin/sh

name=$1

if [ -z $name ]; then
  echo "specify name";
  exit;
fi

rm -rf ./$name 

mkdir $name
cp -r LICENSE.GPL LICENSE.GPL base64.js chem/ favicon.ico ketcher.py ketcher.css ketcher.html demo.html ketcher.js loading.gif icons/ prototype-min.js raphael.js rnd/ ui/ util/ reaxys/ third_party/ templates.sdf $name/

zip -r -9 $name.zip $name

rm -rf ./$name 

