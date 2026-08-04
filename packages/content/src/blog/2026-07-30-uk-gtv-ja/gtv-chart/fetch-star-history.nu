#!/usr/bin/env nix
#! nix shell --inputs-from . nixpkgs#nushell nixpkgs#gh --command nu
# Regenerates star-history.json from the GitHub stargazers API.
#
# The API returns stargazers in the order they starred, 100 per page, so page N
# ends at star number N*100. Sampling every few pages therefore gives "the count
# reached this number at this time" without walking all 17k+ entries.
#
# Requires an authenticated `gh` (the unauthenticated rate limit will not survive
# the number of requests this makes).
#
# Usage:
#   ./fetch-star-history.nu                    # every 500 stars
#   ./fetch-star-history.nu --every 200        # denser sampling, more requests
#   ./fetch-star-history.nu --repo owner/name

const PER_PAGE = 100

def script-dir []: nothing -> string {
    $env.CURRENT_FILE | path dirname
}

def repo-total [repo: string]: nothing -> int {
    ^gh api $"repos/($repo)" --jq '.stargazers_count' | into int
}

def repo-created [repo: string]: nothing -> string {
    ^gh api $"repos/($repo)" --jq '.created_at'
}

# When the star count reached page * PER_PAGE, or null past the end.
def starred-at [repo: string, page: int]: nothing -> string {
    let path = $"repos/($repo)/stargazers?per_page=($PER_PAGE)&page=($page)"
    ^gh api -H 'Accept: application/vnd.github.star+json' $path --jq '.[-1].starred_at' | str trim
}

def sample [repo: string, total: int, every: int]: nothing -> table {
    let step = $every // $PER_PAGE
    if $step < 1 {
        error make {msg: $"--every must be at least ($PER_PAGE)"}
    }

    1..(($total // $PER_PAGE))
    | where {|page| ($page - 1) mod $step == 0 }
    | each {|page|
        let at = starred-at $repo $page
        if ($at | is-empty) or $at == 'null' {
            null
        } else {
            {stars: ($page * $PER_PAGE), date: $at}
        }
    }
    | compact
}

# Regenerates the star history JSON consumed by the chart.
def main [
    --repo: string = 'ccusage/ccusage' # repository to sample
    --every: int = 500 # sample interval in stars
    --submitted: string = '2026-04-16' # submission date, kept in the output
    --out: string = '' # output path, defaults to star-history.json beside this script
]: nothing -> nothing {
    let target = if ($out | is-empty) {
        [
            (script-dir)
            'star-history.json'
        ] | path join
    } else {
        $out
    }

    let total = repo-total $repo
    print $"($repo): ($total) stars, sampling every ($every)"

    let samples = sample $repo $total $every
    let previous = if ($target | path exists) { open $target } else { {} }

    {
        createdAt: (repo-created $repo)
        submittedAt: $submitted
        axisMaxK: ($previous.axisMaxK? | default 18)
        axisTicksK: ($previous.axisTicksK? | default [
            0
            2
            4
            6
            8
            10
            12
            14
            16
            18
        ])
        samples: $samples
    }
    | to json --indent 2
    | save --force $target

    print $"wrote ($samples | length) samples to ($target)"
}
