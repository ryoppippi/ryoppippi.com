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
#   ./fetch-star-history.nu --extra [15000]    # also sample exactly 15000
#   ./fetch-star-history.nu --repo owner/name

const PER_PAGE = 100

# The chart and the timeline table both work in whole days, and the minute a
# star landed is noise at that scale, so a reading counts for the day it
# happened. Without this, a row dated 5/29 reads the count as of some arbitrary
# hour and can land below a milestone the day had already passed.
def end-of-day [at: string]: nothing -> string {
    $"($at | str substring 0..<10)T23:59:59Z"
}

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

def sample [repo: string, total: int, every: int, extra: list<int>]: nothing -> table {
    if ($every mod $PER_PAGE) != 0 {
        error make {msg: $"--every must be a multiple of ($PER_PAGE)"}
    }
    let step = $every // $PER_PAGE

    let last_page = $total // $PER_PAGE
    let periodic = 1..$last_page | where {|page| ($page - 1) mod $step == 0 }
    # Without the final page the series stops short of the current count.
    let pages = if ($last_page > 0) and ($last_page not-in $periodic) {
        $periodic | append $last_page
    } else {
        $periodic
    }
    # A count a milestone row quotes needs its own page. The periodic grid steps
    # in `every`-sized offsets from 100, so a round number like 15000 otherwise
    # falls between two samples and is only ever interpolated.
    let requested = $extra
    | each {|stars|
        if ($stars mod $PER_PAGE) != 0 {
            error make {msg: $"extra star counts must be multiples of ($PER_PAGE), got ($stars)"}
        }
        $stars // $PER_PAGE
    }
    | where {|page| $page <= $last_page }

    $pages
    | append $requested
    | uniq
    | sort
    | each {|page|
        let at = starred-at $repo $page
        if ($at | is-empty) or $at == 'null' {
            null
        } else {
            {stars: ($page * $PER_PAGE), date: (end-of-day $at)}
        }
    }
    | compact
}

# Regenerates the star history JSON consumed by the chart.
def main [
    --repo: string = 'ccusage/ccusage' # repository to sample
    --every: int = 500 # sample interval in stars
    --extra: list<int> = [] # star counts to sample exactly, merged with those already in the output
    --submitted: string = '2026-04-20' # submission date, kept in the output
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

    let previous = if ($target | path exists) { open $target } else { {} }
    # Kept in the output so a plain re-run kicks out the same milestone samples.
    let extras = ($previous.extraStars? | default [] | append $extra | uniq | sort)

    let total = repo-total $repo
    print $"($repo): ($total) stars, sampling every ($every)"

    let samples = sample $repo $total $every $extras

    {
        createdAt: (repo-created $repo)
        submittedAt: (end-of-day $submitted)
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
        extraStars: $extras
        samples: $samples
    }
    | to json --indent 2
    | save --force $target

    print $"wrote ($samples | length) samples to ($target)"
}
