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
            buildInputs = [
              pkgs.nodejs_24
              nix-vite-plus.packages.${system}.vp
            ] ++ (with pkgs; [
              gitleaks
              typos
              typos-lsp
              svelte-language-server # Svelte
              yaml-language-server # YAML
              gh
              wrangler
            ]);

            shellHook = ''
              # Install dependencies only if node_modules/.pnpm/lock.yaml is older than pnpm-lock.yaml
              if [ ! -f node_modules/.pnpm/lock.yaml ] || [ pnpm-lock.yaml -nt node_modules/.pnpm/lock.yaml ]; then
                echo "📦 Installing dependencies..."
                vp install --frozen-lockfile
              fi

              # Generate .env from .env.example if needed
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
