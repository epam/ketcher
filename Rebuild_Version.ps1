rm packages/ketcher-core/dist -r -force
rm packages/ketcher-macromolecules/dist -r -force
rm packages/ketcher-react/dist -r -force
rm packages/ketcher-standalone/dist -r -force
npm i
npm run build
cd .\ketcher-autotests\
npm run docker:build
cd ..
$wshell = New-Object -ComObject Wscript.Shell
$Output = $wshell.Popup("Build is ready")
npm run serve