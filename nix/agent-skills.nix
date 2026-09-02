{ nixpkgs, agent-skills, root }:
system:
let
  pkgs = nixpkgs.legacyPackages.${system};
  agentLib = agent-skills.lib.agent-skills;
  localSkills = nixpkgs.lib.fileset.toSource {
    inherit root;
    fileset = ./../.agents/skills;
  };
  sources = {
    local = {
      path = localSkills;
      subdir = ".agents/skills";
    };
  };
  catalog = agentLib.discoverCatalog sources;
  allowlist = agentLib.allowlistFor {
    inherit catalog sources;
    enableAll = true;
  };
  selection = agentLib.selectSkills {
    inherit catalog sources allowlist;
    skills = { };
  };
  bundle = agentLib.mkBundle {
    inherit pkgs selection;
    name = "ryoppippi-com-agent-skills-bundle";
  };
  localTargets = {
    claude = agentLib.defaultLocalTargets.claude // {
      enable = true;
      structure = "link";
    };
  };
  installLocal = agentLib.mkLocalInstallScript {
    inherit pkgs bundle;
    targets = localTargets;
  };
  syncAgentSkills = pkgs.writeShellApplication {
    name = "sync-agent-skills";
    runtimeInputs = [ installLocal ];
    text = ''
      root="''${AGENT_SKILLS_ROOT:-$PWD}"
      target="$root/.claude/skills"
      if [ -L "$target" ]; then
        unlink "$target"
      elif [ -e "$target" ]; then
        echo "$target already exists as a directory." >&2
        echo "Remove it before syncing Nix-managed agent skills." >&2
        exit 1
      fi
      exec skills-install-local "$@" >/dev/null
    '';
  };
in
{
  inherit bundle syncAgentSkills;
}
