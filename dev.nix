{ pkgs, ... }:

{
  # Add dependencies to this list
  packages = [
    pkgs.nodejs
    pkgs.deploy-rs
  ];
}
