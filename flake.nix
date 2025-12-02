{
  "description": "A new Flake for a Node.js project",
  "inputs": {
    "nixpkgs": {
      "url": "github:NixOS/nixpkgs/nixos-unstable"
    },
    "flake-utils": {
      "url": "github:numtide/flake-utils"
    }
  },
  "outputs": { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20  # Use a recent Node.js version
            # Add other system-level dependencies here if needed
          ];
        };
      }
    )
}
