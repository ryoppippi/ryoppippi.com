#!/usr/bin/env nix
#! nix shell --inputs-from . nixpkgs#nushell nixpkgs#gh --command nu

# Refresh the GitHub star snapshot consumed by the static OSS page.

const list_path = 'src/contents/works/oss/list.json'
const stars_path = 'src/contents/works/oss/stars.json'
const star_owner = 'ryoppippi'

def is-owned-repository [repository: string]: nothing -> bool {
    $repository | str starts-with $"($star_owner)/"
}

def github-repository [project: record]: nothing -> string {
    let link = (
        $project
        | get --optional link
        | default $"https://github.com/ryoppippi/($project.name)"
    )
    let matches = $link | parse --regex 'github\.com/(?<owner>[^/]+)/(?<repo>[^/?#]+)'
    if ($matches | is-empty) {
        error make {msg: $"Cannot determine the GitHub repository for ($project.name): ($link)"}
    }
    let repository = $matches.0.repo | str replace --regex '\.git$' ''
    $"($matches.0.owner)/($repository)"
}

def fetch-star-count [repository: string]: nothing -> int {
    ^gh api $"repos/($repository)" --jq '.stargazers_count'
    | str trim
    | into int
}

def fetch-project [project: record]: nothing -> record<repo: string, stars: int> {
    let repo = github-repository $project
    let stars = fetch-star-count $repo
    print $"($repo): ($stars) stars"
    {repo: $repo, stars: $stars}
}

def snapshot-timestamp []: nothing -> string {
    date now | date to-timezone UTC | format date '%Y-%m-%dT%H:%M:%SZ'
}

def main []: nothing -> nothing {
    let projects = open $list_path
    let latest = (
        $projects
        | where {|project| is-owned-repository (github-repository $project)}
        | par-each {|project| fetch-project $project}
        | sort-by repo
    )
    let previous = if ($stars_path | path exists) {
        open $stars_path
    } else {
        {
            updatedAt: ''
            projects: []
        }
    }
    let previous_projects = $previous | get --optional projects | default []

    if $latest == $previous_projects {
        print 'GitHub star counts are already up to date.'
    } else {
        {
            updatedAt: (snapshot-timestamp)
            projects: $latest
        }
        | to json --indent 2
        | save --force $stars_path
        print $"Updated ($latest | length) GitHub star counts."
    }
}
