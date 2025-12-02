{
  description = "A new Flake for a Node.js project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    deploy-rs.url = "github:serokell/deploy-rs";
  };

  outputs = { self, nixpkgs, flake-utils, deploy-rs }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_22
            self.packages.${system}.deploy
          ];
        };

        packages.deploy = deploy-rs.lib.${system}.mkDeploy {
          # This assumes your Next.js app listens on port 3000 by default.
          # The deployment environment will map its external port to this one.
          ssh = {
            user = "root";
            host = "your-server-ip"; # This will be replaced by the deployment environment
          };
          
          # This defines what to copy to the server.
          # We're copying the whole project directory.
          copy = {
            sources = [ ./src ./public ./package.json ./package-lock.json ./next.config.ts ./tsconfig.json ];
            files = [ ];
          };

          # This tells deploy-rs how to build and run the app.
          profiles = {
            "production" = {
              user = "root";
              path = deploy-rs.lib.${system}.activate.nix-profile;
              script = ''
                # Install dependencies
                npm ci
                
                # Build the Next.js app
                npx next build
                
                # Start the app
                npx next start -p 3000
              '';
            };
          };

          magic = {
            ssh = true;
            copy = true;
          };
        };
      });
}
