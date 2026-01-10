{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ];

      perSystem = { pkgs, ... }: {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            pnpm_10
            wrangler
            gitleaks
            typos
            typos-lsp
            svelte-language-server # Svelte
            yaml-language-server # YAML
          ];

          shellHook = ''
            # Install dependencies only if node_modules/.pnpm/lock.yaml is older than pnpm-lock.yaml
            if [ ! -f node_modules/.pnpm/lock.yaml ] || [ pnpm-lock.yaml -nt node_modules/.pnpm/lock.yaml ]; then
              echo "📦 Installing dependencies..."
              pnpm install --frozen-lockfile
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
      };
    };
}
