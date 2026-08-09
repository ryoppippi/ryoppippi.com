{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nix-vite-plus = {
      url = "github:ryoppippi/nix-vite-plus";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { nixpkgs, nix-vite-plus, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShellNoCC {
            # The driver's browser revision must match the repo's `playwright`,
            # so bump the nixpkgs input alongside it.
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";

            buildInputs = [
              pkgs.nodejs_24
              nix-vite-plus.packages.${system}.vp
            ] ++ (with pkgs; [
              gitleaks
              typos
              typos-lsp
              svelte-language-server
              yaml-language-server
              gh
              wrangler
            ]);

            shellHook = ''
              if [ ! -f node_modules/.pnpm/lock.yaml ] || [ pnpm-lock.yaml -nt node_modules/.pnpm/lock.yaml ]; then
                echo "📦 Installing dependencies..."
                vp install --frozen-lockfile
              fi

              if [ -f .env.example ]; then
                if [ ! -f .env ]; then
                  echo "📝 Generating .env from .env.example..."
                  cp .env.example .env
                elif [ .env.example -nt .env ]; then
                  echo "⚠️  .env.example has been updated, please review and update .env manually"
                fi
              fi
            '';
          };
        }
      );
    };
}
