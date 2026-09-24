#!/usr/bin/env bash

set -euo pipefail

REPORT_FILE=".scannerwork/report-task.txt"

if [[ ! -f "$REPORT_FILE" ]]; then
  echo "Sonar report task file not found: $REPORT_FILE"
  exit 0
fi

ce_task_url=$(grep '^ceTaskUrl=' "$REPORT_FILE" | cut -d'=' -f2-)
dashboard_url=$(grep '^dashboardUrl=' "$REPORT_FILE" | cut -d'=' -f2-)

if [[ -z "$ce_task_url" ]]; then
  echo "ceTaskUrl was not found in $REPORT_FILE"
  exit 0
fi

ce_task_json=$(curl -sSL -u "$SONAR_TOKEN:" "$ce_task_url")
if ! echo "$ce_task_json" | jq -e . >/dev/null 2>&1; then
  echo "Could not parse CE task response as JSON"
  echo "CE task URL: $ce_task_url"
  echo "Raw response:"
  echo "$ce_task_json"
  [[ -n "$dashboard_url" ]] && echo "Dashboard: $dashboard_url"
  exit 1
fi

analysis_id=$(echo "$ce_task_json" | jq -r '.task.analysisId // empty')
if [[ -z "$analysis_id" ]]; then
  echo "Could not resolve analysisId from CE task response"
  echo "CE task URL: $ce_task_url"
  [[ -n "$dashboard_url" ]] && echo "Dashboard: $dashboard_url"
  exit 1
fi

qg_json=$(curl -sSL -u "$SONAR_TOKEN:" "$SONAR_HOST_URL/api/qualitygates/project_status?analysisId=$analysis_id")
if ! echo "$qg_json" | jq -e . >/dev/null 2>&1; then
  echo "Could not parse Quality Gate response as JSON"
  echo "Raw response:"
  echo "$qg_json"
  [[ -n "$dashboard_url" ]] && echo "Dashboard: $dashboard_url"
  exit 1
fi

qg_status=$(echo "$qg_json" | jq -r '.projectStatus.status // "UNKNOWN"')

echo "Quality Gate status: $qg_status"

if [[ "$qg_status" == "ERROR" ]]; then
  echo "Failed Quality Gate conditions:"
  echo "$qg_json" | jq -r '(.projectStatus.conditions // [])[]
    | select(.status == "ERROR")
    | "- \(.metricKey): actual=\(.actualValue // "n/a"), threshold=\(.errorThreshold // "n/a"), comparator=\(.comparator // "n/a")"'

  has_duplication_error=$(echo "$qg_json" | jq -r 'any((.projectStatus.conditions // [])[]; .status == "ERROR" and .metricKey == "new_duplicated_lines_density")')
  if [[ "$has_duplication_error" == "true" ]]; then
    project_key=$(echo "$dashboard_url" | sed -n 's/.*[?&]id=\([^&]*\).*/\1/p')
    pull_request_key=$(echo "$dashboard_url" | sed -n 's/.*[?&]pullRequest=\([^&]*\).*/\1/p')

    if [[ -n "$project_key" && -n "$pull_request_key" ]]; then
      duplication_json=$(curl -sSL -u "$SONAR_TOKEN:" "$SONAR_HOST_URL/api/measures/component_tree?component=$project_key&pullRequest=$pull_request_key&metricKeys=new_duplicated_lines,new_duplicated_blocks,new_duplicated_lines_density&qualifiers=FIL&ps=500")
      if echo "$duplication_json" | jq -e . >/dev/null 2>&1; then
        duplication_files=$(echo "$duplication_json" | jq -r '
          (.components // [])[]
          | . as $c
          | {
              path: ($c.path // $c.name // $c.key),
              lines: (($c.measures // []) | map(select(.metric == "new_duplicated_lines") | .value | tonumber) | .[0] // 0),
              blocks: (($c.measures // []) | map(select(.metric == "new_duplicated_blocks") | .value | tonumber) | .[0] // 0),
              density: (($c.measures // []) | map(select(.metric == "new_duplicated_lines_density") | .value) | .[0] // "0")
            }
          | select(.lines > 0 or .blocks > 0)
          | "- \(.path): lines=\(.lines), blocks=\(.blocks), density=\(.density)%"')

        if [[ -n "$duplication_files" ]]; then
          echo "Files with new duplication in this PR:"
          echo "$duplication_files"
        else
          echo "No per-file duplication entries were returned by Sonar API for this PR snapshot."
        fi
      else
        echo "Could not parse duplication details response as JSON"
      fi
    else
      echo "Could not derive project key or pull request key from dashboard URL for duplication details lookup."
    fi
  fi

  [[ -n "$dashboard_url" ]] && echo "Dashboard: $dashboard_url"
  exit 1
fi
