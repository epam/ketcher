for pckg in ketcher-core ketcher-react ketcher-stanalone; do
  echo $pckg
  $(cd ./packages/$pckg && npm run build)
done

# cd ./example
# echo "\n\nBuilding example"
# npm run build

echo "\n\nDone"