
{
  description = "A new Flake for a Node.js project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    deploy-rs = {
      url = "github:serokell/deploy-rs";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, deploy-rs }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            deploy-rs.packages.${system}.deploy-rs
          ];
        };
      }) // {
        deploy.nodes.app = {
            hostname = "app";
            profiles.system.packages = with nixpkgs; [
                nodejs
            ];
        };
        deploy.packages.x86_64-linux.app = deploy-rs.lib.x86_64-linux.activate.nixos self.deploy.nodes.app;
    };
}
