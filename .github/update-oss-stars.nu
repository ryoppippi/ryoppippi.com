#!/usr/bin/env nix
#! nix shell --inputs-from . nixpkgs#nushell nixpkgs#gh --command nu

# Refresh the GitHub repository metadata snapshot consumed by the static OSS page.

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

def fetch-project [project: record]: nothing -> record {
    let repo = github-repository $project
    let metadata = (
        ^gh api $"repos/($repo)"
        --jq '{stars: .stargazers_count, primaryLanguage: .language}'
        | from json
    )
    print $"($repo): ($metadata.stars) stars, ($metadata.primaryLanguage | default 'unknown')"
    {
        repo: $repo
        stars: $metadata.stars
        primaryLanguage: $metadata.primaryLanguage
    }
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
