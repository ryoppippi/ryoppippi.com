{
  description = "zenn env";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
  };

  outputs = inputs@{ flake-parts, nixpkgs, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      imports = [
        inputs.treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
      ];

      perSystem = { config, pkgs, ... }: {
        treefmt = {
          projectRootFile = "flake.nix";
          programs.typos.enable = true;
        };

        pre-commit.settings.hooks = {
          treefmt.enable = true;
          treefmt.package = config.treefmt.build.wrapper;
          gitleaks = {
            enable = true;
            name = "gitleaks";
            entry = "${pkgs.gitleaks}/bin/gitleaks git --pre-commit --redact --staged --verbose";
            pass_filenames = false;
          };
        };

        devShells.default = pkgs.mkShell {
          inputsFrom = [ config.pre-commit.devShell ];
          buildInputs = with pkgs; [
            zenn-cli
            just
            typos
            typos-lsp
          ];
        };
      };
    };
}
